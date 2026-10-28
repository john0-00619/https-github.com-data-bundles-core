import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Gmail API send email
async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string,
  senderEmail: string
): Promise<{ messageId?: string; error?: string }> {
  // Build MIME email message
  const boundary = "boundary_" + Math.random().toString(36).substring(2);
  const emailParts = [
    `From: ${senderEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    htmlBody.replace(/<[^>]*>/g, ""), // Plain text fallback
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    htmlBody,
    "",
    `--${boundary}--`,
  ];

  const email = emailParts.join("\r\n");

  // Base64url encode
  const base64Email = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: base64Email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { error: errorData?.error?.message || `Gmail API error (${response.status})` };
  }

  const result = await response.json();
  return { messageId: result.id };
}

// Refresh Google OAuth token
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token?: string; error?: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { error: "Google OAuth credentials not configured on server" };
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { error: errorData?.error_description || "Token refresh failed" };
  }

  const data = await response.json();
  return { access_token: data.access_token };
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, campaignId, recipients, subject, message } = body;

    if (!recipients?.length || !subject || !message) {
      return NextResponse.json({ error: "Recipients, subject and message are required" }, { status: 400 });
    }

    // Get user's Gmail connection
    const { data: gmailToken } = await supabaseAdmin
      .from("user_gmail_tokens")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!gmailToken) {
      return NextResponse.json({
        error: "Gmail not connected",
        code: "GMAIL_NOT_CONNECTED",
        instructions: "Connect your Gmail account first."
      }, { status: 400 });
    }

    // Check token expiry and refresh if needed
    let accessToken = gmailToken.access_token;
    if (gmailToken.token_expiry && new Date(gmailToken.token_expiry) < new Date()) {
      if (!gmailToken.refresh_token) {
        return NextResponse.json({
          error: "Gmail session expired",
          code: "GMAIL_TOKEN_EXPIRED",
          instructions: "Reconnect your Gmail account."
        }, { status: 401 });
      }

      const refreshResult = await refreshGoogleToken(gmailToken.refresh_token);
      if (refreshResult.error) {
        return NextResponse.json({
          error: "Failed to refresh Gmail access",
          details: refreshResult.error,
          code: "GMAIL_REFRESH_FAILED",
        }, { status: 401 });
      }

      accessToken = refreshResult.access_token!;

      // Update stored token
      await supabaseAdmin
        .from("user_gmail_tokens")
        .update({
          access_token: accessToken,
          token_expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", gmailToken.id);
    }

    // Send emails one by one (individual, not bulk — privacy)
    const results: { recipient: string; success: boolean; messageId?: string; error?: string }[] = [];

    for (const recipient of recipients) {
      const personalisedMessage = message
        .replace(/\{\{name\}\}/g, recipient.name || "")
        .replace(/\{\{church\}\}/g, "our church")
        .replace(/\{\{date\}\}/g, new Date().toLocaleDateString("en-GB"));

      const result = await sendGmailMessage(
        accessToken,
        recipient.email,
        subject,
        personalisedMessage,
        gmailToken.gmail_email || user.email!
      );

      results.push({
        recipient: recipient.email,
        success: !!result.messageId,
        messageId: result.messageId,
        error: result.error,
      });

      // Rate limit: small delay between sends to respect Gmail quotas
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const sentCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    // Update campaign
    if (campaignId) {
      await supabaseAdmin
        .from("campaigns")
        .update({
          status: failedCount === 0 ? "completed" : failedCount === recipients.length ? "failed" : "completed",
          sent_count: sentCount,
          failed_count: failedCount,
          completed_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      // Update recipient records
      for (const r of results) {
        await supabaseAdmin
          .from("campaign_recipients")
          .update({
            status: r.success ? "sent" : "failed",
            sent_at: r.success ? new Date().toISOString() : null,
            provider_reference: r.messageId || null,
            error_message: r.error || null,
          })
          .eq("campaign_id", campaignId)
          .eq("recipient_email", r.recipient);
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      results,
    });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error.message,
    }, { status: 500 });
  }
}

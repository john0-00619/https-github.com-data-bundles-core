import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Server-side only — never expose these to the client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
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
    const { organizationId, campaignId, recipients, message } = body;

    if (!recipients?.length || !message) {
      return NextResponse.json({ error: "Recipients and message are required" }, { status: 400 });
    }

    // Verify user belongs to organization
    const { data: membership } = await supabaseAdmin
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
    }

    // Get TextBee API key from org settings
    const { data: settings } = await supabaseAdmin
      .from("org_communication_settings")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle();

    const textbeeApiKey = settings?.textbee_api_key_encrypted;

    if (!textbeeApiKey) {
      return NextResponse.json({
        error: "TextBee API key not configured",
        code: "TEXTBEE_NOT_CONFIGURED",
        instructions: "Add your TextBee API key in Communication Settings. Get one free at https://textbee.dev"
      }, { status: 400 });
    }

    // Send SMS via TextBee API
    const textbeeResponse = await fetch("https://api.textbee.dev/api/v1/gateway/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": textbeeApiKey,
      },
      body: JSON.stringify({
        recipients: recipients.map((r: any) => r.phone),
        message,
        ...(settings?.textbee_device_id ? { deviceId: settings.textbee_device_id } : {}),
      }),
    });

    const textbeeResult = await textbeeResponse.json();

    if (!textbeeResponse.ok) {
      // Update campaign status
      if (campaignId) {
        await supabaseAdmin
          .from("campaigns")
          .update({
            status: "failed",
            error_message: textbeeResult.message || "TextBee API error",
            failed_count: recipients.length,
          })
          .eq("id", campaignId);

        // Mark all recipients as failed
        await supabaseAdmin
          .from("campaign_recipients")
          .update({
            status: "failed",
            error_message: textbeeResult.message || "TextBee API error",
            provider_status: JSON.stringify(textbeeResult),
          })
          .eq("campaign_id", campaignId);
      }

      return NextResponse.json({
        error: "SMS sending failed",
        details: textbeeResult.message || textbeeResult.error || "Unknown error",
        status: textbeeResponse.status,
      }, { status: 502 });
    }

    // Success — update campaign and recipients
    if (campaignId) {
      const sentCount = recipients.length;
      await supabaseAdmin
        .from("campaigns")
        .update({
          status: "completed",
          sent_count: sentCount,
          completed_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      // Update recipient records
      for (const recipient of recipients) {
        await supabaseAdmin
          .from("campaign_recipients")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_reference: textbeeResult.data?.smsBatchId || null,
            provider_status: JSON.stringify(textbeeResult.data),
          })
          .eq("campaign_id", campaignId)
          .eq("recipient_phone", recipient.phone);
      }
    }

    return NextResponse.json({
      success: true,
      sent: recipients.length,
      batchId: textbeeResult.data?.smsBatchId,
      message: textbeeResult.data?.message || "SMS queued for delivery",
    });
  } catch (error: any) {
    console.error("SMS send error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error.message,
    }, { status: 500 });
  }
}

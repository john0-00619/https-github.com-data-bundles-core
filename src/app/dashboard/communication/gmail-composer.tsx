"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Mail, Search, CheckCircle, XCircle, Users, AlertTriangle,
  Loader2, Send, Settings, RefreshCw, Link2, Unlink, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";

interface GmailComposerProps {
  organizationId: string;
  members: any[];
  departments: any[];
  userId: string;
}

export function GmailComposer({ organizationId, members, departments, userId }: GmailComposerProps) {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [configLoading, setConfigLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [manualEmails, setManualEmails] = useState("");
  const [bccMode, setBccMode] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkGmailConnection();
  }, []);

  const checkGmailConnection = async () => {
    setConfigLoading(true);
    try {
      const { data } = await supabase
        .from("user_gmail_tokens")
        .select("gmail_email, is_active, token_expiry")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (data?.gmail_email) {
        setGmailConnected(true);
        setGmailEmail(data.gmail_email);
      } else {
        setGmailConnected(false);
      }
    } catch {
      setGmailConnected(false);
    }
    setConfigLoading(false);
  };

  const handleConnectGmail = async () => {
    setConnectLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/communication`,
        },
      });

      if (error) {
        alert("Failed to connect Gmail: " + error.message);
        setConnectLoading(false);
      }
      // User will be redirected to Google OAuth
    } catch (err: any) {
      alert("Failed to connect: " + err.message);
      setConnectLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await supabase
        .from("user_gmail_tokens")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      setGmailConnected(false);
      setGmailEmail("");
    } catch (err: any) {
      alert("Failed to disconnect: " + err.message);
    }
  };

  const membersWithEmail = useMemo(() => {
    return members.filter((m) => m.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email));
  }, [members]);

  const filteredMembers = useMemo(() => {
    let filtered = membersWithEmail;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(s) ||
          m.email?.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [membersWithEmail, search]);

  const manualRecipients = useMemo(() => {
    if (!manualEmails.trim()) return [];
    return manualEmails
      .split(/[\n,;]/)
      .map((e) => e.trim())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  }, [manualEmails]);

  const invalidEmails = useMemo(() => {
    if (!manualEmails.trim()) return [];
    return manualEmails
      .split(/[\n,;]/)
      .map((e) => e.trim())
      .filter((e) => e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  }, [manualEmails]);

  const allRecipients = useMemo(() => {
    const memberRecips = Array.from(selectedMembers).map((id) => {
      const m = members.find((mem) => mem.id === id);
      return { type: "member" as const, id: m?.id, name: `${m?.first_name} ${m?.last_name}`, email: m?.email };
    });
    const manualRecips = manualRecipients.map((email) => ({
      type: "manual" as const, id: undefined, name: email, email,
    }));
    return [...memberRecips, ...manualRecips];
  }, [selectedMembers, members, manualRecipients]);

  const toggleMember = (id: string) => {
    const next = new Set(selectedMembers);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedMembers(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedMembers);
    filteredMembers.forEach((m) => next.add(m.id));
    setSelectedMembers(next);
  };

  const personaliseMessage = (msg: string, recipient: { name: string; email: string }) => {
    return msg
      .replace(/\{\{name\}\}/g, recipient.name)
      .replace(/\{\{church\}\}/g, "our church")
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString("en-GB"));
  };

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Create campaign
      const { data: campaign } = await supabase
        .from("campaigns")
        .insert({
          organization_id: organizationId,
          name: `Email: ${subject}`,
          channel: "email",
          subject,
          message,
          status: "sending",
          total_recipients: allRecipients.length,
          pending_count: allRecipients.length,
          created_by: session.user.id,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (campaign) {
        const recipientRows = allRecipients.map((r) => ({
          campaign_id: campaign.id,
          member_id: r.id || null,
          recipient_name: r.name,
          recipient_email: r.email,
          status: "pending" as const,
        }));
        await supabase.from("campaign_recipients").insert(recipientRows);

        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            organizationId,
            campaignId: campaign.id,
            recipients: allRecipients,
            subject,
            message,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setSendResult({
            success: false,
            error: result.error,
            details: result.details,
            code: result.code,
          });
        } else {
          setSendResult({
            success: true,
            sent: result.sent,
            failed: result.failed,
            results: result.results,
          });
        }
      }
    } catch (err: any) {
      setSendResult({ success: false, error: err.message });
    }
    setSending(false);
  };

  const membersWithoutEmail = members.length - membersWithEmail.length;

  if (configLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Loader2 className="h-8 w-8 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking Gmail connection...</p>
        </CardContent>
      </Card>
    );
  }

  if (!gmailConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Connect Your Gmail</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mt-2">
                Connect your Gmail account to send professional emails directly from your inbox.
                Messages will be sent from your own Gmail address.
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-left max-w-lg mx-auto">
              <p className="text-sm font-medium text-gray-900 mb-2">What you get:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Send emails from your Gmail address</li>
                <li>✓ Messages appear in your Sent folder</li>
                <li>✓ Professional HTML email formatting</li>
                <li>✓ Personalized messages for each recipient</li>
                <li>✓ Respects Gmail sending quotas</li>
              </ul>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-left max-w-lg mx-auto">
              <p className="text-xs text-amber-700">
                <strong>Requirements:</strong> Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) must be configured
                as environment variables on the server. Contact your administrator if Gmail connection fails.
              </p>
            </div>

            <Button
              className="mx-auto"
              size="lg"
              onClick={handleConnectGmail}
              disabled={connectLoading}
            >
              {connectLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Connecting...</>
              ) : (
                <><Link2 className="h-4 w-4" />Connect Gmail Account</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sendResult) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            {sendResult.success ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">Email Campaign Complete</h3>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-green-700">✓ {sendResult.sent} sent</span>
                  {sendResult.failed > 0 && (
                    <span className="text-red-700">✗ {sendResult.failed} failed</span>
                  )}
                </div>
                {sendResult.results?.some((r: any) => !r.success) && (
                  <div className="max-w-md mx-auto text-left">
                    <p className="text-sm font-medium text-gray-900 mb-2">Failed recipients:</p>
                    {sendResult.results.filter((r: any) => !r.success).map((r: any, i: number) => (
                      <p key={i} className="text-xs text-red-600">{r.recipient}: {r.error}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">Email Sending Failed</h3>
                <p className="text-sm text-red-700">{sendResult.error}</p>
                {sendResult.code === "GMAIL_TOKEN_EXPIRED" && (
                  <Button variant="outline" onClick={handleConnectGmail}>
                    <RefreshCw className="h-4 w-4" />
                    Reconnect Gmail
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSendResult(null);
                setSubject("");
                setMessage("");
                setSelectedMembers(new Set());
                setManualEmails("");
              }}
            >
              Send Another Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-red-600" />
              Gmail Campaign
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="success">{gmailEmail}</Badge>
              <Button variant="ghost" size="sm" onClick={handleDisconnectGmail} title="Disconnect Gmail">
                <Unlink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject */}
          <Input
            label="Subject"
            placeholder="Email subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {/* Body */}
          <div>
            <Textarea
              label="Email Body (HTML supported)"
              placeholder="Write your email here. Use {{name}} for personalization."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Supports: {"{{name}}"}, {"{{church}}"}, {"{{date}}"} • HTML tags allowed
              </p>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recipients
              </h3>
              <Badge variant="default">{allRecipients.length} selected</Badge>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={bccMode}
                  onChange={(e) => setBccMode(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Send individual emails (recommended for privacy)
              </label>
            </div>

            <Textarea
              label="Manual Email Addresses (one per line)"
              placeholder={`john@example.com\njane@example.com`}
              value={manualEmails}
              onChange={(e) => setManualEmails(e.target.value)}
              rows={3}
            />
            {invalidEmails.length > 0 && (
              <p className="text-xs text-red-600">
                {invalidEmails.length} invalid email(s): {invalidEmails.join(", ")}
              </p>
            )}

            <div className="border border-gray-200 rounded-lg">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-8 pl-9 pr-4 rounded-lg border border-gray-300 text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllFiltered}>Select All</Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedMembers(new Set())}>Clear</Button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                {membersWithoutEmail > 0 && !search && (
                  <div className="px-3 py-2 bg-amber-50 text-xs text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {membersWithoutEmail} member(s) excluded — no valid email address
                  </div>
                )}
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No members with email addresses found</p>
                ) : (
                  filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(m.id)}
                          onChange={() => {}}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.first_name} {m.last_name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {allRecipients.length} recipient{allRecipients.length !== 1 ? "s" : ""} • From: {gmailEmail}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                disabled={allRecipients.length === 0 || !subject.trim() || !message.trim() || sending}
                onClick={() => setShowConfirm(true)}
              >
                {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send Email</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Email Preview" size="lg">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">From:</p>
            <p className="text-sm text-gray-900">{gmailEmail}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Subject:</p>
            <p className="text-sm text-gray-900">{subject || "(no subject)"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Body:</p>
            <div
              className="rounded-lg border border-gray-200 p-4 bg-white prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: message
                  ? personaliseMessage(message, { name: "John Doe", email: "john@example.com" })
                  : "<em>No content</em>"
              }}
            />
          </div>
          <p className="text-xs text-gray-500 italic">
            Preview shows personalized version with sample name. Each recipient will see their own name.
          </p>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Email Send">
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-medium text-red-900">
              Send email to {allRecipients.length} recipient{allRecipients.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-red-700 mt-1">
              From: {gmailEmail} • Subject: {subject}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {bccMode ? "Each recipient gets an individual email" : "All recipients in one email"}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Confirm & Send</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

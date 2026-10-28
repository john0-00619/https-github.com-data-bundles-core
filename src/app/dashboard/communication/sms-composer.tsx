"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Phone, Search, CheckCircle, XCircle, Users, AlertTriangle,
  Loader2, Send, Settings, RefreshCw, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";

interface SMSComposerProps {
  organizationId: string;
  members: any[];
  departments: any[];
}

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) cleaned = "233" + cleaned.substring(1);
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  return cleaned;
}

function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+\d{9,15}$/.test(normalized);
}

function countSMSSegments(message: string): { chars: number; segments: number } {
  const chars = message.length;
  // Standard SMS: 160 chars per segment (GSM-7), 70 for Unicode
  const hasUnicode = /[^\x00-\x7F]/.test(message);
  const segmentSize = hasUnicode ? 70 : 160;
  const segments = Math.ceil(chars / segmentSize) || 0;
  return { chars, segments };
}

export function SMSComposer({ organizationId, members, departments }: SMSComposerProps) {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [manualNumbers, setManualNumbers] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [textbeeConfigured, setTextbeeConfigured] = useState<boolean | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkTextBeeConfig();
  }, []);

  const checkTextBeeConfig = async () => {
    setConfigLoading(true);
    try {
      const { data } = await supabase
        .from("org_communication_settings")
        .select("textbee_configured, textbee_api_key_encrypted")
        .eq("organization_id", organizationId)
        .maybeSingle();

      setTextbeeConfigured(!!data?.textbee_configured && !!data?.textbee_api_key_encrypted);
    } catch {
      setTextbeeConfigured(false);
    }
    setConfigLoading(false);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try {
      const { error } = await supabase.from("org_communication_settings").upsert({
        organization_id: organizationId,
        textbee_api_key_encrypted: apiKey.trim(),
        textbee_configured: true,
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        setTextbeeConfigured(true);
        setShowSettings(false);
        setApiKey("");
      } else {
        alert("Failed to save API key: " + error.message);
      }
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
    setSavingKey(false);
  };

  const membersWithPhone = useMemo(() => {
    return members.filter((m) => m.phone && isValidPhone(m.phone));
  }, [members]);

  const filteredMembers = useMemo(() => {
    let filtered = membersWithPhone;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(s) ||
          m.phone?.includes(s)
      );
    }
    return filtered;
  }, [membersWithPhone, search]);

  const manualRecipients = useMemo(() => {
    if (!manualNumbers.trim()) return [];
    return manualNumbers.split(/[\n,;]/).map((n) => n.trim()).filter((n) => n && isValidPhone(n));
  }, [manualNumbers]);

  const invalidManualNumbers = useMemo(() => {
    if (!manualNumbers.trim()) return [];
    return manualNumbers.split(/[\n,;]/).map((n) => n.trim()).filter((n) => n && !isValidPhone(n));
  }, [manualNumbers]);

  const allRecipients = useMemo(() => {
    const memberRecips = Array.from(selectedMembers).map((id) => {
      const m = members.find((mem) => mem.id === id);
      return { type: "member" as const, id: m?.id, name: `${m?.first_name} ${m?.last_name}`, phone: normalizePhone(m?.phone || "") };
    });
    const manualRecips = manualRecipients.map((phone) => ({
      type: "manual" as const, id: undefined, name: phone, phone: normalizePhone(phone),
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

  const { chars, segments } = countSMSSegments(message);

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Create campaign record
      const { data: campaign } = await supabase
        .from("campaigns")
        .insert({
          organization_id: organizationId,
          name: `SMS - ${new Date().toLocaleDateString("en-GB")}`,
          channel: "sms",
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
        // Insert recipient records
        const recipientRows = allRecipients.map((r) => ({
          campaign_id: campaign.id,
          member_id: r.id || null,
          recipient_name: r.name,
          recipient_phone: r.phone,
          status: "pending" as const,
        }));
        await supabase.from("campaign_recipients").insert(recipientRows);

        // Call server-side API to send via TextBee
        const response = await fetch("/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            organizationId,
            campaignId: campaign.id,
            recipients: allRecipients,
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
            instructions: result.instructions,
          });
        } else {
          setSendResult({
            success: true,
            sent: result.sent,
            batchId: result.batchId,
            message: result.message,
          });
        }
      }
    } catch (err: any) {
      setSendResult({ success: false, error: err.message });
    }
    setSending(false);
  };

  const membersWithoutPhone = members.length - membersWithPhone.length;

  // Configuration required state
  if (configLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking SMS configuration...</p>
        </CardContent>
      </Card>
    );
  }

  if (!textbeeConfigured) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SMS Setup Required</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mt-2">
                KingdomFlow uses <strong>TextBee</strong> to send SMS messages through an Android phone.
                You need a free TextBee API key to enable SMS sending.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-left max-w-lg mx-auto">
              <p className="text-sm font-medium text-blue-900 mb-2">Setup Steps:</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Sign up at <a href="https://textbee.dev" target="_blank" rel="noopener" className="underline font-medium">textbee.dev</a> (free plan available)</li>
                <li>Install the TextBee app on an Android phone with a SIM</li>
                <li>Generate an API key from your TextBee dashboard</li>
                <li>Paste the API key below</li>
              </ol>
            </div>

            <div className="max-w-sm mx-auto space-y-3">
              <Input
                label="TextBee API Key"
                type="password"
                placeholder="Enter your TextBee API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim() || savingKey}
              >
                {savingKey ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save API Key & Enable SMS"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Send result
  if (sendResult) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            {sendResult.success ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">SMS Sent Successfully</h3>
                <p className="text-sm text-gray-600">
                  {sendResult.sent} message{sendResult.sent !== 1 ? "s" : ""} sent via TextBee
                </p>
                {sendResult.batchId && (
                  <p className="text-xs text-gray-500">Batch ID: {sendResult.batchId}</p>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">SMS Sending Failed</h3>
                <p className="text-sm text-red-700">{sendResult.error}</p>
                {sendResult.details && (
                  <p className="text-xs text-gray-500">{sendResult.details}</p>
                )}
                {sendResult.code === "TEXTBEE_NOT_CONFIGURED" && (
                  <Button variant="outline" onClick={() => setShowSettings(true)}>
                    <Settings className="h-4 w-4" />
                    Configure TextBee
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSendResult(null);
                setMessage("");
                setSelectedMembers(new Set());
                setManualNumbers("");
              }}
            >
              Send Another Message
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
              <Phone className="h-5 w-5 text-blue-600" />
              SMS Messaging
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="success">TextBee Connected</Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message */}
          <div>
            <Textarea
              label="SMS Message"
              placeholder="Type your SMS message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {segments} SMS segment{segments !== 1 ? "s" : ""} • {chars} characters
                {segments > 1 && <span className="text-amber-600"> (costs {segments} SMS credits per recipient)</span>}
              </p>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Recipients
              </h3>
              <Badge variant="default">{allRecipients.length} selected</Badge>
            </div>

            <Textarea
              label="Manual Phone Numbers (one per line)"
              placeholder={`+233201234567\n+233207654321`}
              value={manualNumbers}
              onChange={(e) => setManualNumbers(e.target.value)}
              rows={3}
            />
            {invalidManualNumbers.length > 0 && (
              <p className="text-xs text-red-600">
                {invalidManualNumbers.length} invalid number(s): {invalidManualNumbers.join(", ")}
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
                {membersWithoutPhone > 0 && !search && (
                  <div className="px-3 py-2 bg-amber-50 text-xs text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {membersWithoutPhone} member(s) excluded — no valid phone number
                  </div>
                )}
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No members with phone numbers found</p>
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
                          <p className="text-xs text-gray-500">{m.phone}</p>
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
              {allRecipients.length} recipient{allRecipients.length !== 1 ? "s" : ""} • {segments} SMS segment{segments !== 1 ? "s" : ""} each
            </div>
            <Button
              disabled={allRecipients.length === 0 || !message.trim() || sending}
              onClick={() => setShowConfirm(true)}
            >
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send SMS</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm SMS Send">
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900">
              Send SMS to {allRecipients.length} recipient{allRecipients.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {segments} segment{segments !== 1 ? "s" : ""} × {allRecipients.length} recipient{allRecipients.length !== 1 ? "s" : ""} = {segments * allRecipients.length} total SMS
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Message:</p>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">{message}</div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Confirm & Send</>}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="SMS Settings">
        <div className="space-y-4">
          <Input
            label="TextBee API Key"
            type="password"
            placeholder="Enter new API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Get your API key from <a href="https://textbee.dev" target="_blank" rel="noopener" className="text-indigo-600 underline">textbee.dev</a>
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={handleSaveApiKey} disabled={!apiKey.trim() || savingKey}>
              {savingKey ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

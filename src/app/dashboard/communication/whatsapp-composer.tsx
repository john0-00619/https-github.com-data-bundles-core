"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare, Search, CheckCircle, XCircle, ExternalLink,
  ChevronRight, ChevronLeft, Users, AlertTriangle, Loader2, Send, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";

interface WhatsAppComposerProps {
  organizationId: string;
  members: any[];
  departments: any[];
}

function normalizePhone(phone: string): string {
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");
  // If starts with 0, replace with country code (Ghana: 233)
  if (cleaned.startsWith("0")) {
    cleaned = "233" + cleaned.substring(1);
  }
  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\d{9,15}$/.test(normalized);
}

export function WhatsAppComposer({ organizationId, members, departments }: WhatsAppComposerProps) {
  const [step, setStep] = useState<"compose" | "review" | "sending">("compose");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [manualNumbers, setManualNumbers] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentRecipientIndex, setCurrentRecipientIndex] = useState(0);
  const [sendingProgress, setSendingProgress] = useState<{ total: number; opened: number; remaining: number }>({ total: 0, opened: 0, remaining: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const supabase = createClient();

  // Members with valid phone numbers
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
          m.phone?.includes(s) ||
          m.email?.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [membersWithPhone, search]);

  // Parse manual numbers
  const manualRecipients = useMemo(() => {
    if (!manualNumbers.trim()) return [];
    return manualNumbers
      .split(/[\n,;]/)
      .map((n) => n.trim())
      .filter((n) => n && isValidPhone(n));
  }, [manualNumbers]);

  const invalidManualNumbers = useMemo(() => {
    if (!manualNumbers.trim()) return [];
    return manualNumbers
      .split(/[\n,;]/)
      .map((n) => n.trim())
      .filter((n) => n && !isValidPhone(n));
  }, [manualNumbers]);

  // All recipients (members + manual)
  const allRecipients = useMemo(() => {
    const memberRecipients = Array.from(selectedMembers).map((id) => {
      const m = members.find((mem) => mem.id === id);
      return {
        type: "member" as const,
        id: m?.id,
        name: `${m?.first_name} ${m?.last_name}`,
        phone: normalizePhone(m?.phone || ""),
      };
    });

    const manualRecips = manualRecipients.map((phone) => ({
      type: "manual" as const,
      id: undefined,
      name: phone,
      phone: normalizePhone(phone),
    }));

    return [...memberRecipients, ...manualRecips];
  }, [selectedMembers, members, manualRecipients]);

  const toggleMember = (id: string) => {
    const next = new Set(selectedMembers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMembers(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedMembers);
    filteredMembers.forEach((m) => next.add(m.id));
    setSelectedMembers(next);
  };

  const deselectAll = () => {
    setSelectedMembers(new Set());
  };

  const personaliseMessage = (msg: string, recipient: { name: string; phone: string }) => {
    return msg
      .replace(/\{\{name\}\}/g, recipient.name)
      .replace(/\{\{church\}\}/g, "our church")
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString("en-GB"));
  };

  const handleStartSending = async () => {
    if (allRecipients.length === 0 || !message.trim()) return;

    setShowConfirm(false);
    setStep("sending");
    setSendingProgress({
      total: allRecipients.length,
      opened: 0,
      remaining: allRecipients.length,
    });

    // Log campaign to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .insert({
          organization_id: organizationId,
          name: `WhatsApp - ${new Date().toLocaleDateString("en-GB")}`,
          channel: "whatsapp",
          message,
          status: "sending",
          total_recipients: allRecipients.length,
          pending_count: allRecipients.length,
          created_by: user.id,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (campaign) {
        // Log recipients
        const recipientRows = allRecipients.map((r) => ({
          campaign_id: campaign.id,
          member_id: r.id || null,
          recipient_name: r.name,
          recipient_phone: `+${r.phone}`,
          status: "pending" as const,
        }));
        await supabase.from("campaign_recipients").insert(recipientRows);
      }
    }

    // Open first WhatsApp link
    openWhatsAppForRecipient(0);
  };

  const openWhatsAppForRecipient = (index: number) => {
    if (index >= allRecipients.length) {
      setSendingProgress((prev) => ({ ...prev, remaining: 0 }));
      return;
    }

    const recipient = allRecipients[index];
    const personalisedMsg = personaliseMessage(message, recipient);
    const waUrl = `https://wa.me/${recipient.phone}?text=${encodeURIComponent(personalisedMsg)}`;

    window.open(waUrl, "_blank");

    setSendingProgress((prev) => ({
      ...prev,
      opened: index + 1,
      remaining: allRecipients.length - (index + 1),
    }));
    setCurrentRecipientIndex(index + 1);
  };

  const membersWithoutPhone = members.length - membersWithPhone.length;

  if (step === "sending") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Sending Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {sendingProgress.opened} / {sendingProgress.total}
              </div>
              <p className="text-sm text-gray-500 mt-1">WhatsApp windows opened</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(sendingProgress.opened / sendingProgress.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Important notice */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    How WhatsApp Click-to-Chat Works
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Each recipient opens in a new WhatsApp window with your message pre-filled.
                    You must tap <strong>Send</strong> in each WhatsApp window to actually deliver the message.
                    KingdomFlow cannot send WhatsApp messages automatically without the WhatsApp Business API.
                  </p>
                </div>
              </div>
            </div>

            {/* Next / Continue */}
            {sendingProgress.remaining > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 text-center">
                  Next: <strong>{allRecipients[currentRecipientIndex]?.name}</strong> (+{allRecipients[currentRecipientIndex]?.phone})
                </p>
                <Button
                  className="w-full"
                  onClick={() => openWhatsAppForRecipient(currentRecipientIndex)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open WhatsApp for Next Recipient ({sendingProgress.remaining} remaining)
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <p className="font-medium text-gray-900">All recipients opened!</p>
                <p className="text-sm text-gray-500">
                  Remember to tap Send in each WhatsApp window to deliver the messages.
                </p>
                <Button variant="outline" onClick={() => {
                  setStep("compose");
                  setMessage("");
                  setSelectedMembers(new Set());
                  setManualNumbers("");
                  setCurrentRecipientIndex(0);
                }}>
                  Start New Message
                </Button>
              </div>
            )}

            {/* Recipients list */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {allRecipients.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    {i < sendingProgress.opened ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-gray-900">{r.name}</span>
                  </div>
                  <span className="text-gray-500">+{r.phone}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Broadcast
          </CardTitle>
          <p className="text-sm text-gray-500">
            Compose a message and select recipients. WhatsApp will open for each recipient with your message pre-filled.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message composition */}
          <div>
            <Textarea
              label="Message"
              placeholder="Type your message here... Use {{name}} for personalisation."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Supports: {"{{name}}"}, {"{{church}}"}, {"{{date}}"}
              </p>
              <p className="text-xs text-gray-500">{message.length} characters</p>
            </div>
          </div>

          {/* Recipient selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Recipients
              </h3>
              <Badge variant="default">{allRecipients.length} selected</Badge>
            </div>

            {/* Manual numbers */}
            <div>
              <Textarea
                label="Manual Phone Numbers (one per line, international format)"
                placeholder={`+233201234567\n+233207654321\n+12025550123`}
                value={manualNumbers}
                onChange={(e) => setManualNumbers(e.target.value)}
                rows={3}
              />
              {invalidManualNumbers.length > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {invalidManualNumbers.length} invalid number(s): {invalidManualNumbers.join(", ")}
                </p>
              )}
              {manualRecipients.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {manualRecipients.length} valid manual number(s)
                </p>
              )}
            </div>

            {/* Members from database */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-3 border-b border-gray-200 space-y-2">
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
                  <Button variant="outline" size="sm" onClick={selectAllFiltered}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Clear
                  </Button>
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
                  <p className="text-sm text-gray-500 text-center py-4">
                    No members with phone numbers found
                  </p>
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
                          <p className="text-sm font-medium text-gray-900">
                            {m.first_name} {m.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{m.phone}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Review & Send */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {allRecipients.length} recipient{allRecipients.length !== 1 ? "s" : ""} • WhatsApp click-to-chat
            </div>
            <Button
              disabled={allRecipients.length === 0 || !message.trim()}
              onClick={() => setShowConfirm(true)}
            >
              <Send className="h-4 w-4" />
              Review & Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm WhatsApp Broadcast"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-medium text-green-900 mb-1">About to open WhatsApp for {allRecipients.length} recipient(s)</p>
            <p className="text-sm text-green-700">
              A WhatsApp window will open for each recipient with your message pre-filled.
              You will need to tap Send in each window.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Message Preview:</p>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {message}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartSending}>
              <ExternalLink className="h-4 w-4" />
              Continue in WhatsApp
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



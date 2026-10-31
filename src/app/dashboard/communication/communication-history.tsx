"use client";

import { useState, useEffect } from "react";
import {
  History, Search, MessageSquare, Phone, Mail, Eye,
  ChevronDown, ChevronRight, RefreshCw, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface CommunicationHistoryProps {
  organizationId: string;
}

const channelIcons: Record<string, any> = {
  whatsapp: MessageSquare,
  sms: Phone,
  email: Mail,
};

const channelColors: Record<string, string> = {
  whatsapp: "text-green-600 bg-green-50",
  sms: "text-blue-600 bg-blue-50",
  email: "text-red-600 bg-red-50",
};

const statusVariants: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
  completed: "success",
  sending: "info",
  failed: "danger",
  draft: "secondary",
  cancelled: "warning",
};

export function CommunicationHistory({ organizationId }: CommunicationHistoryProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignRecipients, setCampaignRecipients] = useState<any[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("*, creator:profiles(full_name)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(50);
      setCampaigns(data || []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
    setLoading(false);
  };

  const loadRecipients = async (campaignId: string) => {
    setRecipientsLoading(true);
    try {
      const { data } = await supabase
        .from("campaign_recipients")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at");
      setCampaignRecipients(data || []);
    } catch (err) {
      console.error("Failed to load recipients:", err);
    }
    setRecipientsLoading(false);
  };

  const handleViewCampaign = async (campaign: any) => {
    setSelectedCampaign(campaign);
    await loadRecipients(campaign.id);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === "all" || c.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const recipientStatusVariants: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
    sent: "success",
    delivered: "success",
    failed: "danger",
    pending: "info",
    skipped: "warning",
    bounced: "danger",
    opened: "success",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Communication History
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadCampaigns}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <Select
              options={[
                { value: "all", label: "All Channels" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "sms", label: "SMS" },
                { value: "email", label: "Email" },
              ]}
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>

          {/* Campaigns list */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <EmptyState
              icon={<History className="h-12 w-12" />}
              title="No campaigns yet"
              description="Your communication campaigns will appear here after sending."
            />
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign) => {
                const Icon = channelIcons[campaign.channel] || History;
                const colorClass = channelColors[campaign.channel] || "text-gray-600 bg-gray-50";
                return (
                  <div
                    key={campaign.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {campaign.subject || campaign.message?.substring(0, 80)}
                            {campaign.message?.length > 80 ? "..." : ""}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>{formatDateTime(campaign.created_at)}</span>
                            <span>by {campaign.creator?.full_name || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={statusVariants[campaign.status] || "secondary"}>
                          {campaign.status}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-green-600">✓ {campaign.sent_count || 0}</span>
                          {campaign.failed_count > 0 && (
                            <span className="text-red-600">✗ {campaign.failed_count}</span>
                          )}
                          <span className="text-gray-400">/ {campaign.total_recipients}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCampaign(campaign)}
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Detail Modal */}
      <Modal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        title={selectedCampaign?.name || "Campaign Details"}
        size="xl"
      >
        {selectedCampaign && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Channel</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{selectedCampaign.channel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={statusVariants[selectedCampaign.status] || "secondary"}>
                  {selectedCampaign.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sent</p>
                <p className="text-sm font-medium text-green-700">{selectedCampaign.sent_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Failed</p>
                <p className="text-sm font-medium text-red-700">{selectedCampaign.failed_count || 0}</p>
              </div>
            </div>

            {selectedCampaign.subject && (
              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="text-sm text-gray-900">{selectedCampaign.subject}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-1">Message</p>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {selectedCampaign.message}
              </div>
            </div>

            {selectedCampaign.error_message && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{selectedCampaign.error_message}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">
                Recipients ({campaignRecipients.length})
              </p>
              {recipientsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {campaignRecipients.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {r.recipient_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.recipient_phone || r.recipient_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={recipientStatusVariants[r.status] || "secondary"}>
                          {r.status}
                        </Badge>
                        {r.error_message && (
                          <span className="text-xs text-red-600 max-w-[200px] truncate" title={r.error_message}>
                            {r.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

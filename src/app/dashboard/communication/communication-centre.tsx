"use client";

import { useState, useCallback } from "react";
import {
  MessageSquare, Mail, Phone, History, Send, Users, Search,
  CheckCircle, XCircle, AlertTriangle, Loader2, ExternalLink,
  ChevronRight, Clock, RefreshCw, Trash2, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { WhatsAppComposer } from "./whatsapp-composer";
import { SMSComposer } from "./sms-composer";
import { GmailComposer } from "./gmail-composer";
import { CommunicationHistory } from "./communication-history";

interface CommunicationCentreProps {
  organizationId: string;
  members: any[];
  departments: any[];
  userId: string;
}

export function CommunicationCentre({
  organizationId,
  members,
  departments,
  userId,
}: CommunicationCentreProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const channelCards = [
    {
      id: "whatsapp",
      icon: MessageSquare,
      title: "WhatsApp Broadcast",
      description: "Send messages via WhatsApp click-to-chat",
      color: "bg-green-50 text-green-600 border-green-200",
      iconColor: "text-green-600",
      status: "ready",
      statusLabel: "Ready",
      statusVariant: "success" as const,
    },
    {
      id: "sms",
      icon: Phone,
      title: "SMS Messaging",
      description: "Send SMS via TextBee gateway",
      color: "bg-blue-50 text-blue-600 border-blue-200",
      iconColor: "text-blue-600",
      status: "check",
      statusLabel: "Check Config",
      statusVariant: "info" as const,
    },
    {
      id: "email",
      icon: Mail,
      title: "Gmail Campaigns",
      description: "Send emails from your Gmail account",
      color: "bg-red-50 text-red-600 border-red-200",
      iconColor: "text-red-600",
      status: "check",
      statusLabel: "Connect Gmail",
      statusVariant: "warning" as const,
    },
    {
      id: "history",
      icon: History,
      title: "Communication History",
      description: "View past campaigns and delivery reports",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      iconColor: "text-purple-600",
      status: "ready",
      statusLabel: "View",
      statusVariant: "secondary" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communication Centre</h1>
        <p className="text-gray-600">
          Reach your members via WhatsApp, SMS, or Email
        </p>
      </div>

      <Tabs
        defaultTab="overview"
        onChange={setActiveTab}
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channelCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setActiveTab(card.id)}
                    className="text-left"
                  >
                    <Card className={`hover:shadow-md transition-shadow border ${card.color.split(" ")[2]}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color.split(" ").slice(0, 2).join(" ")}`}>
                              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{card.title}</h3>
                              <p className="text-sm text-gray-500">{card.description}</p>
                            </div>
                          </div>
                          <Badge variant={card.statusVariant}>{card.statusLabel}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            ),
          },
          {
            id: "whatsapp",
            label: "WhatsApp",
            content: (
              <WhatsAppComposer
                organizationId={organizationId}
                members={members}
                departments={departments}
              />
            ),
          },
          {
            id: "sms",
            label: "SMS",
            content: (
              <SMSComposer
                organizationId={organizationId}
                members={members}
                departments={departments}
              />
            ),
          },
          {
            id: "email",
            label: "Gmail",
            content: (
              <GmailComposer
                organizationId={organizationId}
                members={members}
                departments={departments}
                userId={userId}
              />
            ),
          },
          {
            id: "history",
            label: "History",
            content: (
              <CommunicationHistory organizationId={organizationId} />
            ),
          },
        ]}
      />
    </div>
  );
}

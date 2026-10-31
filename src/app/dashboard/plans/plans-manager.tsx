"use client";

import { CheckCircle, AlertTriangle, Star, Zap, Crown, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlansManagerProps {
  plans: any[];
  currentPlan: any;
  organization: any;
  userRole: string;
}

export function PlansManager({ plans, currentPlan, organization, userRole }: PlansManagerProps) {
  const contactCount = organization?.contact_count || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600">KingdomFlow is free for all churches and ministries</p>
      </div>

      {/* Free for Everyone Banner */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">100% Free — No Limits, No Subscriptions</h2>
              <p className="text-indigo-100 mt-1">
                KingdomFlow is completely free for all churches, ministries, and fellowships.
                All features are unlocked. No credit card required. No contact limits. No hidden fees.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-600" />
            Your Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">{contactCount}</p>
              <p className="text-xs text-gray-500">Contacts</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">∞</p>
              <p className="text-xs text-gray-500">Contact Limit</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">∞</p>
              <p className="text-xs text-gray-500">Branches</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">∞</p>
              <p className="text-xs text-gray-500">Team Members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Features Included */}
      <Card>
        <CardHeader>
          <CardTitle>All Features Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Member Management",
              "Visitor Tracking & Follow-Up",
              "Attendance (QR Check-In)",
              "Events & Calendar",
              "Giving & Finance",
              "Communication Centre",
              "WhatsApp, SMS & Email",
              "AI Assistant",
              "Forms & Registrations",
              "Reports & Analytics",
              "CSV Import & Export",
              "Audit Logs",
              "Multi-Branch Support",
              "Department Management",
              "Prayer Requests",
              "Announcements",
              "Role-Based Access (10 Roles)",
              "Notifications",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm p-2">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Channels */}
      <Card>
        <CardHeader>
          <CardTitle>External Communication Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Contact members and visitors directly using their installed apps. KingdomFlow opens
            the external app for you to review and send — no API keys or paid services required.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="font-medium text-green-700 text-sm">WhatsApp</p>
              <p className="text-xs text-green-600 mt-1">Opens WhatsApp app</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="font-medium text-blue-700 text-sm">SMS</p>
              <p className="text-xs text-blue-600 mt-1">Opens messaging app</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="font-medium text-red-700 text-sm">Gmail</p>
              <p className="text-xs text-red-600 mt-1">Opens email compose</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="font-medium text-gray-700 text-sm">Phone Call</p>
              <p className="text-xs text-gray-600 mt-1">Opens dialer</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

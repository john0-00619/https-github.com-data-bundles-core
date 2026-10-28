"use client";

import { CheckCircle, AlertTriangle, ArrowRight, Crown, Zap, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PlansManagerProps {
  plans: any[];
  currentPlan: any;
  organization: any;
  userRole: string;
}

const planIcons: Record<string, any> = {
  free: Star,
  pro: Zap,
  premium: Crown,
};

const planColors: Record<string, string> = {
  free: "border-gray-200",
  pro: "border-indigo-500 ring-2 ring-indigo-500",
  premium: "border-amber-400 ring-2 ring-amber-400",
};

export function PlansManager({ plans, currentPlan, organization, userRole }: PlansManagerProps) {
  const canManage = ["owner", "admin"].includes(userRole);
  const contactCount = organization?.contact_count || 0;
  const maxContacts = currentPlan?.max_contacts || 500;
  const usagePercent = maxContacts > 0 ? Math.min(100, Math.round((contactCount / maxContacts) * 100)) : 0;
  const isApproachingLimit = usagePercent >= 80;
  const isOverLimit = contactCount > maxContacts;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600">Manage your plan and view usage</p>
      </div>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Usage</span>
            <Badge variant={currentPlan?.slug === "premium" ? "warning" : currentPlan?.slug === "pro" ? "default" : "secondary"}>
              {currentPlan?.name || "Free"} Plan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Contacts */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Contacts</span>
                <span className={`text-sm font-medium ${isOverLimit ? "text-red-600" : isApproachingLimit ? "text-amber-600" : "text-gray-900"}`}>
                  {contactCount} / {maxContacts.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isOverLimit ? "bg-red-500" : isApproachingLimit ? "bg-amber-500" : "bg-indigo-600"}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {isOverLimit && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  Over limit — upgrade to add more contacts
                </div>
              )}
              {isApproachingLimit && !isOverLimit && (
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  Approaching limit — consider upgrading
                </div>
              )}
            </div>

            {/* Feature Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Email Sending", enabled: currentPlan?.email_sending },
                { label: "SMS Sending", enabled: currentPlan?.sms_sending },
                { label: "AI Assistant", enabled: currentPlan?.ai_assistant },
                { label: "Advanced Reports", enabled: currentPlan?.advanced_reports },
              ].map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 text-sm">
                  {feature.enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={feature.enabled ? "text-gray-900" : "text-gray-400"}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.slug] || Star;
          const isCurrent = currentPlan?.slug === plan.slug;
          const colorClass = planColors[plan.slug] || planColors.free;

          return (
            <Card key={plan.id} className={`relative ${isCurrent ? colorClass : "border-gray-200"}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 mb-2">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price_monthly === 0 ? "Free" : formatCurrency(plan.price_monthly)}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-sm text-gray-500">/month</span>
                  )}
                </div>
                {plan.price_yearly > 0 && (
                  <p className="text-xs text-gray-500">
                    or {formatCurrency(plan.price_yearly)}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Contacts</span>
                    <span className="font-medium">{plan.max_contacts.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Branches</span>
                    <span className="font-medium">{plan.max_branches}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Team Members</span>
                    <span className="font-medium">{plan.max_users}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {(plan.features || []).map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {!isCurrent && canManage && (
                  <Button
                    className="w-full"
                    variant={plan.slug === "premium" ? "default" : "outline"}
                    disabled={plan.slug !== "free"}
                  >
                    {plan.price_monthly === 0 ? "Downgrade" : "Upgrade"}
                    {plan.price_monthly > 0 && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                )}
                {!canManage && !isCurrent && (
                  <p className="text-xs text-gray-500 text-center">
                    Only owners and admins can change plans
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Payment Processing</p>
              <p className="text-sm text-amber-700 mt-1">
                Paid plan upgrades are not yet available. Payment processing (Paystack) will be enabled after explicit authorization.
                Contact support to discuss Pro or Premium plan access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

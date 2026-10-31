import { createClient } from "@/lib/supabase/server";

export interface PlanLimits {
  max_contacts: number;
  max_branches: number;
  max_users: number;
  email_sending: boolean;
  sms_sending: boolean;
  ai_assistant: boolean;
  advanced_reports: boolean;
}

export interface PlanEnforcementResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

/**
 * Get the current plan for an organization
 */
export async function getOrganizationPlan(organizationId: string) {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("*, plan:subscription_plans(*)")
    .eq("id", organizationId)
    .single();

  return org;
}

/**
 * Check if an organization can add more contacts
 * All features are free — no limits enforced
 */
export async function canAddContact(organizationId: string): Promise<PlanEnforcementResult> {
  return { allowed: true };
}

/**
 * Check if an organization can add more branches
 * All features are free — no limits enforced
 */
export async function canAddBranch(organizationId: string): Promise<PlanEnforcementResult> {
  return { allowed: true };
}

/**
 * Check if an organization can add more users
 * All features are free — no limits enforced
 */
export async function canAddUser(organizationId: string): Promise<PlanEnforcementResult> {
  return { allowed: true };
}

/**
 * Check if a feature is enabled for the organization's plan
 * All features are free — always enabled
 */
export async function isFeatureEnabled(
  organizationId: string,
  feature: keyof Omit<PlanLimits, "max_contacts" | "max_branches" | "max_users">
): Promise<PlanEnforcementResult> {
  return { allowed: true };
}

/**
 * Get plan enforcement status for an organization
 */
export async function getPlanEnforcementStatus(organizationId: string) {
  const supabase = await createClient();
  const org = await getOrganizationPlan(organizationId);
  if (!org?.plan) {
    return {
      plan: null,
      limits: {
        contacts: { current: 0, max: 500, percentage: 0 },
        branches: { current: 0, max: 1, percentage: 0 },
        users: { current: 0, max: 3, percentage: 0 },
      },
      features: {
        email_sending: false,
        sms_sending: false,
        ai_assistant: false,
        advanced_reports: false,
      },
    };
  }

  const { count: branchCount } = await supabase
    .from("branches")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  const { count: userCount } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  const contactCount = org.contact_count || 0;

  return {
    plan: org.plan,
    limits: {
      contacts: {
        current: contactCount,
        max: org.plan.max_contacts,
        percentage: Math.round((contactCount / org.plan.max_contacts) * 100),
      },
      branches: {
        current: branchCount || 0,
        max: org.plan.max_branches,
        percentage: Math.round(((branchCount || 0) / org.plan.max_branches) * 100),
      },
      users: {
        current: userCount || 0,
        max: org.plan.max_users,
        percentage: Math.round(((userCount || 0) / org.plan.max_users) * 100),
      },
    },
    features: {
      email_sending: org.plan.email_sending,
      sms_sending: org.plan.sms_sending,
      ai_assistant: org.plan.ai_assistant,
      advanced_reports: org.plan.advanced_reports,
    },
  };
}

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
 */
export async function canAddContact(organizationId: string): Promise<PlanEnforcementResult> {
  const org = await getOrganizationPlan(organizationId);
  if (!org?.plan) {
    return { allowed: true }; // Default to free plan behavior
  }

  const contactCount = org.contact_count || 0;
  const maxContacts = org.plan.max_contacts;

  if (contactCount >= maxContacts) {
    return {
      allowed: false,
      reason: `Contact limit reached (${maxContacts}). Upgrade your plan to add more contacts.`,
      limit: maxContacts,
      current: contactCount,
    };
  }

  return { allowed: true };
}

/**
 * Check if an organization can add more branches
 */
export async function canAddBranch(organizationId: string): Promise<PlanEnforcementResult> {
  const supabase = await createClient();
  const org = await getOrganizationPlan(organizationId);
  if (!org?.plan) {
    return { allowed: true };
  }

  const { count } = await supabase
    .from("branches")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  const branchCount = count || 0;
  const maxBranches = org.plan.max_branches;

  if (branchCount >= maxBranches) {
    return {
      allowed: false,
      reason: `Branch limit reached (${maxBranches}). Upgrade your plan to add more branches.`,
      limit: maxBranches,
      current: branchCount,
    };
  }

  return { allowed: true };
}

/**
 * Check if an organization can add more users
 */
export async function canAddUser(organizationId: string): Promise<PlanEnforcementResult> {
  const supabase = await createClient();
  const org = await getOrganizationPlan(organizationId);
  if (!org?.plan) {
    return { allowed: true };
  }

  const { count } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  const userCount = count || 0;
  const maxUsers = org.plan.max_users;

  if (userCount >= maxUsers) {
    return {
      allowed: false,
      reason: `Team member limit reached (${maxUsers}). Upgrade your plan to add more team members.`,
      limit: maxUsers,
      current: userCount,
    };
  }

  return { allowed: true };
}

/**
 * Check if a feature is enabled for the organization's plan
 */
export async function isFeatureEnabled(
  organizationId: string,
  feature: keyof Omit<PlanLimits, "max_contacts" | "max_branches" | "max_users">
): Promise<PlanEnforcementResult> {
  const org = await getOrganizationPlan(organizationId);
  if (!org?.plan) {
    return {
      allowed: false,
      reason: `This feature requires a paid plan. Upgrade to access ${feature}.`,
    };
  }

  if (!org.plan[feature]) {
    return {
      allowed: false,
      reason: `${feature} is not available on your current plan. Upgrade to access this feature.`,
    };
  }

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

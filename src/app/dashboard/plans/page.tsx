export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PlansManager } from "./plans-manager";

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");
  const { data: membership } = await supabase
    .from("organization_members").select("*, organization:organizations(*, plan:subscription_plans(*))")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");

  const { data: plans } = await supabase
    .from("subscription_plans").select("*").eq("is_active", true).order("price_monthly");

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: membership.organization?.name }}
    >
      <PlansManager
        plans={plans || []}
        currentPlan={membership.organization?.plan}
        organization={membership.organization}
        userRole={membership.role}
      />
    </DashboardLayout>
  );
}

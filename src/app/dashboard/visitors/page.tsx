export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { VisitorsManager } from "./visitors-manager";

export default async function VisitorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");
  const { data: membership } = await supabase
    .from("organization_members").select("*, organization:organizations(*, plan:subscription_plans(*))")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");

  const orgId = membership.organization_id;

  const { data: visitors } = await supabase
    .from("visitors").select("*, branch:branches(name), follow_up:profiles(full_name)")
    .eq("organization_id", orgId).order("created_at", { ascending: false });

  const { data: branches } = await supabase
    .from("branches").select("id, name").eq("organization_id", orgId).eq("status", "active");

  const { data: members } = await supabase
    .from("members").select("id, first_name, last_name").eq("organization_id", orgId).eq("status", "active").order("first_name");

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: membership.organization?.name }}
    >
      <VisitorsManager
        visitors={visitors || []}
        branches={branches || []}
        members={members || []}
        organizationId={orgId}
      />
    </DashboardLayout>
  );
}

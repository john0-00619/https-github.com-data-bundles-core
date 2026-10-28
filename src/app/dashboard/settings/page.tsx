export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SettingsManager } from "./settings-manager";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");
  const { data: membership } = await supabase
    .from("organization_members").select("*, organization:organizations(*)")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");
  const { data: branches } = await supabase
    .from("branches").select("*").eq("organization_id", membership.organization_id).order("name");
  const { data: orgMembers } = await supabase
    .from("organization_members").select("*, profile:profiles(full_name, email)")
    .eq("organization_id", membership.organization_id);

  return (
    <DashboardLayout user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }} organization={{ name: membership.organization?.name }}>
      <SettingsManager
        organization={membership.organization}
        branches={branches || []}
        members={orgMembers || []}
        currentUserId={user.id}
        currentRole={membership.role}
      />
    </DashboardLayout>
  );
}

export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GivingManager } from "./giving-manager";

export default async function GivingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");

  const { data: membership } = await supabase
    .from("organization_members").select("*, organization:organizations(*)")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");

  const orgId = membership.organization_id;

  const { data: records } = await supabase
    .from("giving_records").select("*, member:members(first_name, last_name)")
    .eq("organization_id", orgId).order("given_at", { ascending: false }).limit(50);

  const { data: members } = await supabase
    .from("members").select("id, first_name, last_name")
    .eq("organization_id", orgId).eq("status", "active");

  const { data: branches } = await supabase
    .from("branches").select("id, name").eq("organization_id", orgId).eq("status", "active");

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: membership.organization?.name }}
    >
      <GivingManager records={records || []} members={members || []} branches={branches || []} organizationId={orgId} />
    </DashboardLayout>
  );
}

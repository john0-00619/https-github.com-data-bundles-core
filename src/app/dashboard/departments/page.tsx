export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DepartmentsManager } from "./departments-manager";

export default async function DepartmentsPage() {
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

  const { data: departments } = await supabase
    .from("departments").select("*, members:department_members(count)")
    .eq("organization_id", orgId).order("name");

  const { data: members } = await supabase
    .from("members").select("id, first_name, last_name")
    .eq("organization_id", orgId).eq("status", "active");

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: membership.organization?.name }}
    >
      <DepartmentsManager departments={departments || []} members={members || []} organizationId={orgId} />
    </DashboardLayout>
  );
}

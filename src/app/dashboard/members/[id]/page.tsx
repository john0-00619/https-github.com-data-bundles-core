export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MemberDetail } from "./member-detail";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");

  const { data: membership } = await supabase
    .from("organization_members").select("*, organization:organizations(*)")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");

  const { data: member } = await supabase
    .from("members").select("*, branch:branches(name), departments:department_members(department:departments(id, name))")
    .eq("id", id).eq("organization_id", membership.organization_id).maybeSingle();

  if (!member) notFound();

  return (
    <DashboardLayout user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }} organization={{ name: membership.organization?.name }}>
      <MemberDetail member={member} />
    </DashboardLayout>
  );
}

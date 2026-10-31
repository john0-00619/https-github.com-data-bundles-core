export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MembersList } from "./members-list";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("*, organization:organizations(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/dashboard/onboarding");

  const orgId = membership.organization_id;

  const { data: members, count } = await supabase
    .from("members")
    .select("*, branch:branches(name)", { count: "exact" })
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .eq("organization_id", orgId)
    .eq("status", "active");

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", orgId)
    .eq("status", "active");

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: membership.organization?.name }}
    >
      <MembersList
        members={members || []}
        branches={branches || []}
        departments={departments || []}
        totalCount={count || 0}
        organizationId={orgId}
        userRole={membership.role}
      />
    </DashboardLayout>
  );
}

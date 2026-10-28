export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportsView } from "./reports-view";

export default async function ReportsPage() {
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

  // Gather stats for reports
  const [
    { count: memberCount },
    { count: eventCount },
    { data: givingData },
    { data: attendanceData },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("giving_records").select("amount, given_at, category").eq("organization_id", orgId),
    supabase.from("attendance_sessions").select("id, session_date, records:attendance_records(count)").eq("organization_id", orgId).order("session_date", { ascending: false }).limit(12),
  ]);

  return (
    <DashboardLayout user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }} organization={{ name: membership.organization?.name }}>
      <ReportsView
        memberCount={memberCount || 0}
        eventCount={eventCount || 0}
        givingData={givingData || []}
        attendanceData={attendanceData || []}
      />
    </DashboardLayout>
  );
}

export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuditLogViewer } from "./audit-log-viewer";

export default async function AuditLogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");
  const { data: membership } = await supabase
    .from("organization_members").select("*, organization:organizations(*)")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");

  // Only owners and admins can view audit logs
  if (!["owner", "admin"].includes(membership.role)) {
    redirect("/dashboard");
  }

  const orgId = membership.organization_id;

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, user:profiles(full_name, email)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: membership.organization?.name }}
    >
      <AuditLogViewer logs={logs || []} />
    </DashboardLayout>
  );
}

export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EventsManager } from "./events-manager";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("*, organization:organizations(*)")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");

  const orgId = membership.organization_id;

  const { data: events } = await supabase
    .from("events")
    .select("*, branch:branches(name)")
    .eq("organization_id", orgId)
    .order("start_time", { ascending: true });

  const { data: branches } = await supabase
    .from("branches").select("id, name").eq("organization_id", orgId).eq("status", "active");

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: membership.organization?.name }}
    >
      <EventsManager events={events || []} branches={branches || []} organizationId={orgId} />
    </DashboardLayout>
  );
}

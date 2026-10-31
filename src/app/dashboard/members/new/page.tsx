export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewMemberPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");
  const { data: membership } = await supabase
    .from("organization_members").select("*, organization:organizations(*)")
    .eq("user_id", user.id).eq("is_active", true).limit(1).maybeSingle();
  if (!membership) redirect("/dashboard/onboarding");

  // Redirect to members page with add modal open
  redirect("/dashboard/members");
}

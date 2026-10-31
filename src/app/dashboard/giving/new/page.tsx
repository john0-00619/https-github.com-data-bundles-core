export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewGivingPage() {
  // This page redirects to the giving page which has a record modal
  redirect("/dashboard/giving");
}

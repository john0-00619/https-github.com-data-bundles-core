export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewEventPage() {
  // This page redirects to the events page which has a create modal
  // In a more complex app, this could be a full page form
  redirect("/dashboard/events");
}

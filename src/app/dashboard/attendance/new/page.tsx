export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewAttendancePage() {
  // Redirects to the attendance page with create session modal
  redirect("/dashboard/attendance");
}

export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvitationAccept } from "./invitation-accept";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">This invitation link is missing a valid token.</p>
          <a href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: invitation } = await supabase
    .from("invitations")
    .select("*, organization:organizations(name)")
    .eq("token", token)
    .eq("status", "pending")
    .maybeSingle();

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600 mb-6">This invitation has expired, already been accepted, or is invalid.</p>
          <a href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  return <InvitationAccept invitation={invitation} user={user} />;
}

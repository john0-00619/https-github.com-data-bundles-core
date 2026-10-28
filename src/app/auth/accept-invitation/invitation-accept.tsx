"use client";

import { useState } from "react";
import { Church, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface InvitationAcceptProps {
  invitation: any;
  user: any;
}

export function InvitationAccept({ invitation, user }: InvitationAcceptProps) {
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleAccept = async () => {
    setAccepting(true);
    setError("");
    try {
      if (!user) {
        // Redirect to login with callback
        window.location.href = `/auth/login?redirect=/auth/accept-invitation?token=${invitation.token}`;
        return;
      }

      // Check if email matches
      if (user.email !== invitation.email) {
        setError(`This invitation was sent to ${invitation.email}. Please sign in with that email address.`);
        setAccepting(false);
        return;
      }

      // Accept invitation
      const { error: acceptError } = await supabase.from("organization_members").insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
        is_active: true,
      });

      if (acceptError) throw acceptError;

      // Mark invitation as accepted
      await supabase
        .from("invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      setAccepted(true);
    } catch (err: any) {
      setError("Failed to accept invitation: " + err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h1>
          <p className="text-gray-600 mb-6">
            You've joined <strong>{invitation.organization?.name}</strong> as a{" "}
            <Badge variant="default">{invitation.role}</Badge>.
          </p>
          <Button onClick={() => (window.location.href = "/dashboard")}>
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <Church className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">You're Invited!</h1>
          <p className="text-gray-600">
            You've been invited to join <strong>{invitation.organization?.name}</strong>
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Organization</span>
            <span className="font-medium">{invitation.organization?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Role</span>
            <Badge variant="default">{invitation.role}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Invited Email</span>
            <span className="font-medium">{invitation.email}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!user ? (
          <div className="space-y-3">
            <Button onClick={handleAccept} className="w-full" disabled={accepting}>
              Sign In to Accept
            </Button>
            <p className="text-xs text-gray-500 text-center">
              You'll be redirected to sign in, then can accept this invitation.
            </p>
          </div>
        ) : (
          <Button onClick={handleAccept} className="w-full" disabled={accepting}>
            {accepting ? "Accepting..." : "Accept Invitation"}
          </Button>
        )}
      </div>
    </div>
  );
}

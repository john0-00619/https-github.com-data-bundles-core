"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Church, CheckCircle, XCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function CheckInContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "search" | "checking" | "success" | "error" | "expired">("loading");
  const [session, setSession] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    if (!sessionId || !token) {
      setStatus("error");
      setMessage("Invalid check-in link. Please scan the QR code again.");
      return;
    }

    const { data, error } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !data) {
      setStatus("error");
      setMessage("This check-in session is no longer valid.");
      return;
    }

    if (data.qr_token !== token) {
      setStatus("error");
      setMessage("Invalid check-in token. Please scan the QR code again.");
      return;
    }

    if (data.qr_expires_at && new Date(data.qr_expires_at) < new Date()) {
      setStatus("expired");
      setMessage("This check-in session has expired. Please ask for a new QR code.");
      return;
    }

    setSession(data);

    const { data: memberList } = await supabase
      .from("members")
      .select("id, first_name, last_name, phone")
      .eq("organization_id", data.organization_id)
      .eq("status", "active")
      .order("first_name");

    setMembers(memberList || []);
    setStatus("search");
  };

  const handleCheckIn = async (memberId: string, memberName: string) => {
    setStatus("checking");
    try {
      const { data: existing } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("session_id", sessionId)
        .eq("member_id", memberId)
        .maybeSingle();

      if (existing) {
        setMessage(`${memberName} is already checked in!`);
        setStatus("success");
        return;
      }

      const { error } = await supabase.from("attendance_records").insert({
        session_id: sessionId,
        member_id: memberId,
        check_in_method: "self",
        checked_in_at: new Date().toISOString(),
      });

      if (error) {
        setMessage("Check-in failed. Please try again or ask a leader for help.");
        setStatus("error");
        return;
      }

      setMessage(`${memberName} checked in successfully! God bless you.`);
      setStatus("success");
    } catch {
      setMessage("Check-in failed. Please try again.");
      setStatus("error");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      search === "" ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
  );

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Church className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">KingdomFlow</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Self Check-In</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {status === "loading" && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Validating check-in...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-700 font-medium">{message}</p>
          </div>
        )}

        {status === "expired" && (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
              <XCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-yellow-700 font-medium">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">{message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setStatus("search");
                setMessage("");
                setSearch("");
              }}
            >
              Check In Another Person
            </Button>
          </div>
        )}

        {status === "search" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">{session?.title}</p>
              <p className="text-xs text-gray-500">Find your name below and tap to check in</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredMembers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No members found. Ask a leader to add you to the directory.
                </p>
              ) : (
                filteredMembers.slice(0, 20).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleCheckIn(member.id, `${member.first_name} ${member.last_name}`)}
                    className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 transition-colors border border-gray-100"
                  >
                    <p className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </p>
                    {member.phone && <p className="text-xs text-gray-500">{member.phone}</p>}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {status === "checking" && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking you in...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <Suspense
        fallback={
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading check-in...</p>
          </div>
        }
      >
        <CheckInContent />
      </Suspense>
    </div>
  );
}

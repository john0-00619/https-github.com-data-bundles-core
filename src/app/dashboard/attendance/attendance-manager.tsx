"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Users, Check, Search, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AttendanceManagerProps {
  sessions: any[];
  members: { id: string; first_name: string; last_name: string; email?: string; phone?: string }[];
  branches: { id: string; name: string }[];
  organizationId: string;
}

export function AttendanceManager({
  sessions,
  members,
  branches,
  organizationId,
}: AttendanceManagerProps) {
  const [showNewSession, setShowNewSession] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [checkIns, setCheckIns] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    session_date: new Date().toISOString().split("T")[0],
    branch_id: "",
  });
  const supabase = createClient();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const qrToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert({
          organization_id: organizationId,
          title: newSession.title,
          session_date: newSession.session_date,
          branch_id: newSession.branch_id || null,
          qr_token: qrToken,
          qr_expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setShowNewSession(false);
      setNewSession({
        title: "",
        session_date: new Date().toISOString().split("T")[0],
        branch_id: "",
      });
      setActiveSession(data);
    } catch (err) {
      alert("Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async (memberId: string) => {
    if (!activeSession || checkIns.has(memberId)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("attendance_records").insert({
        session_id: activeSession.id,
        member_id: memberId,
        check_in_method: "manual",
        checked_in_by: user.id,
        checked_in_at: new Date().toISOString(),
      });

      if (error) throw error;

      setCheckIns(new Set([...checkIns, memberId]));
    } catch (err) {
      alert("Failed to check in member");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      search === "" ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Track attendance for services and events</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/attendance/qr">
            <Button variant="outline">
              <QrCode className="h-4 w-4" />
              QR Check-In
            </Button>
          </Link>
          <Button onClick={() => setShowNewSession(true)}>
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

      {activeSession ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeSession.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(activeSession.session_date)} •{" "}
                  <span className="font-medium text-indigo-600">
                    {checkIns.size} checked in
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveSession(null);
                    setCheckIns(new Set());
                  }}
                >
                  Done
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search member to check in..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            {filteredMembers.map((member) => {
              const isCheckedIn = checkIns.has(member.id);
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">
                      {member.first_name[0]}{member.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.phone || member.email || "No contact"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isCheckedIn ? "secondary" : "default"}
                    onClick={() => handleCheckIn(member.id)}
                    disabled={isCheckedIn}
                  >
                    {isCheckedIn ? (
                      <>
                        <Check className="h-4 w-4" />
                        Present
                      </>
                    ) : (
                      "Check In"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white">
              <EmptyState
                icon={<Calendar className="h-12 w-12" />}
                title="No attendance sessions"
                description="Create your first attendance session to start tracking."
                action={
                  <Button onClick={() => setShowNewSession(true)}>
                    <Plus className="h-4 w-4" />
                    Create Session
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(session.session_date)} •{" "}
                          {session.records?.[0]?.count || 0} attendees
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSession(session)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showNewSession}
        onClose={() => setShowNewSession(false)}
        title="New Attendance Session"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <Input
            label="Session Title"
            placeholder="e.g., Sunday Service, Bible Study"
            value={newSession.title}
            onChange={(e) =>
              setNewSession({ ...newSession, title: e.target.value })
            }
            required
          />
          <Input
            label="Date"
            type="date"
            value={newSession.session_date}
            onChange={(e) =>
              setNewSession({ ...newSession, session_date: e.target.value })
            }
            required
          />
          <Select
            label="Branch"
            options={[
              { value: "", label: "All Branches" },
              ...branches.map((b) => ({ value: b.id, label: b.name })),
            ]}
            value={newSession.branch_id}
            onChange={(e) =>
              setNewSession({ ...newSession, branch_id: e.target.value })
            }
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewSession(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

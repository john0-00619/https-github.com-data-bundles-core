"use client";

import { useState } from "react";
import { Plus, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FollowUpsManagerProps {
  followups: any[];
  members: { id: string; first_name: string; last_name: string }[];
  organizationId: string;
}

export function FollowUpsManager({ followups, members, organizationId }: FollowUpsManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "visitor", priority: "medium", member_id: "", due_date: "" });
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("follow_ups").insert({
        organization_id: organizationId, title: form.title, description: form.description || null,
        type: form.type, priority: form.priority, member_id: form.member_id || null,
        due_date: form.due_date || null, status: "open", created_by: user.id,
      });
      if (error) throw error;
      setShowNew(false);
      setForm({ title: "", description: "", type: "visitor", priority: "medium", member_id: "", due_date: "" });
      window.location.reload();
    } catch { alert("Failed to create follow-up"); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("follow_ups").update({
      status, completed_at: status === "completed" ? new Date().toISOString() : null,
    }).eq("id", id);
    if (!error) window.location.reload();
  };

  const open = followups.filter((f) => f.status === "open" || f.status === "in_progress");
  const completed = followups.filter((f) => f.status === "completed" || f.status === "cancelled");

  const priorityVariant: Record<string, "danger" | "warning" | "info" | "secondary"> = {
    urgent: "danger", high: "warning", medium: "info", low: "secondary",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-Ups</h1>
          <p className="text-gray-600">Track visitors, new believers and pastoral care</p>
        </div>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />New Follow-Up</Button>
      </div>

      {followups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={<UserCheck className="h-12 w-12" />}
            title="No follow-ups"
            description="Track visitors and pastoral care tasks."
            action={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Create Follow-Up</Button>}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Open ({open.length})</h2>
              <div className="space-y-3">
                {open.map((f) => (
                  <div key={f.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{f.title}</h3>
                          <Badge variant={priorityVariant[f.priority] || "secondary"}>{f.priority}</Badge>
                          <Badge variant="secondary">{f.type.replace("_", " ")}</Badge>
                        </div>
                        {f.description && <p className="text-sm text-gray-600 mb-2">{f.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {f.member && <span>For: {f.member.first_name} {f.member.last_name}</span>}
                          {f.due_date && <span>Due: {formatDate(f.due_date)}</span>}
                        </div>
                      </div>
                      <Select
                        options={[
                          { value: "open", label: "Open" }, { value: "in_progress", label: "In Progress" },
                          { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" },
                        ]}
                        value={f.status}
                        onChange={(e) => handleStatusChange(f.id, e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Completed ({completed.length})</h2>
              <div className="space-y-2">
                {completed.slice(0, 5).map((f) => (
                  <div key={f.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 opacity-70">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-700 line-through">{f.title}</h3>
                      <Badge variant="secondary">{f.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Follow-Up" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" options={[
              { value: "visitor", label: "Visitor" }, { value: "new_believer", label: "New Believer" },
              { value: "absent_member", label: "Absent Member" }, { value: "pastoral_care", label: "Pastoral Care" },
              { value: "prayer_request", label: "Prayer Request" }, { value: "counselling", label: "Counselling" },
            ]} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <Select label="Priority" options={[
              { value: "low", label: "Low" }, { value: "medium", label: "Medium" },
              { value: "high", label: "High" }, { value: "urgent", label: "Urgent" },
            ]} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Member" options={[{ value: "", label: "None" }, ...members.map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))]} value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} />
            <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Follow-Up"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

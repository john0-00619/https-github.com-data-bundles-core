"use client";

import { useState } from "react";
import { Plus, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface PrayerRequestsManagerProps {
  requests: any[];
  organizationId: string;
}

export function PrayerRequestsManager({ requests, organizationId }: PrayerRequestsManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", is_public: true });
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("prayer_requests").insert({
        organization_id: organizationId, title: form.title, content: form.content,
        is_public: form.is_public, is_answered: false, created_by: user.id,
      });
      if (error) throw error;
      setShowNew(false);
      setForm({ title: "", content: "", is_public: true });
      window.location.reload();
    } catch { alert("Failed to submit prayer request"); }
    finally { setSaving(false); }
  };

  const handleMarkAnswered = async (id: string) => {
    const { error } = await supabase.from("prayer_requests").update({
      is_answered: true, answered_at: new Date().toISOString(),
    }).eq("id", id);
    if (!error) window.location.reload();
  };

  const active = requests.filter((r) => !r.is_answered);
  const answered = requests.filter((r) => r.is_answered);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
          <p className="text-gray-600">Share and track prayer needs</p>
        </div>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />New Request</Button>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={<Heart className="h-12 w-12" />}
            title="No prayer requests"
            description="Submit prayer requests for your church community."
            action={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Submit Request</Button>}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="space-y-3">
              {active.map((req) => (
                <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{req.title}</h3>
                    <div className="flex gap-2">
                      {req.is_public ? <Badge variant="info">Public</Badge> : <Badge variant="secondary">Private</Badge>}
                      <Button size="sm" variant="outline" onClick={() => handleMarkAnswered(req.id)}>
                        <Check className="h-4 w-4" />Answered
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{req.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {req.member && <span>By: {req.member.first_name} {req.member.last_name}</span>}
                    <span>{formatDate(req.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {answered.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Answered Prayers ({answered.length})</h2>
              <div className="space-y-2">
                {answered.slice(0, 5).map((req) => (
                  <div key={req.id} className="rounded-lg border border-green-100 bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <h3 className="font-medium text-gray-700">{req.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Prayer Request">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Prayer Request" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} required />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Make this request visible to all members</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit Request"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Bell, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AnnouncementsManagerProps {
  announcements: any[];
  organizationId: string;
}

export function AnnouncementsManager({ announcements, organizationId }: AnnouncementsManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", audience: "all", is_pinned: false });
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("announcements").insert({
        organization_id: organizationId, title: form.title, content: form.content,
        audience: form.audience, is_pinned: form.is_pinned, published_at: new Date().toISOString(),
        created_by: user.id,
      });
      if (error) throw error;
      setShowNew(false);
      setForm({ title: "", content: "", audience: "all", is_pinned: false });
      window.location.reload();
    } catch { alert("Failed to create announcement"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Share news and updates with your church</p>
        </div>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />New Announcement</Button>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={<Bell className="h-12 w-12" />}
            title="No announcements"
            description="Share news and updates with your church community."
            action={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Create Announcement</Button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {a.is_pinned && <Pin className="h-4 w-4 text-indigo-600" />}
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                </div>
                <Badge variant="secondary">{a.audience.replace("_", " ")}</Badge>
              </div>
              <p className="text-gray-700 mb-2">{a.content}</p>
              <p className="text-xs text-gray-500">{formatDate(a.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Announcement" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} required />
          <Select label="Audience" options={[
            { value: "all", label: "All Members" }, { value: "leaders", label: "Leaders Only" },
          ]} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Pin this announcement</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

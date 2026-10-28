"use client";

import { useState } from "react";
import { Plus, FileText, Eye, Edit, Trash2, Send, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FormsManagerProps {
  forms: any[];
  organizationId: string;
  userRole: string;
}

const statusVariants: Record<string, "default" | "success" | "secondary" | "warning"> = {
  draft: "secondary",
  published: "success",
  archived: "warning",
};

export function FormsManager({ forms, organizationId, userRole }: FormsManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "draft" });
  const supabase = createClient();

  const canManage = ["owner", "admin", "secretary"].includes(userRole);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("forms").insert({
        organization_id: organizationId,
        title: form.title,
        description: form.description || null,
        schema: { fields: [{ name: "full_name", label: "Full Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: false }, { name: "phone", label: "Phone", type: "tel", required: false }, { name: "message", label: "Message", type: "textarea", required: false }] },
        status: form.status,
        created_by: user.id,
      });
      if (error) throw error;
      setShowNew(false);
      setForm({ title: "", description: "", status: "draft" });
      window.location.reload();
    } catch (err: any) {
      alert("Failed to create form: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string, status: string) => {
    const { error } = await supabase.from("forms").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-600">Create forms for registrations, feedback, and sign-ups</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Create Form</Button>
        )}
      </div>

      {forms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No forms yet"
            description="Create forms for event registrations, feedback, volunteer sign-ups and more."
            action={canManage ? <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Create First Form</Button> : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((f) => (
            <Card key={f.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  </div>
                  <Badge variant={statusVariants[f.status] || "secondary"}>{f.status}</Badge>
                </div>
                {f.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{f.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{f.submissions?.[0]?.count || 0} submissions</span>
                  <span>Created {formatDate(f.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  {f.status === "draft" && canManage && (
                    <Button size="sm" variant="outline" onClick={() => handlePublish(f.id, "published")} className="flex-1">
                      <Send className="h-3 w-3" />Publish
                    </Button>
                  )}
                  {f.status === "published" && canManage && (
                    <Button size="sm" variant="outline" onClick={() => handlePublish(f.id, "archived")} className="flex-1">
                      Archive
                    </Button>
                  )}
                  <Button size="sm" variant="ghost"><Eye className="h-3 w-3" />View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create Form">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Form Title" placeholder="e.g., Event Registration, Volunteer Sign-Up" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" placeholder="Brief description of this form's purpose" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Status" options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700">
            A default form template will be created with Name, Email, Phone, and Message fields. You can customize fields after creation.
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Form"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

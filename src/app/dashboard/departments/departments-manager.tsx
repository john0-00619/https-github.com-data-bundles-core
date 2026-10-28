"use client";

import { useState } from "react";
import { Plus, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

interface DepartmentsManagerProps {
  departments: any[];
  members: { id: string; first_name: string; last_name: string }[];
  organizationId: string;
}

export function DepartmentsManager({ departments, members, organizationId }: DepartmentsManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type: "department", leader_id: "" });
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("departments").insert({
        organization_id: organizationId,
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        type: form.type,
        leader_id: form.leader_id || null,
        status: "active",
      });
      if (error) throw error;
      setShowNew(false);
      setForm({ name: "", description: "", type: "department", leader_id: "" });
      window.location.reload();
    } catch {
      alert("Failed to create department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments & Groups</h1>
          <p className="text-gray-600">Manage ministries, departments and groups</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" />
          New Department
        </Button>
      </div>

      {departments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={<Building2 className="h-12 w-12" />}
            title="No departments yet"
            description="Create departments and groups to organize your ministry."
            action={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Create Department</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary">{dept.type.replace("_", " ")}</Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {dept.members?.[0]?.count || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{dept.name}</h3>
              {dept.description && <p className="text-sm text-gray-600 line-clamp-2">{dept.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create Department" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Department Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select
            label="Type"
            options={[
              { value: "department", label: "Department" },
              { value: "ministry", label: "Ministry" },
              { value: "fellowship", label: "Fellowship Group" },
              { value: "choir", label: "Choir / Worship Team" },
              { value: "outreach", label: "Outreach Team" },
              { value: "prayer_group", label: "Prayer Group" },
              { value: "custom", label: "Custom" },
            ]}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <Select
            label="Leader"
            options={[{ value: "", label: "Select leader..." }, ...members.map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))]}
            value={form.leader_id}
            onChange={(e) => setForm({ ...form, leader_id: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Department"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

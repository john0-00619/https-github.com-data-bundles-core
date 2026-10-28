"use client";

import { useState, useMemo } from "react";
import { Plus, Search, UserPlus, Phone, Mail, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface VisitorsManagerProps {
  visitors: any[];
  branches: { id: string; name: string }[];
  members: { id: string; first_name: string; last_name: string }[];
  organizationId: string;
}

const statusVariants: Record<string, "info" | "success" | "warning" | "danger" | "secondary"> = {
  new: "info",
  contacted: "warning",
  second_visit: "default" as any,
  converted: "success",
  lost: "danger",
};

export function VisitorsManager({ visitors, branches, members, organizationId }: VisitorsManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    branch_id: "", visit_date: new Date().toISOString().split("T")[0],
    invited_by: "", how_heard: "", notes: "", consent_given: true,
  });
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("visitors").insert({
        organization_id: organizationId,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null,
        phone: form.phone || null,
        branch_id: form.branch_id || null,
        visit_date: form.visit_date,
        invited_by: form.invited_by || null,
        how_heard: form.how_heard || null,
        notes: form.notes || null,
        consent_given: form.consent_given,
        created_by: user.id,
      });
      if (error) throw error;
      setShowNew(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", branch_id: "", visit_date: new Date().toISOString().split("T")[0], invited_by: "", how_heard: "", notes: "", consent_given: true });
      window.location.reload();
    } catch (err: any) {
      alert("Failed to register visitor: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("visitors").update({ follow_up_status: status, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) window.location.reload();
  };

  const handleConvertToMember = async (visitor: any) => {
    if (!confirm(`Convert ${visitor.first_name} ${visitor.last_name} to a member?`)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member, error: memberError } = await supabase.from("members").insert({
        organization_id: organizationId,
        first_name: visitor.first_name,
        last_name: visitor.last_name,
        email: visitor.email,
        phone: visitor.phone,
        branch_id: visitor.branch_id,
        status: "active",
        join_date: new Date().toISOString(),
        created_by: user.id,
      }).select().single();
      if (memberError) throw memberError;
      await supabase.from("visitors").update({ converted_to_member: true, member_id: member.id, follow_up_status: "converted", updated_at: new Date().toISOString() }).eq("id", visitor.id);
      window.location.reload();
    } catch (err: any) {
      alert("Conversion failed: " + err.message);
    }
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const matchesSearch = search === "" || `${v.first_name} ${v.last_name}`.toLowerCase().includes(search.toLowerCase()) || v.phone?.includes(search) || v.email?.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "all" || v.follow_up_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [visitors, search, statusFilter]);

  const stats = {
    total: visitors.length,
    new: visitors.filter((v) => v.follow_up_status === "new").length,
    contacted: visitors.filter((v) => v.follow_up_status === "contacted").length,
    converted: visitors.filter((v) => v.converted_to_member).length,
  };

  const columns = [
    {
      key: "name", header: "Visitor",
      render: (_: any, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-gray-500">{row.email || row.phone || "No contact"}</p>
        </div>
      ),
    },
    { key: "visit_date", header: "Visit Date", render: (val: string) => <span className="text-sm">{formatDate(val)}</span> },
    { key: "branch", header: "Branch", render: (_: any, row: any) => <span className="text-sm text-gray-600">{row.branch?.name || "—"}</span> },
    {
      key: "follow_up_status", header: "Status",
      render: (val: string) => <Badge variant={statusVariants[val] || "secondary"}>{val?.replace("_", " ")}</Badge>,
    },
    {
      key: "actions", header: "",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
          <Select
            options={[
              { value: "new", label: "New" }, { value: "contacted", label: "Contacted" },
              { value: "second_visit", label: "2nd Visit" }, { value: "converted", label: "Converted" }, { value: "lost", label: "Lost" },
            ]}
            value={row.follow_up_status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className="w-28 h-8 text-xs"
          />
          {!row.converted_to_member && (
            <Button variant="ghost" size="sm" onClick={() => handleConvertToMember(row)} title="Convert to member">
              <UserPlus className="h-4 w-4 text-indigo-600" />
            </Button>
          )}
          {row.converted_to_member && (
            <Badge variant="success">Member</Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-600">Register and track first-time visitors</p>
        </div>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Register Visitor</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Visitors", value: stats.total, color: "text-gray-900" },
          { label: "New", value: stats.new, color: "text-blue-600" },
          { label: "Contacted", value: stats.contacted, color: "text-amber-600" },
          { label: "Converted", value: stats.converted, color: "text-green-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search visitors..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm" />
        </div>
        <Select
          options={[{ value: "all", label: "All Status" }, { value: "new", label: "New" }, { value: "contacted", label: "Contacted" }, { value: "second_visit", label: "2nd Visit" }, { value: "converted", label: "Converted" }, { value: "lost", label: "Lost" }]}
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {filteredVisitors.length === 0 && search === "" ? (
          <EmptyState
            icon={<UserPlus className="h-12 w-12" />}
            title="No visitors registered"
            description="Register first-time visitors to track and follow up with them."
            action={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Register First Visitor</Button>}
          />
        ) : (
          <Table data={filteredVisitors} columns={columns} emptyMessage="No visitors match your filters" />
        )}
      </div>

      {/* Add Visitor Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Register Visitor" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            <Input label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Visit Date" type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} required />
            <Select label="Branch" options={[{ value: "", label: "Select..." }, ...branches.map((b) => ({ value: b.id, label: b.name }))]} value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invited By" placeholder="Who invited them?" value={form.invited_by} onChange={(e) => setForm({ ...form, invited_by: e.target.value })} />
            <Select label="How Did They Hear?" options={[{ value: "", label: "Select..." }, { value: "friend", label: "Friend/Family" }, { value: "social_media", label: "Social Media" }, { value: "website", label: "Website" }, { value: "event", label: "Event" }, { value: "drive_by", label: "Drive By" }, { value: "other", label: "Other" }]} value={form.how_heard} onChange={(e) => setForm({ ...form, how_heard: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.consent_given} onChange={(e) => setForm({ ...form, consent_given: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Visitor has given consent to store their information</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Register Visitor"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

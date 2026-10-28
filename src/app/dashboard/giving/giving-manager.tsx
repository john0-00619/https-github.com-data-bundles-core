"use client";

import { useState } from "react";
import { Plus, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Table } from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface GivingManagerProps {
  records: any[];
  members: { id: string; first_name: string; last_name: string }[];
  branches: { id: string; name: string }[];
  organizationId: string;
}

export function GivingManager({ records, members, branches, organizationId }: GivingManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    member_id: "", amount: "", category: "tithe", payment_method: "cash",
    reference: "", given_at: new Date().toISOString().split("T")[0], branch_id: "",
  });
  const supabase = createClient();

  const totalGiving = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const thisMonth = records.filter((r) => {
    const d = new Date(r.given_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("giving_records").insert({
        organization_id: organizationId,
        member_id: form.member_id || null,
        amount: parseFloat(form.amount),
        currency: "GHS",
        category: form.category,
        payment_method: form.payment_method,
        reference: form.reference || null,
        given_at: form.given_at,
        branch_id: form.branch_id || null,
        recorded_by: user.id,
      });
      if (error) throw error;
      setShowNew(false);
      setForm({ member_id: "", amount: "", category: "tithe", payment_method: "cash", reference: "", given_at: new Date().toISOString().split("T")[0], branch_id: "" });
      window.location.reload();
    } catch {
      alert("Failed to record giving");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "member",
      header: "Member",
      render: (_: any, row: any) => (
        <span className="font-medium text-gray-900">
          {row.member ? `${row.member.first_name} ${row.member.last_name}` : "Anonymous"}
        </span>
      ),
    },
    { key: "amount", header: "Amount", render: (val: number) => <span className="font-medium">{formatCurrency(val)}</span> },
    { key: "category", header: "Category", render: (val: string) => <Badge variant="secondary">{val.replace("_", " ")}</Badge> },
    { key: "payment_method", header: "Method", render: (val: string) => <span className="text-gray-600 capitalize">{val.replace("_", " ")}</span> },
    { key: "given_at", header: "Date", render: (val: string) => <span className="text-gray-600 text-sm">{formatDate(val)}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giving</h1>
          <p className="text-gray-600">Track tithes, offerings and donations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
          <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Record Giving</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total (All Time)" value={formatCurrency(totalGiving)} icon={<DollarSign className="h-6 w-6" />} />
        <StatCard title="This Month" value={formatCurrency(thisMonth)} icon={<DollarSign className="h-6 w-6" />} />
        <StatCard title="Records" value={records.length} description="Total transactions" icon={<DollarSign className="h-6 w-6" />} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {records.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="h-12 w-12" />}
            title="No giving records"
            description="Start tracking tithes and offerings."
            action={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" />Record First Giving</Button>}
          />
        ) : (
          <Table data={records} columns={columns} emptyMessage="No records found" />
        )}
      </div>

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Record Giving" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Member (optional)"
            options={[{ value: "", label: "Anonymous" }, ...members.map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))]}
            value={form.member_id}
            onChange={(e) => setForm({ ...form, member_id: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (GHS)" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Input label="Date" type="date" value={form.given_at} onChange={(e) => setForm({ ...form, given_at: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: "tithe", label: "Tithe" }, { value: "offering", label: "Offering" },
                { value: "special_offering", label: "Special Offering" }, { value: "building_fund", label: "Building Fund" },
                { value: "missions", label: "Missions" }, { value: "charity", label: "Charity" }, { value: "other", label: "Other" },
              ]}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Select
              label="Payment Method"
              options={[
                { value: "cash", label: "Cash" }, { value: "mobile_money", label: "Mobile Money" },
                { value: "bank_transfer", label: "Bank Transfer" }, { value: "card", label: "Card" }, { value: "check", label: "Check" },
              ]}
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            />
          </div>
          <Input label="Reference / Note" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Record Giving"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

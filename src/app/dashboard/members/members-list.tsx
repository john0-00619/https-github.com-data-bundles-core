"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Download, Upload, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { MemberImport } from "@/components/features/member-import";
import type { Member } from "@/lib/types";

interface MembersListProps {
  members: (Member & { branch?: { name: string } | null })[];
  branches: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  totalCount: number;
  organizationId: string;
  userRole: string;
}

export function MembersList({
  members,
  branches,
  departments,
  totalCount,
  organizationId,
  userRole,
}: MembersListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    branch_id: "",
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      search === "" ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search);

    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesBranch = branchFilter === "all" || m.branch_id === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleExportCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Status", "Branch", "Join Date"];
    const rows = filteredMembers.map((m) => [
      m.first_name,
      m.last_name,
      m.email || "",
      m.phone || "",
      m.status,
      (m as any).branch?.name || "",
      m.join_date || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kingdomflow-members-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("members").insert({
        organization_id: organizationId,
        first_name: newMember.first_name,
        last_name: newMember.last_name,
        email: newMember.email || null,
        phone: newMember.phone || null,
        gender: newMember.gender || null,
        branch_id: newMember.branch_id || null,
        status: "active",
        join_date: new Date().toISOString(),
        created_by: user.id,
      });

      if (error) throw error;

      setShowAddModal(false);
      setNewMember({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: "",
        branch_id: "",
      });
      window.location.reload();
    } catch (err) {
      alert("Failed to add member. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Member",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.avatar_url}
            fallback={`${row.first_name} ${row.last_name}`}
            size="sm"
          />
          <div>
            <Link
              href={`/dashboard/members/${row.id}`}
              className="font-medium text-gray-900 hover:text-indigo-600"
            >
              {row.first_name} {row.last_name}
            </Link>
            <p className="text-xs text-gray-500">{row.email || "No email"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (val: any) => (
        <span className="text-gray-600">{val || "—"}</span>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      render: (_: any, row: any) => (
        <span className="text-gray-600">{row.branch?.name || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (val: any) => {
        const variantMap: Record<string, "success" | "warning" | "secondary" | "info"> = {
          active: "success",
          inactive: "secondary",
          visitor: "info",
          new_believer: "warning",
        };
        return (
          <Badge variant={variantMap[val] || "secondary"}>
            {val?.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      key: "join_date",
      header: "Joined",
      render: (val: any) => (
        <span className="text-gray-600 text-sm">
          {val ? formatDate(val) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">
            {totalCount} member{totalCount !== 1 ? "s" : ""} in your church
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <Select
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "visitor", label: "Visitor" },
            { value: "new_believe", label: "New Believer" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        />
        <Select
          options={[
            { value: "all", label: "All Branches" },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="w-full sm:w-40"
        />
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {filteredMembers.length === 0 && search === "" ? (
          <EmptyState
            icon={<svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            title="No members yet"
            description="Start building your church directory by adding your first member."
            action={
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                Add First Member
              </Button>
            }
          />
        ) : (
          <Table
            data={filteredMembers}
            columns={columns}
            emptyMessage="No members match your filters"
          />
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Member"
        size="lg"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newMember.first_name}
              onChange={(e) =>
                setNewMember({ ...newMember, first_name: e.target.value })
              }
              required
            />
            <Input
              label="Last Name"
              value={newMember.last_name}
              onChange={(e) =>
                setNewMember({ ...newMember, last_name: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={newMember.email}
            onChange={(e) =>
              setNewMember({ ...newMember, email: e.target.value })
            }
          />
          <Input
            label="Phone"
            type="tel"
            value={newMember.phone}
            onChange={(e) =>
              setNewMember({ ...newMember, phone: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Gender"
              options={[
                { value: "", label: "Select..." },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              value={newMember.gender}
              onChange={(e) =>
                setNewMember({ ...newMember, gender: e.target.value })
              }
            />
            <Select
              label="Branch"
              options={[
                { value: "", label: "Select..." },
                ...branches.map((b) => ({ value: b.id, label: b.name })),
              ]}
              value={newMember.branch_id}
              onChange={(e) =>
                setNewMember({ ...newMember, branch_id: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Members Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Members from CSV"
        size="lg"
      >
        <MemberImport
          organizationId={organizationId}
          branches={branches}
          onComplete={(results) => {
            setShowImportModal(false);
            window.location.reload();
          }}
          onClose={() => setShowImportModal(false)}
        />
      </Modal>
    </div>
  );
}

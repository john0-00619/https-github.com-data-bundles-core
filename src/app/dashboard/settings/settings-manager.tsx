"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { Plus, Building2, UserPlus, Link as LinkIcon, Copy, Trash2, Clock, CheckCircle } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SettingsManagerProps {
  organization: any;
  branches: any[];
  members: any[];
  invitations: any[];
  currentUserId: string;
  currentRole: string;
}

export function SettingsManager({ organization, branches, members, invitations, currentUserId, currentRole }: SettingsManagerProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [showBranch, setShowBranch] = useState(false);
  const [showRoleChange, setShowRoleChange] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "viewer" });
  const [branchForm, setBranchForm] = useState({ name: "", description: "" });
  const supabase = createClient();

  const canManage = ["owner", "admin"].includes(currentRole);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const token = Math.random().toString(36).substring(2);
      const { error } = await supabase.from("invitations").insert({
        organization_id: organization.id, email: inviteForm.email, role: inviteForm.role,
        invited_by: user.id, status: "pending", token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (error) throw error;
      setShowInvite(false);
      setInviteForm({ email: "", role: "viewer" });
      alert(`Invitation sent to ${inviteForm.email}`);
    } catch { alert("Failed to send invitation"); }
    finally { setSaving(false); }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("branches").insert({
        organization_id: organization.id, name: branchForm.name,
        slug: branchForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: branchForm.description || null, status: "active", is_main: false,
      });
      if (error) throw error;
      setShowBranch(false);
      setBranchForm({ name: "", description: "" });
      window.location.reload();
    } catch { alert("Failed to create branch"); }
    finally { setSaving(false); }
  };

  const copyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/auth/accept-invitation?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from("organization_members")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", memberId);
    if (error) {
      alert("Failed to update role: " + error.message);
    } else {
      window.location.reload();
    }
    setShowRoleChange(null);
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`Remove ${name} from the organization?`)) return;
    const { error } = await supabase
      .from("organization_members")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", memberId);
    if (error) {
      alert("Failed to remove member: " + error.message);
    } else {
      window.location.reload();
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Cancel this invitation?")) return;
    const { error } = await supabase
      .from("invitations")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", invitationId);
    if (error) {
      alert("Failed to cancel invitation: " + error.message);
    } else {
      window.location.reload();
    }
  };

  const memberColumns = [
    { key: "name", header: "Name", render: (_: any, row: any) => <span className="font-medium text-gray-900">{row.profile?.full_name || "—"}</span> },
    { key: "email", header: "Email", render: (_: any, row: any) => <span className="text-gray-600">{row.profile?.email || "—"}</span> },
    { key: "role", header: "Role", render: (val: string) => <Badge variant="secondary">{val.replace("_", " ")}</Badge> },
    ...(canManage ? [{
      key: "actions",
      header: "",
      render: (_: any, row: any) => {
        const isOwner = row.role === "owner";
        const isSelf = row.user_id === currentUserId;
        if (isOwner || isSelf) return null;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowRoleChange(row)}>
              Change Role
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(row.id, row.profile?.full_name)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      },
    }] : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your organization settings, branches and team</p>
      </div>

      <Tabs
        tabs={[
          {
            id: "general",
            label: "General",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>Basic information about your church or ministry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-lg">
                    <Input label="Organization Name" defaultValue={organization?.name} disabled={!canManage} />
                    <Input label="Email" type="email" defaultValue={organization?.email || ""} />
                    <Input label="Phone" type="tel" defaultValue={organization?.phone || ""} />
                    <Input label="Address" defaultValue={organization?.address || ""} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="City" defaultValue={organization?.city || ""} />
                      <Select label="Currency" options={[
                        { value: "GHS", label: "Ghana Cedi (GHS)" },
                        { value: "NGN", label: "Nigerian Naira (NGN)" },
                        { value: "USD", label: "US Dollar (USD)" },
                        { value: "GBP", label: "British Pound (GBP)" },
                        { value: "EUR", label: "Euro (EUR)" },
                      ]} defaultValue={organization?.currency || "GHS"} />
                    </div>
                    {canManage && <Button>Save Changes</Button>}
                  </div>
                </CardContent>
              </Card>
            ),
          },
          {
            id: "branches",
            label: "Branches",
            content: (
              <div className="space-y-4">
                {canManage && (
                  <div className="flex justify-end">
                    <Button onClick={() => setShowBranch(true)}><Plus className="h-4 w-4" />Add Branch</Button>
                  </div>
                )}
                {branches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No branches configured</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branches.map((b: any) => (
                      <Card key={b.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">{b.name}</h3>
                            {b.is_main && <Badge variant="default">Main</Badge>}
                          </div>
                          {b.description && <p className="text-sm text-gray-600">{b.description}</p>}
                          <p className="text-xs text-gray-500 mt-2">{b.city || ""} {b.phone || ""}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "team",
            label: "Team",
            content: (
              <div className="space-y-4">
                {canManage && (
                  <div className="flex justify-end">
                    <Button onClick={() => setShowInvite(true)}><UserPlus className="h-4 w-4" />Invite Member</Button>
                  </div>
                )}
                <Card>
                  <CardContent className="pt-6">
                    <Table data={members} columns={memberColumns} emptyMessage="No team members" />
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            id: "invitations",
            label: `Invitations${invitations.length > 0 ? ` (${invitations.length})` : ""}`,
            content: (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>Invitations that haven't been accepted yet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invitations.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No pending invitations</p>
                    ) : (
                      <div className="space-y-3">
                        {invitations.map((inv: any) => (
                          <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{inv.email}</p>
                                <Badge variant="secondary">{inv.role.replace("_", " ")}</Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>Sent {formatDateTime(inv.created_at)}</span>
                                <span className="mx-1">•</span>
                                <span>Expires {formatDate(inv.expires_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInviteLink(inv.token)}
                                title="Copy invitation link"
                              >
                                {copiedLink === inv.token ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <LinkIcon className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelInvitation(inv.id)}
                                title="Cancel invitation"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                  <p className="font-medium mb-1">💡 Invitation Links</p>
                  <p className="text-blue-700">
                    Click the link icon to copy the invitation URL. Share it with the invitee via email, WhatsApp, or any messaging platform.
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input label="Email Address" type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} required />
          <Select label="Role" options={[
            { value: "admin", label: "Administrator" }, { value: "pastor", label: "Pastor" },
            { value: "secretary", label: "Secretary" }, { value: "finance_officer", label: "Finance Officer" },
            { value: "department_leader", label: "Department Leader" }, { value: "follow_up_officer", label: "Follow-Up Officer" },
            { value: "viewer", label: "Viewer" },
          ]} value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Sending..." : "Send Invitation"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showBranch} onClose={() => setShowBranch(false)} title="Add Branch">
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <Input label="Branch Name" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} required />
          <Input label="Description" value={branchForm.description} onChange={(e) => setBranchForm({ ...branchForm, description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowBranch(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Branch"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showRoleChange} onClose={() => setShowRoleChange(null)} title="Change Role">
        {showRoleChange && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Change role for <strong>{showRoleChange.profile?.full_name}</strong>
            </p>
            <Select
              label="New Role"
              options={[
                { value: "admin", label: "Administrator" },
                { value: "senior_pastor", label: "Senior Pastor" },
                { value: "pastor", label: "Pastor" },
                { value: "secretary", label: "Secretary" },
                { value: "finance_officer", label: "Finance Officer" },
                { value: "department_leader", label: "Department Leader" },
                { value: "follow_up_officer", label: "Follow-Up Officer" },
                { value: "viewer", label: "Viewer" },
              ]}
              value={showRoleChange.role}
              onChange={(e) => handleChangeRole(showRoleChange.id, e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowRoleChange(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

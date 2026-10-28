"use client";

import { useState } from "react";
import { Search, Shield, Filter, Download, Clock, User, Database, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

interface AuditLogViewerProps {
  logs: any[];
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  invite: "bg-purple-100 text-purple-700",
  login: "bg-gray-100 text-gray-700",
  export: "bg-amber-100 text-amber-700",
  permission_change: "bg-red-100 text-red-700",
};

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = search === "" ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action?.startsWith(actionFilter);
    return matchesSearch && matchesAction;
  });

  const handleExport = () => {
    const headers = ["Timestamp", "User", "Action", "Resource", "Resource ID", "Details"];
    const rows = filteredLogs.map((log) => [
      formatDateTime(log.created_at),
      log.user?.full_name || "System",
      log.action,
      log.resource_type,
      log.resource_id || "",
      JSON.stringify(log.details || {}),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-gray-600">Track important actions and changes</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search by action, resource, or user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm" />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-300 text-sm">
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="invite">Invite</option>
          <option value="permission">Permission</option>
        </select>
      </div>

      {/* Logs */}
      <Card>
        <CardContent className="pt-6">
          {filteredLogs.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No audit entries"
              description="Audit entries will appear here as actions are performed in your organization."
            />
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${actionColors[log.action] || "bg-gray-100 text-gray-600"}`}>
                    {log.action?.startsWith("create") ? <Database className="h-4 w-4" /> :
                     log.action?.startsWith("delete") ? <Database className="h-4 w-4" /> :
                     <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">
                        {log.user?.full_name || "System"}
                      </span>
                      <Badge variant="secondary" className="text-xs">{log.action}</Badge>
                      <span className="text-xs text-gray-500">{log.resource_type}</span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {JSON.stringify(log.details).substring(0, 120)}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 shrink-0">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDateTime(log.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

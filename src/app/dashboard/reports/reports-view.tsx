"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, DollarSign, TrendingUp, Download, BarChart3, UserPlus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ReportsViewProps {
  memberCount: number;
  eventCount: number;
  visitorCount: number;
  givingData: { amount: number; given_at: string; category: string }[];
  attendanceData: { id: string; session_date: string; records?: { count: number }[] }[];
  membersByMonth: { created_at: string }[];
  organizationId: string;
}

export function ReportsView({ memberCount, eventCount, visitorCount, givingData, attendanceData, membersByMonth, organizationId }: ReportsViewProps) {
  const [dateRange, setDateRange] = useState("30");
  const [exporting, setExporting] = useState(false);
  const supabase = createClient();

  const totalGiving = givingData.reduce((sum, g) => sum + (g.amount || 0), 0);
  const avgAttendance = attendanceData.length > 0
    ? Math.round(attendanceData.reduce((sum, s) => sum + (s.records?.[0]?.count || 0), 0) / attendanceData.length)
    : 0;

  // Recent giving (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentGiving = givingData.filter(g => new Date(g.given_at) >= thirtyDaysAgo);
  const recentTotal = recentGiving.reduce((sum, g) => sum + (g.amount || 0), 0);

  // Previous 30 days for comparison
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const previousGiving = givingData.filter(g => {
    const d = new Date(g.given_at);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  });
  const previousTotal = previousGiving.reduce((sum, g) => sum + (g.amount || 0), 0);
  const givingChange = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal * 100) : 0;

  // Group giving by category
  const givingByCategory = givingData.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + g.amount;
    return acc;
  }, {} as Record<string, number>);

  // Member growth by month
  const membersByMonthGrouped = membersByMonth.reduce((acc, m) => {
    const month = new Date(m.created_at).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = async (type: string) => {
    setExporting(true);
    try {
      let headers: string[] = [];
      let rows: string[][] = [];
      let filename = "";

      switch (type) {
        case "members": {
          headers = ["Name", "Phone", "Email", "Department", "Status", "Joined"];
          const { data } = await supabase
            .from("members")
            .select("*, department:departments(name)")
            .eq("organization_id", organizationId)
            .eq("status", "active")
            .order("last_name");
          rows = (data || []).map((m: any) => [
            `${m.first_name} ${m.last_name}`,
            m.phone || "",
            m.email || "",
            m.department?.name || "",
            m.status,
            formatDate(m.join_date || m.created_at),
          ]);
          filename = "members";
          break;
        }
        case "giving": {
          headers = ["Member", "Amount", "Category", "Method", "Date"];
          const { data } = await supabase
            .from("giving_records")
            .select("*, member:members(first_name, last_name)")
            .eq("organization_id", organizationId)
            .order("given_at", { ascending: false });
          rows = (data || []).map((g: any) => [
            g.member ? `${g.member.first_name} ${g.member.last_name}` : "Anonymous",
            g.amount.toString(),
            g.category,
            g.method || "",
            formatDate(g.given_at),
          ]);
          filename = "giving-records";
          break;
        }
        case "attendance": {
          headers = ["Date", "Service", "Attendees"];
          const { data } = await supabase
            .from("attendance_sessions")
            .select("*, records:attendance_records(count)")
            .eq("organization_id", organizationId)
            .order("session_date", { ascending: false });
          rows = (data || []).map((s: any) => [
            formatDate(s.session_date),
            s.service_type || "Service",
            (s.records?.[0]?.count || 0).toString(),
          ]);
          filename = "attendance";
          break;
        }
      }

      const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Insights into your church&apos;s growth and activities</p>
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
              { value: "365", label: "Last year" },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value={memberCount} description="Active members" icon={<Users className="h-6 w-6" />} />
        <StatCard title="Total Visitors" value={visitorCount} description="All time" icon={<UserPlus className="h-6 w-6" />} />
        <StatCard
          title="Giving (30d)"
          value={formatCurrency(recentTotal)}
          description={`${givingChange >= 0 ? "↑" : "↓"} ${Math.abs(givingChange).toFixed(0)}% vs prior`}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard title="Avg. Attendance" value={avgAttendance} description="Per session" icon={<TrendingUp className="h-6 w-6" />} />
      </div>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleExport("members")} disabled={exporting}>
              <Download className="h-4 w-4" /> Export Members
            </Button>
            <Button variant="outline" onClick={() => handleExport("giving")} disabled={exporting}>
              <Download className="h-4 w-4" /> Export Giving
            </Button>
            <Button variant="outline" onClick={() => handleExport("attendance")} disabled={exporting}>
              <Download className="h-4 w-4" /> Export Attendance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Giving by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(givingByCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(givingByCategory).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([cat, amount]) => {
                  const total = Object.values(givingByCategory).reduce((sum: number, val: any) => sum + val, 0);
                  const percent = total > 0 ? Math.round((amount as number) / total * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 capitalize">{cat.replace("_", " ")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(amount as number)}</span>
                          <Badge variant="secondary">{percent}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No giving data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
              <div className="space-y-3">
                {attendanceData.slice(0, 8).map((session) => {
                  const count = session.records?.[0]?.count || 0;
                  const maxCount = Math.max(...attendanceData.map(s => s.records?.[0]?.count || 0), 1);
                  const percent = Math.round(count / maxCount * 100);
                  return (
                    <div key={session.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">
                          {new Date(session.session_date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{count} attendees</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No attendance data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Member Growth</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(membersByMonthGrouped).length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {Object.entries(membersByMonthGrouped).reverse().slice(-12).map(([month, count]) => {
                const maxCount = Math.max(...Object.values(membersByMonthGrouped), 1);
                const height = Math.max(10, (count as number) / maxCount * 100);
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{count as number}</span>
                    <div className="w-full bg-indigo-200 rounded-t" style={{ height: `${height}%` }} />
                    <span className="text-xs text-gray-500 rotate-45 origin-left">{month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No member data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

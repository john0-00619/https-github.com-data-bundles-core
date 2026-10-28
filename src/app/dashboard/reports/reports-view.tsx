"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReportsViewProps {
  memberCount: number;
  eventCount: number;
  givingData: { amount: number; given_at: string; category: string }[];
  attendanceData: { id: string; session_date: string; records?: { count: number }[] }[];
}

export function ReportsView({ memberCount, eventCount, givingData, attendanceData }: ReportsViewProps) {
  const totalGiving = givingData.reduce((sum, g) => sum + (g.amount || 0), 0);
  const avgAttendance = attendanceData.length > 0
    ? Math.round(attendanceData.reduce((sum, s) => sum + (s.records?.[0]?.count || 0), 0) / attendanceData.length)
    : 0;

  // Group giving by category
  const givingByCategory = givingData.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + g.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Insights into your church&apos;s growth and activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value={memberCount} icon={<Users className="h-6 w-6" />} />
        <StatCard title="Total Events" value={eventCount} icon={<Calendar className="h-6 w-6" />} />
        <StatCard title="Total Giving" value={formatCurrency(totalGiving)} icon={<DollarSign className="h-6 w-6" />} />
        <StatCard title="Avg. Attendance" value={avgAttendance} description="Per session" icon={<TrendingUp className="h-6 w-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Giving by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(givingByCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(givingByCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{cat.replace("_", " ")}</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(amount as number)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No giving data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
              <div className="space-y-3">
                {attendanceData.slice(0, 6).map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {new Date(session.session_date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {session.records?.[0]?.count || 0} attendees
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No attendance data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

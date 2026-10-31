export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Calendar, DollarSign, UserCheck, TrendingUp, Church, UserPlus, Building2, Bell, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/dashboard/onboarding");
  }

  // Get user's organization membership
  const { data: membership } = await supabase
    .from("organization_members")
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/dashboard/onboarding");
  }

  const orgId = membership.organization_id;
  const org = membership.organization;

  // Get dashboard stats
  const [
    { count: memberCount },
    { count: eventCount },
    { data: givingData },
    { count: followUpCount },
    { count: visitorCount },
    { count: departmentCount },
    { count: announcementCount },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("organization_id", orgId).gte("start_time", new Date().toISOString()),
    supabase.from("giving_records").select("amount").eq("organization_id", orgId).gte("given_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("organization_id", orgId).in("status", ["open", "in_progress"]),
    supabase.from("visitors").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("follow_up_status", "new"),
    supabase.from("departments").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    supabase.from("announcements").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "published"),
  ]);

  const totalGiving = givingData?.reduce((sum, g) => sum + (g.amount || 0), 0) || 0;

  // Recent members
  const { data: recentMembers } = await supabase
    .from("members")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("organization_id", orgId)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  return (
    <DashboardLayout
      user={{ name: profile.full_name, email: profile.email, avatar_url: profile.avatar_url }}
      organization={{ name: org?.name || "KingdomFlow" }}
    >
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile.full_name.split(" ")[0]}
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening at {org?.name || "your church"} today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={memberCount || 0}
            description="Active members"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="New Visitors"
            value={visitorCount || 0}
            description="Awaiting follow-up"
            icon={<UserPlus className="h-6 w-6" />}
          />
          <StatCard
            title="Giving (30 days)"
            value={`GHS ${totalGiving.toLocaleString()}`}
            description="Total received"
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatCard
            title="Departments"
            value={departmentCount || 0}
            description={`${followUpCount || 0} open follow-ups`}
            icon={<Building2 className="h-6 w-6" />}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: "Add Member", href: "/dashboard/members/new", icon: Users, color: "bg-blue-50 text-blue-600" },
              { name: "Take Attendance", href: "/dashboard/attendance/new", icon: TrendingUp, color: "bg-green-50 text-green-600" },
              { name: "Create Event", href: "/dashboard/events/new", icon: Calendar, color: "bg-purple-50 text-purple-600" },
              { name: "Record Giving", href: "/dashboard/giving/new", icon: DollarSign, color: "bg-yellow-50 text-yellow-600" },
              { name: "AI Assistant", href: "/dashboard/assistant", icon: Sparkles, color: "bg-indigo-50 text-indigo-600" },
            ].map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center hover:bg-gray-50 transition-colors"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Members and Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Members */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Members</h2>
              <Link
                href="/dashboard/members"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
            {recentMembers && recentMembers.length > 0 ? (
              <div className="space-y-3">
                {recentMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/dashboard/members/${member.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">
                      {member.first_name[0]}{member.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{member.phone || "No phone"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No members yet.{" "}
                <Link href="/dashboard/members/new" className="text-indigo-600 hover:text-indigo-700">
                  Add your first member
                </Link>
              </p>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link
                href="/dashboard/events"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.start_time).toLocaleDateString("en-GB", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No upcoming events.{" "}
                <Link href="/dashboard/events/new" className="text-indigo-600 hover:text-indigo-700">
                  Create an event
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

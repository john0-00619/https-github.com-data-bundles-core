"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  ClipboardCheck,
  Church,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  UserCheck,
  Heart,
  FileText,
  BarChart3,
  Building2,
  MessageSquare,
  UserPlus,
  CreditCard,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/features/notification-center";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar_url?: string | null;
  };
  organization?: {
    name: string;
    logo_url?: string | null;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Visitors", href: "/dashboard/visitors", icon: UserPlus },
  { name: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Departments", href: "/dashboard/departments", icon: Building2 },
  { name: "Giving", href: "/dashboard/giving", icon: DollarSign },
  { name: "Follow-Ups", href: "/dashboard/followups", icon: UserCheck },
  { name: "Prayer Requests", href: "/dashboard/prayer-requests", icon: Heart },
  { name: "Announcements", href: "/dashboard/announcements", icon: Bell },
  { name: "Communication", href: "/dashboard/communication", icon: MessageSquare },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function DashboardLayout({ children, user, organization }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Church className="h-6 w-6 text-indigo-600" />
              <span className="text-lg font-bold text-gray-900">
                {organization?.name || "KingdomFlow"}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
            <Church className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">
              {organization?.name || "KingdomFlow"}
            </span>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {user && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar
                    src={user.avatar_url}
                    fallback={user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <NotificationCenter />
                  <Link
                    href="/auth/logout"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Sign out"
                  >
                  <LogOut className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">
              {organization?.name || "KingdomFlow"}
            </span>
          </div>
        </div>

        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export { DashboardLayout };

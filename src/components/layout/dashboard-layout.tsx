"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users, Calendar, ClipboardCheck, Church, DollarSign,
  Bell, Settings, LogOut, Menu, X, Home, UserCheck, Heart,
  FileText, BarChart3, Building2, MessageSquare, UserPlus,
  CreditCard, Shield, Sparkles, ChevronLeft,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/features/notification-center";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: { name: string; email: string; avatar_url?: string | null };
  organization?: { name: string; logo_url?: string | null };
}

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "AI Assistant", href: "/dashboard/assistant", icon: Sparkles },
];

const ministryNav = [
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Visitors", href: "/dashboard/visitors", icon: UserPlus },
  { name: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Departments", href: "/dashboard/departments", icon: Building2 },
  { name: "Follow-Ups", href: "/dashboard/followups", icon: UserCheck },
  { name: "Prayer Requests", href: "/dashboard/prayer-requests", icon: Heart },
];

const commsNav = [
  { name: "Communication", href: "/dashboard/communication", icon: MessageSquare },
  { name: "Announcements", href: "/dashboard/announcements", icon: Bell },
  { name: "Forms", href: "/dashboard/forms", icon: FileText },
];

const adminNav = [
  { name: "Giving", href: "/dashboard/giving", icon: DollarSign },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: Shield },
  { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavSection({ label, items, pathname }: { label: string; items: typeof mainNav; pathname: string }) {
  return (
    <div className="mb-4">
      <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({ pathname, organization, user, onNavigate }: { pathname: string; organization?: DashboardLayoutProps["organization"]; user?: DashboardLayoutProps["user"]; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-gray-100 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Church className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-bold text-gray-900 truncate block">
            {organization?.name || "KingdomFlow"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" onClick={onNavigate}>
        <NavSection label="Overview" items={mainNav} pathname={pathname} />
        <NavSection label="Ministry" items={ministryNav} pathname={pathname} />
        <NavSection label="Communication" items={commsNav} pathname={pathname} />
        <NavSection label="Administration" items={adminNav} pathname={pathname} />
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-gray-100 p-3 shrink-0">
          <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-gray-50 transition-colors">
            <Avatar src={user.avatar_url} fallback={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <NotificationCenter />
              <Link
                href="/auth/logout"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardLayout({ children, user, organization }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-[280px] flex-col bg-white shadow-xl animate-slide-in">
            <div className="absolute right-2 top-3">
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} organization={organization} user={user} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[260px] lg:flex-col">
        <div className="flex flex-grow flex-col bg-white border-r border-gray-200">
          <SidebarContent pathname={pathname} organization={organization} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 p-1 -ml-1">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
              <Church className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              {organization?.name || "KingdomFlow"}
            </span>
          </div>
          <div className="flex-1" />
          <NotificationCenter />
        </div>

        <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}

export { DashboardLayout };

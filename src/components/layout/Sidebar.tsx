"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getSession, clearSession } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Building2, CalendarDays, ClipboardCheck,
  MessageSquare, Megaphone, BarChart3, Settings, Sparkles, LogOut,
  ChevronDown, Menu, X, Heart, UserCheck, Shield
} from "lucide-react";

const NAV = [
  { label: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ai", label: "AI Assistant", icon: Sparkles, badge: "New" },
  ]},
  { label: "Ministry", items: [
    { href: "/members", label: "Members", icon: Users },
    { href: "/branches", label: "Churches & Branches", icon: Building2 },
    { href: "/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/followup", label: "Follow-up", icon: UserCheck },
  ]},
  { label: "Engage", items: [
    { href: "/communication", label: "Communication", icon: Megaphone },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ]},
  { label: "System", items: [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/settings/ai-providers", label: "AI Providers", icon: Sparkles },
  ]},
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v:boolean)=>void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  useEffect(()=>{ setUser(getSession()?.user || null); }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={()=>setMobileOpen(false)} />}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-stone-200 flex flex-col transition-transform duration-300",
        "lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand */}
        <div className="h-[64px] px-5 flex items-center justify-between border-b border-stone-100 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-ink-900 flex items-center justify-center text-white">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-[17px] leading-none tracking-tight">KingdomFlow</div>
              <div className="text-[11px] tracking-widest uppercase text-stone-500 font-medium">Grace Chapel • Central</div>
            </div>
          </Link>
          <button className="lg:hidden p-2" onClick={()=>setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        {/* Workspace switcher */}
        <div className="px-3 pt-4 pb-2">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="https://i.pravatar.cc/100?u=church" alt="church" className="h-8 w-8 rounded-lg object-cover" />
              <div>
                <div className="text-sm font-semibold leading-none">Grace Chapel HQ</div>
                <div className="text-xs text-stone-500">12 branches • 2,480 members</div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {NAV.map(section=>(
            <div key={section.label}>
              <div className="px-2 mb-2 text-[11px] font-semibold tracking-widest uppercase text-stone-400">{section.label}</div>
              <div className="space-y-1">
                {section.items.map(item=>{
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={()=>setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                        active ? "bg-ink-900 text-white shadow-soft" : "text-stone-600 hover:bg-stone-50 hover:text-ink-900"
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-stone-400")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", active ? "bg-white text-ink-900" : "bg-kingdom-100 text-kingdom-700")}>{item.badge}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User */}
        <div className="p-3 border-t border-stone-100 shrink-0">
          <div className="bg-[#fdf8f1] border border-stone-200 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <img src={user?.avatar || "https://i.pravatar.cc/100?u=user"} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-none truncate">{user?.name || "Guest"}</div>
                <div className="text-xs text-stone-500 truncate flex items-center gap-1"><Shield className="h-3 w-3" /> {user?.role?.replace('_',' ') || "member"}</div>
              </div>
            </div>
            <button
              onClick={()=>{ clearSession(); router.push("/login"); }}
              className="mt-3 w-full flex items-center justify-center gap-2 h-8 bg-white border border-stone-200 rounded-full text-xs font-medium hover:bg-stone-50"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-stone-400">
            <Heart className="h-3 w-3" /> Made for communities
          </div>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ onMenu }: { onMenu: ()=>void }) {
  const pathname = usePathname();
  const title = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return (
    <div className="h-[64px] bg-white/80 backdrop-blur border-b border-stone-200 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
      <button onClick={onMenu} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-stone-100"><Menu className="h-5 w-5" /></button>
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold capitalize tracking-tight hidden lg:block">{title.replace('-',' ')}</h1>
        <div className="relative max-w-md hidden md:block">
          <input placeholder="Search members, events, messages..." className="w-full h-9 bg-stone-50 border border-stone-200 rounded-full pl-9 pr-4 text-sm placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-ink-900" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" /> All systems operational
        </div>
        <button className="h-9 w-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">🔔</button>
      </div>
    </div>
  );
}

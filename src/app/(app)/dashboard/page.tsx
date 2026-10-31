"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Users, CalendarDays, ClipboardCheck, TrendingUp, ArrowUpRight, MapPin, Heart, Megaphone, Sparkles } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Total Members", value: "2,480", change: "+4.2%", sub: "Across 12 branches", icon: Users, color: "bg-[#fdf8f1] border-amber-200" },
  { label: "Sunday Attendance", value: "342", change: "+8%", sub: "Last Sunday • 87% capacity", icon: ClipboardCheck, color: "bg-emerald-50 border-emerald-200" },
  { label: "Active Events", value: "18", change: "+3", sub: "This month", icon: CalendarDays, color: "bg-blue-50 border-blue-200" },
  { label: "Follow-ups Due", value: "24", change: "5 urgent", sub: "New visitors & care", icon: Heart, color: "bg-rose-50 border-rose-200" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(()=>setUser(getSession()?.user),[]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-medium tracking-tight leading-none">Good morning, {user?.name?.split(' ')[0] || 'Pastor'}.</h1>
          <p className="text-sm text-stone-500 mt-1.5">Here’s what’s happening in your ministry today — Sunday, Oct 31 • Grace Chapel Central</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Export report</Button>
          <Link href="/members"><Button><Users className="h-4 w-4 mr-2" /> Add member</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(s=>(
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5 text-stone-700" />
                </div>
                <Badge variant={s.change.includes('+') ? 'success' : 'warning'}>{s.change}</Badge>
              </div>
              <div className="mt-4 text-[28px] font-display font-semibold leading-none">{s.value}</div>
              <div className="text-sm font-medium mt-1">{s.label}</div>
              <div className="text-xs text-stone-500">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Attendance chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="font-semibold">Attendance trends</div>
              <div className="text-xs text-stone-500">Last 8 weeks • All services</div>
            </div>
            <Button variant="ghost" size="sm"><TrendingUp className="h-4 w-4 mr-1" /> Details</Button>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-end gap-2">
              {[180,210,240,200,260,310,342,328].map((h,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-stone-100 rounded-t-xl relative overflow-hidden" style={{height: 180}}>
                    <div className="absolute bottom-0 w-full bg-ink-900 rounded-t-xl transition-all" style={{height: `${(h/342)*100}%`}} />
                  </div>
                  <span className="text-[11px] text-stone-500">W{i+1}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-ink-900 rounded-full" /> Sunday Service</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-stone-300 rounded-full" /> Midweek</span>
              <span className="ml-auto text-stone-500">Peak: Easter (512)</span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader>
            <div className="font-semibold">Upcoming gatherings</div>
            <div className="text-xs text-stone-500">Next 7 days</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title:"Sunday Service", time:"Sun • 8:30 AM", loc:"Main Auditorium", count: "Expected 420", color:"bg-kingdom-500" },
              { title:"Youth Fellowship", time:"Sat • 4:00 PM", loc:"Youth Chapel", count:"89 registered", color:"bg-violet-500" },
              { title:"Leaders Prayer", time:"Fri • 6:00 AM", loc:"Prayer Tower", count:"32 leaders", color:"bg-emerald-500" },
            ].map(e=>(
              <div key={e.title} className="flex gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50">
                <div className={`h-10 w-1 rounded-full ${e.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-none">{e.title}</div>
                  <div className="text-xs text-stone-500">{e.time}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.loc} • {e.count}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-stone-400 shrink-0" />
              </div>
            ))}
            <Link href="/events"><Button variant="secondary" className="w-full mt-2">View all events</Button></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader><div className="font-semibold">Recent members</div><div className="text-xs text-stone-500">Latest registrations</div></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name:"Sarah Owusu", branch:"Central • Youth", time:"2h ago", avatar:"https://i.pravatar.cc/100?u=sarah" },
              { name:"Emmanuel Kofi", branch:"East Legon", time:"5h ago", avatar:"https://i.pravatar.cc/100?u=emmanuel" },
              { name:"Grace Mensah", branch:"Central • Children", time:"Yesterday", avatar:"https://i.pravatar.cc/100?u=grace" },
            ].map(m=>(
              <div key={m.name} className="flex items-center gap-3">
                <img src={m.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
                <div className="flex-1 min-w-0"><div className="text-sm font-medium leading-none">{m.name}</div><div className="text-xs text-stone-500">{m.branch}</div></div>
                <span className="text-xs text-stone-400">{m.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="font-semibold">Branch overview</div><div className="text-xs text-stone-500">Members by location</div></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name:"Central", members: 840, pct: 34 },
              { name:"East Legon", members: 420, pct: 17 },
              { name:"Cape Coast", members: 380, pct: 15 },
              { name:"Tema", members: 310, pct: 13 },
            ].map(b=>(
              <div key={b.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm"><span className="font-medium">{b.name}</span><span className="text-stone-500 text-xs">{b.members}</span></div>
                  <div className="h-1.5 bg-stone-100 rounded-full mt-1"><div className="h-1.5 bg-ink-900 rounded-full" style={{width:`${b.pct}%`}} /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-ink-900 text-white border-ink-900">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
            <div className="mt-4 font-display text-lg font-medium leading-tight">Ask KingdomFlow AI</div>
            <p className="text-sm text-white/70 mt-2">Explain attendance, draft announcements, or plan follow-up — powered by your chosen AI provider.</p>
            <Link href="/ai"><Button className="mt-4 bg-white text-ink-900 hover:bg-stone-100 w-full">Open AI Assistant →</Button></Link>
            <div className="mt-3 text-xs text-white/50 flex items-center gap-2"><span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" /> 4 providers ready • Auto mode</div>
          </CardContent>
        </Card>
      </div>

      {/* Communication preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><div className="font-semibold flex items-center gap-2"><Megaphone className="h-4 w-4" /> Communication Centre</div><div className="text-xs text-stone-500">Recent broadcasts</div></div>
          <Link href="/communication"><Button variant="secondary" size="sm">Open</Button></Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-stone-400 uppercase tracking-wide border-b"><th className="text-left py-2 font-medium">Message</th><th className="text-left py-2 font-medium">Audience</th><th className="text-left py-2 font-medium">Channel</th><th className="text-left py-2 font-medium">Status</th></tr></thead>
              <tbody>
                <tr className="border-b border-stone-100"><td className="py-3 font-medium">Welcome to December — Youth Conference reminder</td><td className="py-3 text-stone-500">All Members</td><td className="py-3"><Badge variant="info">WhatsApp</Badge></td><td className="py-3"><Badge variant="success">Delivered</Badge></td></tr>
                <tr className="border-b border-stone-100"><td className="py-3 font-medium">Sunday Service — Volunteer roster</td><td className="py-3 text-stone-500">Volunteers</td><td className="py-3"><Badge>SMS</Badge></td><td className="py-3"><Badge variant="success">Delivered</Badge></td></tr>
                <tr><td className="py-3 font-medium">New branch launch — Cape Coast</td><td className="py-3 text-stone-500">Leaders</td><td className="py-3"><Badge variant="info">Email</Badge></td><td className="py-3"><Badge variant="warning">Scheduled</Badge></td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

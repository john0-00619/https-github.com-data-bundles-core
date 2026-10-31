"use client";
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";

const MEMBERS = [
  { id:1, name:"Sarah Owusu", email:"sarah.o@grace.church", phone:"+233 24 123 4567", branch:"Central", group:"Youth", status:"Active", avatar:"https://i.pravatar.cc/100?u=sarah" },
  { id:2, name:"Emmanuel Kofi", email:"emmanuel.k@grace.church", phone:"+233 20 987 6543", branch:"East Legon", group:"Men's Fellowship", status:"Active", avatar:"https://i.pravatar.cc/100?u=emmanuel" },
  { id:3, name:"Grace Mensah", email:"grace.m@grace.church", phone:"+233 24 555 1212", branch:"Central", group:"Children", status:"New", avatar:"https://i.pravatar.cc/100?u=grace" },
  { id:4, name:"David Arthur", email:"david.a@grace.church", phone:"+233 24 333 4444", branch:"Tema", group:"Choir", status:"Active", avatar:"https://i.pravatar.cc/100?u=david" },
  { id:5, name:"Patience Adjoa", email:"patience.a@grace.church", phone:"+233 24 777 8888", branch:"Cape Coast", group:"Women", status:"Follow-up", avatar:"https://i.pravatar.cc/100?u=patience" },
  { id:6, name:"Joshua Boateng", email:"joshua.b@grace.church", phone:"+233 24 999 0000", branch:"Central", group:"Youth", status:"Active", avatar:"https://i.pravatar.cc/100?u=joshua" },
];

export default function MembersPage() {
  const [q,setQ]=useState("");
  const filtered = MEMBERS.filter(m=> m.name.toLowerCase().includes(q.toLowerCase()) || m.email.includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">Members</h1>
          <p className="text-sm text-stone-500">Care for your people — directory, groups, and follow-up.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Add member</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input placeholder="Search by name, email, phone..." value={q} onChange={e=>setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            <select className="h-10 px-3 bg-white border border-stone-200 rounded-xl text-sm"><option>All branches</option><option>Central</option><option>East Legon</option></select>
            <select className="h-10 px-3 bg-white border border-stone-200 rounded-xl text-sm"><option>All groups</option><option>Youth</option></select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(m=>(
          <Card key={m.id} className="hover:shadow-card transition">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <img src={m.avatar} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium leading-none">{m.name}</div>
                  <div className="text-xs text-stone-500">{m.branch} • {m.group}</div>
                  <div className="mt-2 flex gap-1.5">
                    <Badge variant={m.status==="Active"?"success": m.status==="New"?"info":"warning"}>{m.status}</Badge>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-stone-600"><Mail className="h-3.5 w-3.5" /> {m.email}</div>
                <div className="flex items-center gap-2 text-stone-600"><Phone className="h-3.5 w-3.5" /> {m.phone}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1">View</Button>
                <Button variant="ghost" size="sm" className="flex-1">Message</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-stone-50 border-dashed">
        <CardContent className="p-6 text-center">
          <div className="text-sm font-medium">Member insights</div>
          <p className="text-xs text-stone-500 mt-1">Ask KingdomFlow AI: “Summarize new members this month and suggest follow-up priorities.”</p>
          <Button size="sm" className="mt-3">Ask AI</Button>
        </CardContent>
      </Card>
    </div>
  );
}

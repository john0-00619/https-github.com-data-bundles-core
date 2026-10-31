import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock } from "lucide-react";
const EVENTS = [
  { title:"Sunday Thanksgiving Service", date:"Nov 3 • 8:30 AM", loc:"Main Auditorium", status:"Upcoming", attendees:420 },
  { title:"Youth Conference 2025", date:"Dec 14 • 9:00 AM", loc:"Central + Livestream", status:"Planning", attendees:600 },
  { title:"Community Outreach", date:"Nov 9 • 8:00 AM", loc:"Central Market", status:"Volunteers needed", attendees:120 },
];
export default function EventsPage(){
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="font-display text-2xl font-medium">Events</h1><p className="text-sm text-stone-500">Gatherings, programmes, and volunteer coordination.</p></div><Button><CalendarDays className="h-4 w-4 mr-2" /> New event</Button></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EVENTS.map(e=>(
          <Card key={e.title}><CardContent className="p-5"><Badge variant={e.status==="Upcoming"?"success": e.status==="Planning"?"info":"warning"}>{e.status}</Badge><div className="font-semibold mt-3">{e.title}</div><div className="text-xs text-stone-500 mt-2 space-y-1"><div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.date}</div><div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.loc}</div><div>{e.attendees} expected</div></div><Button variant="secondary" size="sm" className="w-full mt-4">Manage</Button></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

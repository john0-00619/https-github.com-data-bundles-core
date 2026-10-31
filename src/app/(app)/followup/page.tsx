import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export default function FollowupPage(){
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="font-display text-2xl font-medium">Follow-up</h1><p className="text-sm text-stone-500">No one falls through the cracks — visitors, new converts, care needs.</p></div><Button>New follow-up</Button></div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/50"><CardContent className="p-5"><div className="text-sm font-semibold">Due today</div><div className="text-2xl font-display font-semibold mt-1">8</div><div className="text-xs text-stone-600">5 overdue</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm font-semibold">In progress</div><div className="text-2xl font-display font-semibold mt-1">16</div><div className="text-xs text-stone-500">Assigned to leaders</div></CardContent></Card>
        <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-5"><div className="text-sm font-semibold">Completed (week)</div><div className="text-2xl font-display font-semibold mt-1">32</div><div className="text-xs text-emerald-700">↑ 12%</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><div className="font-semibold">Follow-up queue</div></CardHeader>
        <CardContent className="space-y-3">
          {[
            { name:"New Visitor — Sarah O.", reason:"First time • Youth", due:"Today", priority:"High" },
            { name:"Patience A. — Care visit", reason:"Bereavement", due:"Tomorrow", priority:"High" },
            { name:"Emmanuel K. — Baptism class", reason:"New convert", due:"Nov 2", priority:"Medium" },
          ].map(f=>(
            <div key={f.name} className="flex items-center gap-3 p-3 border border-stone-100 rounded-xl">
              <div className="flex-1"><div className="text-sm font-medium">{f.name}</div><div className="text-xs text-stone-500">{f.reason} • Due {f.due}</div></div>
              <Badge variant={f.priority==="High"?"danger":"warning"}>{f.priority}</Badge>
              <Button size="sm" variant="secondary">Take action</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

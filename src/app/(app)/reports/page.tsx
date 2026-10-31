import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
export default function ReportsPage(){
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="font-display text-2xl font-medium">Reports</h1><p className="text-sm text-stone-500">Attendance, growth, giving, and engagement insights.</p></div><Button variant="secondary">Export PDF</Button></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Avg Sunday", value:"318", trend:"↑ 6%" },
          { label:"New visitors (month)", value:"44", trend:"↑ 12%" },
          { label:"Retention", value:"87%", trend:"On target" },
          { label:"Giving (month)", value:"$24,580", trend:"↑ 4%" },
        ].map(s=>(
          <Card key={s.label}><CardContent className="p-5"><div className="text-xs text-stone-500">{s.label}</div><div className="text-xl font-semibold mt-1">{s.value}</div><div className="text-xs text-emerald-600">{s.trend}</div></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><div className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Growth overview</div></CardHeader>
        <CardContent>
          <div className="h-48 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex items-center justify-center text-sm text-stone-500">
            Chart placeholder — integrate Recharts with real attendance data
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

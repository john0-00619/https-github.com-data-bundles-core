import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export default function AttendancePage(){
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="font-display text-2xl font-medium">Attendance</h1><p className="text-sm text-stone-500">Track gatherings, check-ins, and trends.</p></div>
        <Button>Take attendance</Button>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><div className="text-xs text-stone-500">Last Sunday</div><div className="text-2xl font-display font-semibold">342</div><div className="text-xs text-emerald-600">↑ 8% vs previous</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs text-stone-500">Average (4 weeks)</div><div className="text-2xl font-display font-semibold">318</div><div className="text-xs text-stone-500">Stable</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs text-stone-500">Check-in rate</div><div className="text-2xl font-display font-semibold">87%</div><div className="text-xs text-stone-500">QR + manual</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><div className="font-semibold">Service history</div></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-stone-400 uppercase tracking-wide border-b"><th className="text-left py-2">Date</th><th className="text-left py-2">Service</th><th className="text-left py-2">Present</th><th className="text-left py-2">Branch</th><th className="text-left py-2">Status</th></tr></thead>
              <tbody>
                {[
                  ["Oct 27, 2025","Sunday Service",342,"Central"],
                  ["Oct 20, 2025","Sunday Service",318,"Central"],
                  ["Oct 23, 2025","Bible Study",128,"Central"],
                  ["Oct 26, 2025","Youth Fellowship",89,"Central"],
                ].map(r=>(
                  <tr key={String(r[0])+String(r[1])} className="border-b border-stone-100"><td className="py-3">{r[0]}</td><td className="py-3">{r[1]}</td><td className="py-3 font-medium">{r[2]}</td><td className="py-3 text-stone-500">{r[3]}</td><td className="py-3"><Badge variant="success">Recorded</Badge></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

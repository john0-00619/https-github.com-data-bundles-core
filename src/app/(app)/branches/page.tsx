import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Calendar } from "lucide-react";
const BRANCHES = [
  { name:"Grace Chapel Central", loc:"Cape Coast — Main", members:840, pastor:"Rev. Michael Agyeman", status:"Headquarters" },
  { name:"East Legon Branch", loc:"Accra — East Legon", members:420, pastor:"Pastor Kwesi Appiah", status:"Active" },
  { name:"Tema Community", loc:"Tema — Comm. 5", members:310, pastor:"Pastor Hannah Osei", status:"Active" },
  { name:"Cape Coast University", loc:"UCC Campus", members:380, pastor:"Pastor Joseph Mensah", status:"Growing" },
];
export default function BranchesPage(){
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="font-display text-2xl font-medium">Churches & Branches</h1><p className="text-sm text-stone-500">Multi-campus oversight — 12 branches, one workspace.</p></div>
        <Button><Building2 className="h-4 w-4 mr-2" /> New branch</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {BRANCHES.map(b=>(
          <Card key={b.name}>
            <CardHeader className="pb-3">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center"><Building2 className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.loc}</div>
                </div>
                <Badge variant={b.status==="Headquarters"?"info": b.status==="Growing"?"success":"default"}>{b.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-stone-50 rounded-xl p-3"><div className="text-xs text-stone-500">Members</div><div className="font-semibold flex items-center gap-1"><Users className="h-4 w-4" /> {b.members}</div></div>
                <div className="bg-stone-50 rounded-xl p-3"><div className="text-xs text-stone-500">Lead pastor</div><div className="font-medium text-xs">{b.pastor}</div></div>
              </div>
              <div className="flex gap-2"><Button variant="secondary" size="sm" className="flex-1">View members</Button><Button variant="ghost" size="sm" className="flex-1">Reports</Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

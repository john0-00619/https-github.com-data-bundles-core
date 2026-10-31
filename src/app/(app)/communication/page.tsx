import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
export default function CommunicationPage(){
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-medium">Communication Centre</h1><p className="text-sm text-stone-500">Broadcasts, SMS, WhatsApp, Email — one centre.</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><div className="font-semibold">Compose broadcast</div><div className="text-xs text-stone-500">AI can help draft announcements</div></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <select className="h-10 px-3 border border-stone-200 rounded-xl text-sm bg-white"><option>All Members</option><option>Youth</option><option>Leaders</option></select>
              <select className="h-10 px-3 border border-stone-200 rounded-xl text-sm bg-white"><option>WhatsApp</option><option>SMS</option><option>Email</option></select>
            </div>
            <Textarea placeholder="Write your message or ask AI to draft it..." rows={4} />
            <div className="flex gap-2"><Button variant="secondary">✨ Draft with AI</Button><Button>Send broadcast</Button></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="font-semibold">Templates</div></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="p-3 border border-stone-100 rounded-xl hover:bg-stone-50 cursor-pointer"><div className="font-medium">Sunday reminder</div><div className="text-xs text-stone-500">Join us tomorrow 8:30AM...</div></div>
            <div className="p-3 border border-stone-100 rounded-xl hover:bg-stone-50 cursor-pointer"><div className="font-medium">Visitor welcome</div><div className="text-xs text-stone-500">We’re so glad you joined us...</div></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><div className="font-semibold">Recent broadcasts</div></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-stone-400 uppercase tracking-wide border-b"><th className="text-left py-2">Message</th><th className="text-left py-2">Audience</th><th className="text-left py-2">Channel</th><th className="text-left py-2">Delivered</th><th className="text-left py-2">Status</th></tr></thead>
              <tbody>
                <tr className="border-b border-stone-100"><td className="py-3">Youth Conference reminder</td><td className="py-3 text-stone-500">Youth • 890</td><td className="py-3"><Badge variant="info">WhatsApp</Badge></td><td className="py-3">842</td><td className="py-3"><Badge variant="success">Delivered</Badge></td></tr>
                <tr><td className="py-3">Sunday volunteer roster</td><td className="py-3 text-stone-500">Volunteers • 64</td><td className="py-3"><Badge>SMS</Badge></td><td className="py-3">64</td><td className="py-3"><Badge variant="success">Delivered</Badge></td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Shield, Building2, Users, Bell } from "lucide-react";
export default function SettingsPage(){
  return (
    <div className="space-y-6 max-w-[900px]">
      <div><h1 className="font-display text-2xl font-medium">Settings</h1><p className="text-sm text-stone-500">Workspace configuration and administration.</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/settings/ai-providers">
          <Card className="hover:shadow-card transition border-kingdom-200 bg-[#fffbf5]">
            <CardContent className="p-5 flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-ink-900 text-white flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
              <div><div className="font-semibold">AI Management → AI Providers</div><div className="text-xs text-stone-500">Configure Gemini, OpenAI, Grok, Claude</div><div className="text-xs text-kingdom-700 mt-1 font-medium">4 providers • Secure credential storage</div></div>
            </CardContent>
          </Card>
        </Link>
        <Card><CardContent className="p-5 flex gap-3"><div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center"><Building2 className="h-5 w-5" /></div><div><div className="font-semibold">Church profile</div><div className="text-xs text-stone-500">Name, branches, address</div></div></CardContent></Card>
        <Card><CardContent className="p-5 flex gap-3"><div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center"><Users className="h-5 w-5" /></div><div><div className="font-semibold">Roles & permissions</div><div className="text-xs text-stone-500">Pastors, admins, volunteers</div></div></CardContent></Card>
        <Card><CardContent className="p-5 flex gap-3"><div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center"><Shield className="h-5 w-5" /></div><div><div className="font-semibold">Security</div><div className="text-xs text-stone-500">Auth, sessions, audit logs</div></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><div className="font-semibold">Production domain</div><div className="text-xs text-stone-500">All authentication callbacks remain on this deployment — no Zite redirects.</div></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between p-3 bg-stone-50 rounded-xl"><span className="text-stone-500">Site URL</span><span className="font-mono text-xs">{typeof window !== 'undefined' ? window.location.origin : 'https://arena-deployment'}</span></div>
          <div className="flex justify-between p-3 bg-stone-50 rounded-xl"><span className="text-stone-500">Auth callback</span><span className="font-mono text-xs">/api/auth/callback</span></div>
          <div className="flex justify-between p-3 bg-stone-50 rounded-xl"><span className="text-stone-500">Email verification</span><span className="font-mono text-xs">/verify?token=...</span></div>
        </CardContent>
      </Card>
    </div>
  );
}

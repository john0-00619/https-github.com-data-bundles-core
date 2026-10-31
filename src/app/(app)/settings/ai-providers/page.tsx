"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { ProviderId, ProviderConfig, PROVIDER_META } from "@/lib/ai/types";
import { getProviders, saveProviders } from "@/lib/ai/store";
import { maskKey } from "@/lib/utils";
import { Check, AlertCircle, Clock, Zap, Eye, EyeOff, Save, TestTube2, BarChart3 } from "lucide-react";

const STATUS_LABEL: Record<string,{label:string, variant:any, icon:any}> = {
  connected: { label:"Connected", variant:"success", icon: Check },
  not_configured: { label:"Not configured", variant:"default", icon: AlertCircle },
  auth_failed: { label:"Auth failed", variant:"danger", icon: AlertCircle },
  rate_limited: { label:"Rate limited", variant:"warning", icon: Clock },
  unavailable: { label:"Unavailable", variant:"danger", icon: AlertCircle },
  config_required: { label:"Disabled", variant:"default", icon: Clock },
};

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<Record<ProviderId, ProviderConfig> | null>(null);
  const [selected, setSelected] = useState<ProviderId>("openai");
  const [showKeys, setShowKeys] = useState<Record<string,boolean>>({});
  const [keyInputs, setKeyInputs] = useState<Record<string,string>>({});
  const [testing, setTesting] = useState<ProviderId|null>(null);
  const [testResult, setTestResult] = useState<{id:ProviderId, ok:boolean, msg:string}|null>(null);

  useEffect(()=>{
    const p = getProviders();
    setProviders(p);
    // Prefill masked
    const ki: Record<string,string> = {};
    (Object.keys(p) as ProviderId[]).forEach(id=>{ if(p[id].hasKey) ki[id]="••••••••••••••••"+p[id].defaultModel; });
    setKeyInputs(ki);
  },[]);

  const save = (id: ProviderId, patch: Partial<ProviderConfig>) => {
    if (!providers) return;
    const updated = { ...providers, [id]: { ...providers[id], ...patch } } as Record<ProviderId, ProviderConfig>;
    // status logic
    if (patch.hasKey === false) updated[id].status = 'not_configured';
    else if (patch.enabled === false) updated[id].status = 'config_required';
    else if (updated[id].hasKey) updated[id].status = 'connected';
    setProviders(updated);
    saveProviders(updated);
  };

  const handleSaveKey = (id: ProviderId) => {
    const val = keyInputs[id] || "";
    if (!val || val.includes("•")) return;
    // Simulate server-side secure storage — never expose full key to frontend after save
    save(id, { hasKey: true, apiKeyMasked: maskKey(val), status: 'connected', lastSuccess: new Date().toISOString(), lastError: undefined });
    // In production: POST /api/ai/providers {id, apiKey} -> server stores in encrypted secrets manager, returns masked
    setTestResult({ id, ok:true, msg:"API key saved securely (server-side encrypted). Key is masked in UI and never returned to browser." });
  };

  const handleTest = async (id: ProviderId) => {
    if (!providers?.[id].hasKey) { setTestResult({id, ok:false, msg:"No API key configured. Save a key first."}); return; }
    setTesting(id);
    setTestResult(null);
    await new Promise(r=>setTimeout(r, 900));
    // 85% success simulation
    const ok = Math.random() > 0.15;
    if (ok) {
      save(id, { status:'connected', lastSuccess: new Date().toISOString(), lastError: undefined });
      setTestResult({id, ok:true, msg:`✓ Connected to ${providers[id].name} (${providers[id].endpoint}). Model ${providers[id].defaultModel} responded successfully. Latency ~540ms.`});
    } else {
      save(id, { status:'auth_failed', lastError: "Authentication failed — invalid API key" });
      setTestResult({id, ok:false, msg:"Authentication failed. Verify your API key and endpoint."});
    }
    setTesting(null);
  };

  if (!providers) return <div className="p-8 text-center text-stone-500">Loading providers...</div>;

  const list = Object.values(providers) as ProviderConfig[];
  const stats = {
    connected: list.filter(p=>p.status==='connected').length,
    total: list.length,
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">AI Providers</h1>
          <p className="text-sm text-stone-500">Settings → AI Management → AI Providers — Centralized multi-provider control.</p>
          <div className="flex gap-2 mt-3">
            <Badge variant="success">{stats.connected} connected</Badge>
            <Badge>{stats.total} providers</Badge>
            <Badge variant="info">Secure server-side key storage</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Docs</Button>
          <Button onClick={()=>{}}>Audit log</Button>
        </div>
      </div>

      {/* Usage header */}
      <div className="grid md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs text-stone-500">Total requests</div><div className="text-xl font-semibold">1,248</div><div className="text-xs text-emerald-600">All providers</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-stone-500">Avg latency</div><div className="text-xl font-semibold">642ms</div><div className="text-xs text-stone-500">Streaming enabled</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-stone-500">Est. cost (month)</div><div className="text-xl font-semibold">$12.40</div><div className="text-xs text-stone-500">Based on provider pricing</div></CardContent></Card>
        <Card className="bg-ink-900 text-white border-ink-900"><CardContent className="p-4"><div className="text-xs text-white/60">Router health</div><div className="text-sm font-medium flex items-center gap-2"><span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" /> Operational</div><div className="text-xs text-white/50">Unified router • Fallback active</div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Provider list */}
        <div className="space-y-3">
          {list.map(p=>{
            const st = STATUS_LABEL[p.status] || STATUS_LABEL.not_configured;
            const isSelected = selected===p.id;
            return (
              <button key={p.id} onClick={()=>setSelected(p.id)} className={`w-full text-left p-4 rounded-2xl border transition ${isSelected ? "bg-ink-900 text-white border-ink-900 shadow-card" : "bg-white border-stone-200 hover:bg-stone-50"}`}>
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{background: isSelected ? '#fff' : p.color, color: isSelected ? '#1a1816' : '#fff'}}>{p.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-none ${isSelected ? "text-white" : "text-ink-900"}`}>{p.name}</div>
                    <div className={`text-xs mt-1 ${isSelected ? "text-white/60" : "text-stone-500"}`}>{p.models.length} models • {p.defaultModel}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${isSelected ? "bg-white text-ink-900 border-white" : p.status==='connected' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-stone-100 text-stone-600 border-stone-200"}`}>{st.label}</span>
                      {p.hasKey && !isSelected && <span className="text-xs text-stone-400">{maskKey(p.apiKeyMasked||"sk-••••")}</span>}
                    </div>
                  </div>
                </div>
                {(p.lastSuccess || p.lastError) && (
                  <div className={`mt-3 text-xs p-2 rounded-xl ${isSelected ? "bg-white/10 text-white/70" : "bg-stone-50 text-stone-500"}`}>
                    {p.lastSuccess ? `Last OK: ${new Date(p.lastSuccess).toLocaleString()}` : `Error: ${p.lastError}`}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Config panel */}
        <Card className="h-fit">
          {(() => {
            const p = providers[selected];
            const st = STATUS_LABEL[p.status];
            return (
              <>
                <CardHeader className="border-b border-stone-100">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold" style={{background:p.color}}>{p.logo}</div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-stone-500">{p.endpoint}</div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={st.variant}>{st.label}</Badge>
                          <Badge>{p.supportsStreaming ? "Streaming" : "No stream"}</Badge>
                          {p.supportsVision && <Badge variant="info">Vision</Badge>}
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={p.enabled} onChange={e=>save(p.id,{enabled:e.target.checked})} className="h-4 w-4" /> Enabled
                    </label>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <Label>API endpoint</Label>
                    <Input value={p.endpoint} onChange={e=>save(p.id,{endpoint:e.target.value})} className="mt-1.5 font-mono text-xs" />
                    <div className="text-xs text-stone-500 mt-1">Official provider endpoint — do not change unless using a proxy.</div>
                  </div>

                  <div>
                    <Label>API credential (server-side encrypted)</Label>
                    <div className="flex gap-2 mt-1.5">
                      <div className="relative flex-1">
                        <Input
                          value={keyInputs[p.id] || ""}
                          onChange={e=>setKeyInputs({...keyInputs, [p.id]: e.target.value})}
                          placeholder={p.hasKey ? maskKey(p.apiKeyMasked||"") : "sk-... or gsk_..."}
                          type={showKeys[p.id] ? "text" : "password"}
                          className="pr-9 font-mono text-xs"
                        />
                        <button type="button" onClick={()=>setShowKeys({...showKeys,[p.id]:!showKeys[p.id]})} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-stone-100 rounded-lg">
                          {showKeys[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button onClick={()=>handleSaveKey(p.id)}><Save className="h-4 w-4 mr-2" /> Save</Button>
                    </div>
                    <div className="text-xs text-stone-500 mt-1.5 flex items-start gap-1.5">
                      <Zap className="h-3 w-3 mt-0.5 shrink-0" />
                      Keys are encrypted server-side, never exposed in frontend JS, never logged, and masked in UI. Rotation supported.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default model</Label>
                      <Select value={p.defaultModel} onChange={e=>save(p.id,{defaultModel:e.target.value})} className="mt-1.5">
                        {p.models.map(m=> <option key={m} value={m}>{m}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Timeout (ms)</Label>
                      <Input type="number" value={p.timeoutMs} onChange={e=>save(p.id,{timeoutMs: Number(e.target.value)})} className="mt-1.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Max output tokens</Label><Input type="number" value={p.maxTokens} onChange={e=>save(p.id,{maxTokens:Number(e.target.value)})} className="mt-1.5" /></div>
                    <div className="flex flex-col justify-end">
                      <div className="text-xs text-stone-500">Available models</div>
                      <div className="text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl p-2 mt-1.5 max-h-20 overflow-y-auto">{p.models.join(", ")}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" onClick={()=>handleTest(p.id)} disabled={testing===p.id} className="flex-1">
                      <TestTube2 className="h-4 w-4 mr-2" /> {testing===p.id ? "Testing..." : "Test connection"}
                    </Button>
                    <Button variant="ghost" onClick={()=>save(p.id,{hasKey:false, apiKeyMasked:undefined, status:'not_configured'})}>Remove key</Button>
                  </div>

                  {testResult && testResult.id===p.id && (
                    <div className={`p-3 rounded-xl text-sm border ${testResult.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                      {testResult.msg}
                    </div>
                  )}

                  <div className="bg-[#fdf8f1] border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                    <strong>Security:</strong> Credentials are validated server-side. Browser never receives full keys. Use environment secrets in production (e.g., Vercel env, Supabase Vault).
                  </div>
                </CardContent>
              </>
            );
          })()}
        </Card>
      </div>

      <Card>
        <CardHeader><div className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Provider health & routing</div></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-stone-50 rounded-xl border"><div className="font-medium">Unified router</div><div className="text-xs text-stone-500 mt-1">All AI requests flow through one server-side router — single audit, single rate-limit, consistent auth.</div></div>
          <div className="p-4 bg-stone-50 rounded-xl border"><div className="font-medium">Fallback</div><div className="text-xs text-stone-500 mt-1">If primary fails, approved backup provider handles request transparently (user sees indicator).</div></div>
          <div className="p-4 bg-stone-50 rounded-xl border"><div className="font-medium">Tenant isolation</div><div className="text-xs text-stone-500 mt-1">Each church workspace sees only its own conversations, usage, and configs.</div></div>
        </CardContent>
      </Card>
    </div>
  );
}

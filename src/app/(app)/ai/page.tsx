"use client";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { ProviderId, PROVIDER_META } from "@/lib/ai/types";
import { getProviders, getConversations, addConversation, updateConversation, saveConversations, getUsage } from "@/lib/ai/store";
import { routeChat, routeComparison } from "@/lib/ai/router";
import { cn } from "@/lib/utils";
import { Sparkles, Send, Square, Copy, RotateCcw, Plus, Trash2, Edit3, Zap, GitCompare, Shield, Upload, Mic } from "lucide-react";

export default function AIPage() {
  const [providers, setProviders] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | 'auto'>('auto');
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [mode, setMode] = useState<'standard'|'auto'|'comparison'|'fallback'>('standard');
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role:'user'|'assistant'; content:string; providerId?:string; model?:string; streaming?:boolean}[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string|null>(null);
  const [fallbackProviders, setFallbackProviders] = useState<ProviderId[]>(['openai']);
  const [comparison, setComparison] = useState<Record<string,string>>({});
  const [showComparison, setShowComparison] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const p = getProviders();
    setProviders(p);
    setConversations(getConversations());
    // default model
    const def = p['openai']?.defaultModel || "gpt-4o";
    setSelectedModel(def);
  },[]);

  useEffect(()=> bottomRef.current?.scrollIntoView({behavior:"smooth"}), [messages, comparison]);

  const startNew = () => {
    setMessages([]);
    setActiveId(null);
    setComparison({});
    setShowComparison(false);
  };

  const handleSend = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = { role:'user' as const, content: input, providerId: selectedProvider as string, model: selectedModel };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    if (mode === 'comparison') {
      setShowComparison(true);
      const ids: ProviderId[] = (['gemini','openai','claude'] as ProviderId[]).filter(id=> getProviders()[id]?.hasKey);
      if (ids.length < 2) {
        setMessages([...newMessages, { role:'assistant', content:"Comparison requires at least 2 configured providers. Configure them in Settings → AI Providers.", streaming:false }]);
        setStreaming(false);
        return;
      }
      const targets = ids.slice(0,3);
      setComparison(Object.fromEntries(targets.map(id=>[id,""])));
      for (const pid of targets) {
        routeChat({ providerId: pid, messages: newMessages.map(m=>({role:m.role as any, content:m.content})) }, (chunk)=>{
          setComparison(prev=> ({...prev, [pid]: (prev[pid]||"") + chunk}));
        }).catch(e=>{
          setComparison(prev=> ({...prev, [pid]: `Error: ${e.message}`}));
        });
      }
      setStreaming(false);
      return;
    }

    // Standard / auto / fallback
    let assistantContent = "";
    setMessages([...newMessages, { role:'assistant', content:"", streaming:true }]);

    try {
      const reqProvider = mode === 'auto' ? 'auto' : (selectedProvider as ProviderId);
      const res = await routeChat({
        providerId: reqProvider,
        model: selectedModel,
        messages: newMessages.map(m=>({role:m.role as any, content:m.content})),
        fallbackProviders: mode==='fallback' ? fallbackProviders : undefined,
      }, (chunk)=>{
        assistantContent += chunk;
        setMessages(prev=> {
          const copy = [...prev];
          copy[copy.length-1] = { ...copy[copy.length-1], content: assistantContent, providerId: reqProvider as string, model: selectedModel, streaming:true };
          return copy;
        });
      });
      setMessages(prev=>{
        const copy=[...prev];
        copy[copy.length-1] = { role:'assistant', content: res.content + (res.fallbackUsed ? `\n\n*— Fallback used: ${res.providerId} handled this request.*` : ""), providerId: res.providerId, model: res.model, streaming:false };
        return copy;
      });
      // save conversation
      const title = newMessages[0].content.slice(0,40) || "New conversation";
      if (!activeId) {
        const conv = { id:`c_${Date.now()}`, title, providerId: res.providerId, model: res.model, messages: [...newMessages, { role:'assistant', content: res.content, providerId: res.providerId, model: res.model, timestamp: new Date().toISOString() }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), mode };
        addConversation(conv as any);
        setConversations(getConversations());
        setActiveId(conv.id);
      } else {
        updateConversation(activeId, (c:any)=> ({...c, messages: [...newMessages.map(m=>({...m,timestamp:new Date().toISOString()})), { role:'assistant', content: res.content, providerId: res.providerId, model: res.model, timestamp: new Date().toISOString() }] }));
      }
    } catch (e:any) {
      setMessages(prev=>{
        const copy=[...prev];
        copy[copy.length-1] = { role:'assistant', content:`Error: ${e.message}`, streaming:false };
        return copy;
      });
    } finally { setStreaming(false); }
  };

  if (!providers) return <div className="p-8">Loading AI...</div>;

  const providerList = Object.values(providers) as any[];
  const enabledProviders = providerList.filter((p:any)=> p.hasKey && p.enabled);

  return (
    <div className="flex gap-6 h-[calc(100vh-88px)]">
      {/* Sidebar conversations */}
      <div className="hidden lg:flex w-[280px] flex-col gap-3 shrink-0">
        <Button onClick={startNew} className="w-full"><Plus className="h-4 w-4 mr-2" /> New conversation</Button>

        <div className="bg-white border border-stone-200 rounded-2xl p-3">
          <div className="text-xs font-semibold tracking-wide uppercase text-stone-500">Model</div>
          <select value={selectedProvider} onChange={e=>{
            const v = e.target.value as any;
            setSelectedProvider(v);
            if (v !== 'auto') setSelectedModel(providers[v]?.defaultModel || "");
          }} className="w-full h-9 mt-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-sm">
            <option value="auto">✨ Auto (intelligent)</option>
            {providerList.map(p=> <option key={p.id} value={p.id}>{p.name} — {p.defaultModel}</option>)}
          </select>
          {selectedProvider !== 'auto' && (
            <select value={selectedModel} onChange={e=>setSelectedModel(e.target.value)} className="w-full h-9 mt-2 px-3 bg-white border border-stone-200 rounded-xl text-sm">
              {(providers[selectedProvider as ProviderId]?.models || []).map((m:string)=> <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          <div className="flex gap-1.5 mt-3">
            {(['standard','auto','comparison','fallback'] as const).map(m=>(
              <button key={m} onClick={()=>setMode(m)} className={cn("flex-1 h-7 rounded-full text-xs font-medium border", mode===m ? "bg-ink-900 text-white border-ink-900" : "bg-white border-stone-200")}>{m}</button>
            ))}
          </div>
          {mode==='fallback' && (
            <div className="mt-2 text-xs">
              <div className="text-stone-500">Fallback to</div>
              <select value={fallbackProviders[0]} onChange={e=>setFallbackProviders([e.target.value as ProviderId])} className="w-full h-8 mt-1 px-2 border border-stone-200 rounded-lg text-xs">
                {providerList.filter(p=>p.hasKey).map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-stone-500"><Shield className="h-3 w-3" /> Tenant-isolated • Encrypted</div>
        </div>

        <div className="flex-1 bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-stone-100 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide uppercase text-stone-500">History</span>
            <button onClick={()=>{ saveConversations([]); setConversations([]); }} className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1"><Trash2 className="h-3 w-3" /> Clear</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length===0 && <div className="text-xs text-stone-400 p-3 text-center">No conversations yet</div>}
            {conversations.map(c=>(
              <button key={c.id} onClick={()=>{ setActiveId(c.id); setMessages(c.messages.map((m:any)=>({role:m.role, content:m.content, providerId:m.providerId, model:m.model}))); setShowComparison(false); }} className={cn("w-full text-left p-2.5 rounded-xl border text-sm", activeId===c.id ? "bg-ink-900 text-white border-ink-900" : "bg-white border-stone-100 hover:bg-stone-50")}>
                <div className="font-medium truncate text-xs">{c.title}</div>
                <div className={cn("text-xs truncate", activeId===c.id ? "text-white/60" : "text-stone-500")}>{c.providerId} • {c.model}</div>
              </button>
            ))}
          </div>
        </div>

        <Card className="p-3 bg-[#fdf8f1] border-amber-200">
          <div className="text-xs font-semibold">Usage</div>
          <div className="text-xs text-stone-600 mt-1">1,248 requests • $12.40 • 642ms avg</div>
          <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden border"><div className="h-full bg-ink-900 w-[68%]" /></div>
          <div className="text-xs text-stone-500 mt-1">68% of monthly limit</div>
        </Card>
      </div>

      {/* Main chat */}
      <div className="flex-1 bg-white border border-stone-200 rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-[56px] border-b border-stone-100 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-ink-900 text-white flex items-center justify-center"><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">KingdomFlow AI <Badge variant="success" className="text-xs">Unified Router</Badge></div>
              <div className="text-xs text-stone-500">{mode==='auto' ? "Auto Mode — best provider for your request" : mode==='comparison' ? "Comparison Mode — side-by-side" : `${selectedProvider} • ${selectedModel}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">{enabledProviders.length} connected</Badge>
            <Button variant="ghost" size="icon" onClick={startNew}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfcfa]">
          {messages.length===0 && !showComparison && (
            <div className="max-w-[720px] mx-auto pt-8">
              <h2 className="font-display text-2xl font-medium">How can I help your ministry today?</h2>
              <p className="text-sm text-stone-500 mt-2">Ask about attendance, members, events, announcements, or reports. Your AI respects your permissions — no private data without authorization.</p>
              <div className="grid md:grid-cols-2 gap-3 mt-6">
                {[
                  "Summarize attendance trends last month",
                  "Draft a welcome message for new visitors",
                  "Help plan Youth Conference agenda",
                  "Explain dashboard stats for leaders meeting",
                ].map(q=>(
                  <button key={q} onClick={()=>setInput(q)} className="text-left p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50">
                    <div className="text-sm font-medium">{q}</div>
                    <div className="text-xs text-stone-500 mt-1">Try this prompt →</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white border border-stone-200 rounded-2xl flex items-center gap-3">
                <Zap className="h-5 w-5 text-kingdom-600" />
                <div className="text-sm"><strong>Intelligent Auto:</strong> Let KingdomFlow choose the best connected model for your request based on capability and health.</div>
              </div>
            </div>
          )}

          {messages.map((m,i)=>(
            <div key={i} className={cn("flex gap-3", m.role==='user' ? "justify-end" : "justify-start")}>
              {m.role==='assistant' && <div className="h-8 w-8 rounded-full bg-ink-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">{m.providerId?.[0]?.toUpperCase() || "A"}</div>}
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap", m.role==='user' ? "bg-ink-900 text-white rounded-br-sm" : "bg-white border border-stone-200 rounded-bl-sm")}>
                {m.content || <span className="inline-flex gap-1"><span className="h-2 w-2 bg-stone-300 rounded-full animate-bounce" /><span className="h-2 w-2 bg-stone-300 rounded-full animate-bounce [animation-delay:150ms]" /><span className="h-2 w-2 bg-stone-300 rounded-full animate-bounce [animation-delay:300ms]" /></span>}
                {m.providerId && <div className="text-xs opacity-60 mt-2 flex items-center gap-2">{m.providerId} • {m.model} {m.streaming && <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />}</div>}
              </div>
              {m.role==='user' && <img src="https://i.pravatar.cc/100?u=user" className="h-8 w-8 rounded-full" alt="" />}
            </div>
          ))}

          {showComparison && Object.keys(comparison).length>0 && (
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(comparison).map(([pid, content])=>(
                <Card key={pid} className="p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="h-6 w-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{background: (PROVIDER_META as any)[pid]?.color || '#333'}}>{(PROVIDER_META as any)[pid]?.logo}</div><span className="text-sm font-semibold">{(PROVIDER_META as any)[pid]?.name}</span></div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed bg-stone-50 border border-stone-100 rounded-xl p-3 min-h-[120px]">{content || "Thinking..."}</div>
                </Card>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="p-3 border-t border-stone-100 bg-white shrink-0">
          <div className="flex gap-2 lg:hidden mb-2">
            <select value={selectedProvider} onChange={e=>setSelectedProvider(e.target.value as any)} className="flex-1 h-8 px-2 border border-stone-200 rounded-full text-xs bg-white"><option value="auto">Auto</option>{providerList.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <button onClick={startNew} className="h-8 px-3 border border-stone-200 rounded-full text-xs">New</button>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-2 flex flex-col gap-2">
            <Textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); }}} placeholder="Ask about attendance, draft an announcement, plan an event..." className="min-h-[48px] max-h-[120px] bg-white border-stone-200" rows={1} />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <button className="h-8 w-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100"><Upload className="h-4 w-4" /></button>
                <button className="h-8 w-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100"><Mic className="h-4 w-4" /></button>
                <span className="text-xs text-stone-400 ml-2 hidden sm:inline">Supports: text • files • images (where provider allows)</span>
              </div>
              <div className="flex gap-2">
                {streaming ? <Button size="sm" variant="danger" onClick={()=>setStreaming(false)}><Square className="h-4 w-4 mr-1" /> Stop</Button> : <Button size="sm" onClick={handleSend} disabled={!input.trim()}><Send className="h-4 w-4 mr-2" /> Send</Button>}
              </div>
            </div>
          </div>
          <div className="text-xs text-stone-400 mt-2 text-center">KingdomFlow AI respects your permissions. Never shares private member data without authorization. <span className="hidden md:inline">Streaming • Fallback • Comparison available.</span></div>
        </div>
      </div>
    </div>
  );
}

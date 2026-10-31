"use client";
import { ProviderId, ProviderConfig, AIConversation, AIUsage, PROVIDER_META, ProviderStatus } from "./types";

const PROVIDERS_KEY = "kf_ai_providers_v2";
const CONVERSATIONS_KEY = "kf_ai_conversations_v2";
const USAGE_KEY = "kf_ai_usage_v2";

function loadProviders(): Record<ProviderId, ProviderConfig> {
  if (typeof window === 'undefined') return buildDefaults();
  try {
    const raw = localStorage.getItem(PROVIDERS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // merge with defaults to keep new models
      const defaults = buildDefaults();
      for (const k of Object.keys(saved) as ProviderId[]) {
        if (defaults[k]) defaults[k] = { ...defaults[k], ...saved[k] };
      }
      return defaults;
    }
  } catch {}
  return buildDefaults();
}

function buildDefaults(): Record<ProviderId, ProviderConfig> {
  const out: any = {};
  (Object.keys(PROVIDER_META) as ProviderId[]).forEach(id => {
    const m = PROVIDER_META[id];
    out[id] = {
      id,
      name: m.name,
      logo: m.logo,
      color: m.color,
      endpoint: m.endpoint,
      hasKey: false,
      models: m.models,
      defaultModel: m.defaultModel,
      enabled: ['gemini','openai','claude','grok'].includes(id) ? true : false,
      status: 'not_configured' as ProviderStatus,
      timeoutMs: 30000,
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: id === 'openai' || id === 'gemini' || id === 'claude',
      supportsTools: true,
    };
  });
  return out;
}

export function getProviders(): Record<ProviderId, ProviderConfig> { return loadProviders(); }
export function saveProviders(p: Record<ProviderId, ProviderConfig>) {
  localStorage.setItem(PROVIDERS_KEY, JSON.stringify(p));
}
export function saveProvider(id: ProviderId, patch: Partial<ProviderConfig>) {
  const all = getProviders();
  all[id] = { ...all[id], ...patch };
  // determine status
  if (!all[id].hasKey) all[id].status = 'not_configured';
  else if (!all[id].enabled) all[id].status = 'config_required';
  saveProviders(all);
  return all[id];
}

// Conversations
export function getConversations(): AIConversation[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]"); } catch { return []; }
}
export function saveConversations(list: AIConversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list));
}
export function addConversation(c: AIConversation) {
  const list = getConversations();
  list.unshift(c);
  saveConversations(list);
  return c;
}
export function updateConversation(id: string, fn: (c: AIConversation)=>AIConversation) {
  const list = getConversations();
  const idx = list.findIndex(x=>x.id===id);
  if (idx>=0) { list[idx]=fn(list[idx]); saveConversations(list); }
}

// Usage
export function getUsage(): AIUsage[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) || "[]"); } catch { return []; }
}
export function recordUsage(u: AIUsage) {
  const list = getUsage();
  list.unshift(u);
  if (list.length>500) list.length=500;
  localStorage.setItem(USAGE_KEY, JSON.stringify(list));
}
export function getUsageStats() {
  const usage = getUsage();
  const now = Date.now();
  const dayAgo = now - 24*3600*1000;
  const monthAgo = now - 30*24*3600*1000;
  return {
    total: usage.length,
    success: usage.filter(u=>u.success).length,
    failed: usage.filter(u=>!u.success).length,
    byProvider: (usage as any).groupBy ? (usage as any) : usage.reduce((a:any,c)=>{(a[c.providerId]=(a[c.providerId]||0)+1);return a;},{}),
    tokensIn: usage.reduce((s,u)=>s+u.tokensIn,0),
    tokensOut: usage.reduce((s,u)=>s+u.tokensOut,0),
    cost: usage.reduce((s,u)=>s+u.cost,0),
    daily: usage.filter(u=> new Date(u.timestamp).getTime() > dayAgo).length,
    monthly: usage.filter(u=> new Date(u.timestamp).getTime() > monthAgo).length,
    avgLatency: usage.length? Math.round(usage.reduce((s,u)=>s+u.latencyMs,0)/usage.length):0,
  };
}

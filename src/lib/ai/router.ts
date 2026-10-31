// Unified AI Router — client-side simulation with server-compatible interface
// In production, API keys are stored server-side (env vars / secrets manager) and router runs server-side.
// This client simulation demonstrates the full architecture without exposing keys.
import { ProviderId } from "./types";
import { getProviders, recordUsage } from "./store";

export interface ChatRequest {
  providerId: ProviderId | 'auto';
  model?: string;
  messages: { role: 'user'|'assistant'|'system'; content: string }[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
  fallbackProviders?: ProviderId[];
  conversationId?: string;
}

export interface ChatResponse {
  content: string;
  providerId: ProviderId;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  fallbackUsed?: boolean;
}

function estimateTokens(text: string) { return Math.ceil(text.length / 4); }
function estimateCost(provider: ProviderId, tokensIn: number, tokensOut: number) {
  const pricing: Record<string, number> = { gemini: 0.0000015, openai: 0.000005, grok: 0.000005, claude: 0.000015, deepseek: 0.0000014, mistral: 0.000002, openrouter: 0.000003 };
  return (pricing[provider] || 0.000003) * (tokensIn + tokensOut*3);
}

// Mock streaming that mimics real provider latencies
export async function routeChat(req: ChatRequest, onChunk?: (chunk: string)=>void): Promise<ChatResponse> {
  const providers = getProviders();
  let target: ProviderId;

  if (req.providerId === 'auto') {
    // Intelligent auto: pick first connected & enabled
    const candidates: ProviderId[] = ['gemini','openai','claude','grok','deepseek','mistral','openrouter'];
    const found = candidates.find(id => providers[id]?.hasKey && providers[id].enabled && providers[id].status !== 'auth_failed');
    if (!found) throw new Error("No AI providers are configured. Please configure at least one provider in Settings → AI Providers.");
    target = found;
  } else {
    target = req.providerId as ProviderId;
    const cfg = providers[target];
    if (!cfg?.hasKey) throw new Error(`${cfg?.name || target} is not configured. Add API key in Settings → AI Providers.`);
    if (!cfg.enabled) throw new Error(`${cfg.name} is disabled. Enable it in AI Providers.`);
  }

  const cfg = providers[target];
  const model = req.model || cfg.defaultModel;
  const prompt = req.messages.map(m=>m.content).join("\n");
  const tokensIn = estimateTokens(prompt);

  const start = Date.now();
  // Simulate provider latency 400-1200ms
  await new Promise(r=> setTimeout(r, 400 + Math.random()*600));

  // Simulate occasional failures for fallback demo
  const shouldFallback = Math.random() < 0.06 && req.fallbackProviders?.length;
  if (shouldFallback) {
    const fallback = req.fallbackProviders![0];
    const fbCfg = providers[fallback];
    if (fbCfg?.hasKey) {
      // retry with fallback
      const content = await generateMockResponse(prompt, fallback, model, onChunk);
      const latency = Date.now() - start;
      const tokensOut = estimateTokens(content);
      const resp: ChatResponse = { content, providerId: fallback, model: fbCfg.defaultModel, tokensIn, tokensOut, latencyMs: latency, fallbackUsed: true };
      recordUsage({ id: `u_${Date.now()}`, providerId: fallback, model: resp.model, tokensIn, tokensOut, cost: estimateCost(fallback, tokensIn, tokensOut), latencyMs: latency, success: true, timestamp: new Date().toISOString() });
      return resp;
    }
  }

  // 3% auth failure simulation if key looks invalid
  if (cfg.hasKey && Math.random() < 0.03) {
    recordUsage({ id:`u_${Date.now()}`, providerId: target, model, tokensIn, tokensOut:0, cost:0, latencyMs: Date.now()-start, success:false, timestamp: new Date().toISOString() });
    throw new Error(`${cfg.name} authentication failed. Please verify your API key.`);
  }

  const content = await generateMockResponse(prompt, target, model, onChunk);
  const latency = Date.now() - start;
  const tokensOut = estimateTokens(content);
  const resp: ChatResponse = { content, providerId: target, model, tokensIn, tokensOut, latencyMs: latency };
  recordUsage({ id:`u_${Date.now()}`, providerId: target, model, tokensIn, tokensOut, cost: estimateCost(target, tokensIn, tokensOut), latencyMs: latency, success:true, timestamp: new Date().toISOString() });
  // update lastSuccess
  const all = getProviders();
  all[target].lastSuccess = new Date().toISOString();
  all[target].status = 'connected';
  localStorage.setItem("kf_ai_providers_v2", JSON.stringify(all));
  return resp;
}

async function generateMockResponse(prompt: string, provider: ProviderId, model: string, onChunk?: (c:string)=>void): Promise<string> {
  const lower = prompt.toLowerCase();
  let base = "";

  // Church-context aware responses
  if (lower.includes("attendance") || lower.includes("trend")) {
    base = `Based on your KingdomFlow attendance data:\n\n• **Sunday Service** avg: 342 (↑ 8% vs last month)\n• **Wednesday Bible Study**: 128 (stable)\n• **Youth Fellowship**: 89 (↑ 12%)\n• **Peak**: Easter Sunday (512)\n\n**Recommendation:** Your Wednesday attendance is steady but youth growth suggests investing in follow-up for new young members. Would you like me to draft a follow-up plan or generate a report summary?`;
  } else if (lower.includes("member") || lower.includes("follow up")) {
    base = `Here's a follow-up plan for new members:\n\n1. **Day 1:** Welcome SMS + assign to care group\n2. **Day 3:** Call from group leader\n3. **Day 7:** Invite to next fellowship meal\n4. **Day 14:** Integration check — attendance & serving interest\n\nI can generate personalised messages or pull the list of members awaiting follow-up. Shall I create those?`;
  } else if (lower.includes("announcement") || lower.includes("announce")) {
    base = `**Draft Announcement — Sunday Service**\n\n> Grace Family,\n> Join us this Saturday 8AM for our Community Outreach at Central Market. Transport leaves the church at 7:15AM. Invite a friend!\n> — Media Team\n\nTone: warm, concise. I can adapt this for WhatsApp, SMS, or Sunday slide.`;
  } else if (lower.includes("event") || lower.includes("program")) {
    base = `I can help organize your programme:\n\n**Proposed Timeline — Youth Conference (Dec 14)**\n08:00 Setup & Soundcheck\n09:00 Worship & Opening\n10:30 Session 1 — Identity in Christ\n12:00 Breakouts\n13:30 Lunch\n\nWant me to create an event in KingdomFlow and draft the volunteer roster?`;
  } else if (lower.includes("report") || lower.includes("dashboard")) {
    base = `Your dashboard shows strong engagement. Key insights:\n- Member retention 87% (target 85%)\n- New visitors last month: 44, 62% returned\n- Giving consistent, +4% quarter-on-quarter\n\nI can explain any chart or export a summary for your leaders meeting.`;
  } else if (lower.includes("pray") || lower.includes("sermon") || lower.includes("bible")) {
    base = `I'd love to help with that spiritual preparation. Share more detail — passage, theme, or audience — and I'll help outline, research context, or draft prayer points while keeping theological decisions in your hands.`;
  } else {
    const intros: Record<ProviderId,string> = {
      gemini: "As Gemini, I'm here to help with your ministry operations —",
      openai: "As GPT, I can assist you with planning, writing, and analysis —",
      grok: "As Grok, with a straightforward perspective —",
      claude: "As Claude, focused on thoughtful, detailed support —",
      deepseek: "As DeepSeek —",
      mistral: "As Mistral —",
      openrouter: "Via OpenRouter —",
    };
    base = `${intros[provider] || ""} Thanks for your message.\n\nI understand you're working on **KingdomFlow**, your church management workspace. I can help with attendance analysis, member follow-up, event planning, announcements, reports, and general productivity — all within your permissions.\n\n**What I'm responding to:** "${prompt.slice(0,120)}..."\n\n**Model:** ${model} · **Provider:** ${provider}\n\nHow would you like to proceed? I can also access your authorized church data through secure tools when you ask.`;
  }

  if (onChunk) {
    // stream word by word
    const words = base.split(/(\s+)/);
    let acc = "";
    for (const w of words) {
      acc += w;
      onChunk(w);
      await new Promise(r=> setTimeout(r, 18 + Math.random()*22));
    }
    return base;
  }
  return base;
}

export async function routeComparison(prompt: string, providerIds: ProviderId[], onUpdate?: (id:ProviderId, chunk:string, done:boolean)=>void) {
  const results: Record<string, { content:string; done:boolean; providerId:ProviderId; model:string; latency:number }> = {};
  await Promise.all(providerIds.map(async pid => {
    const start = Date.now();
    let content = "";
    try {
      const res = await routeChat({ providerId: pid, messages:[{role:'user', content: prompt}] }, (ch)=>{
        content += ch;
        onUpdate?.(pid, ch, false);
      });
      content = res.content;
      results[pid] = { content, done:true, providerId: pid, model: res.model, latency: res.latencyMs };
      onUpdate?.(pid, "", true);
    } catch (e:any) {
      results[pid] = { content: `Error: ${e.message}`, done:true, providerId: pid, model: getProviders()[pid]?.defaultModel||'', latency: Date.now()-start };
      onUpdate?.(pid, `Error: ${e.message}`, true);
    }
  }));
  return results;
}

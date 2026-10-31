export type ProviderId = 'gemini' | 'openai' | 'grok' | 'claude' | 'deepseek' | 'mistral' | 'openrouter';
export type ProviderStatus = 'connected' | 'not_configured' | 'auth_failed' | 'rate_limited' | 'unavailable' | 'config_required';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  logo: string;
  color: string;
  endpoint: string;
  apiKeyMasked?: string;
  hasKey: boolean;
  models: string[];
  defaultModel: string;
  enabled: boolean;
  status: ProviderStatus;
  lastSuccess?: string;
  lastError?: string;
  timeoutMs: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsTools: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  providerId?: ProviderId;
  model?: string;
  timestamp: string;
  tokensIn?: number;
  tokensOut?: number;
  durationMs?: number;
  attachments?: { name: string; type: string; url: string }[];
}

export interface AIConversation {
  id: string;
  title: string;
  providerId: ProviderId;
  model: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  mode: 'standard' | 'auto' | 'comparison' | 'fallback';
}

export interface AIUsage {
  id: string;
  providerId: ProviderId;
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  latencyMs: number;
  success: boolean;
  timestamp: string;
}

export const PROVIDER_META: Record<ProviderId, { name: string; logo: string; color: string; endpoint: string; models: string[]; defaultModel: string }> = {
  gemini: { name: "Google Gemini", logo: "G", color: "#4285F4", endpoint: "https://generativelanguage.googleapis.com/v1beta", models: ["gemini-2.0-flash","gemini-1.5-pro","gemini-1.5-flash","gemini-1.0-pro"], defaultModel: "gemini-2.0-flash" },
  openai: { name: "OpenAI", logo: "O", color: "#10A37F", endpoint: "https://api.openai.com/v1", models: ["gpt-4o","gpt-4o-mini","gpt-4-turbo","o1-preview","o1-mini"], defaultModel: "gpt-4o" },
  grok: { name: "xAI Grok", logo: "X", color: "#000000", endpoint: "https://api.x.ai/v1", models: ["grok-3","grok-3-mini","grok-2-1212","grok-beta"], defaultModel: "grok-3" },
  claude: { name: "Anthropic Claude", logo: "C", color: "#D97706", endpoint: "https://api.anthropic.com/v1", models: ["claude-3-5-sonnet-latest","claude-3-5-haiku-latest","claude-3-opus-latest","claude-3-haiku-20240307"], defaultModel: "claude-3-5-sonnet-latest" },
  deepseek: { name: "DeepSeek", logo: "D", color: "#4F46E5", endpoint: "https://api.deepseek.com/v1", models: ["deepseek-chat","deepseek-reasoner"], defaultModel: "deepseek-chat" },
  mistral: { name: "Mistral AI", logo: "M", color: "#FF7000", endpoint: "https://api.mistral.ai/v1", models: ["mistral-large-latest","mistral-small-latest","codestral-latest"], defaultModel: "mistral-large-latest" },
  openrouter: { name: "OpenRouter", logo: "R", color: "#7C3AED", endpoint: "https://openrouter.ai/api/v1", models: ["openrouter/auto","anthropic/claude-3.5-sonnet","openai/gpt-4o","google/gemini-2.0-flash"], defaultModel: "openrouter/auto" },
};

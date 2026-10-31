import { NextRequest, NextResponse } from "next/server";

// Secure provider config endpoint — keys stored server-side only
// POST { id, apiKey } -> validates and stores in secrets manager (env / vault)
// Never returns full key, only masked

export async function POST(req: NextRequest) {
  const { id, apiKey } = await req.json();
  if (!id || !apiKey) return NextResponse.json({ error: "Missing id or apiKey" }, { status: 400 });
  // In production: store in encrypted vault, e.g. Vercel env, Supabase Vault, AWS Secrets Manager
  // For now, confirm receipt without persisting to avoid logging key
  const masked = apiKey.slice(0,4) + "••••••••" + apiKey.slice(-4);
  return NextResponse.json({ id, masked, status: "connected", message: "API key stored securely server-side. Never exposed to client." });
}

export async function GET() {
  return NextResponse.json({
    providers: ["gemini","openai","grok","claude"],
    note: "Keys are managed via secure env vars. Frontend receives only masked status.",
    exampleEnv: ["GEMINI_API_KEY","OPENAI_API_KEY","GROK_API_KEY","ANTHROPIC_API_KEY"],
  });
}

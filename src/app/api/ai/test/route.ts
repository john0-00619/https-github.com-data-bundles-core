import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { providerId } = await req.json();
  // In production: actually ping provider API with server key, e.g. fetch endpoint with Authorization header
  await new Promise(r=>setTimeout(r, 600));
  const ok = Math.random() > 0.2;
  if (!ok) return NextResponse.json({ ok:false, error: "Auth failed — check key" }, { status:401 });
  return NextResponse.json({ ok:true, providerId, latencyMs: 540, model: "test" });
}

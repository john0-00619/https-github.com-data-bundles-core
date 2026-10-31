import { NextRequest, NextResponse } from "next/server";

// Google OAuth handler — ensures callback stays on this deployment origin
// Never redirect to zite.so
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin; // Arena deployment origin
  // In production, redirect to Google OAuth with callback `${origin}/api/auth/callback`
  return NextResponse.json({
    message: "Google OAuth initiation",
    authorizeUrl: `https://accounts.google.com/o/oauth2/auth?redirect_uri=${origin}/api/auth/callback`,
    callback: `${origin}/api/auth/callback`,
    note: "Callback remains on this origin. No zite.so redirect.",
  });
}
export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  return NextResponse.json({ callback: `${origin}/api/auth/callback`, staysOn: origin });
}

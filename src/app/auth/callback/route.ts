import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors (e.g., user denied access, invalid config)
  if (error) {
    const url = new URL("/auth/login", origin);
    url.searchParams.set("error", error);
    if (errorDescription) url.searchParams.set("error_description", errorDescription);
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      const url = new URL("/auth/login", origin);
      // Map common errors to user-friendly messages
      if (exchangeError.message.includes("expired") || exchangeError.message.includes("otp_expired")) {
        url.searchParams.set("error", "otp_expired");
      } else {
        url.searchParams.set("error", "auth_callback_failed");
      }
      return NextResponse.redirect(url);
    }

    // Success — redirect to dashboard or the specified next page
    return NextResponse.redirect(`${origin}${next}`);
  }

  // No code and no error — something went wrong
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}

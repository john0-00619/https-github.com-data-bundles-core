"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Church, Loader2, Mail, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError === "auth_callback_failed") {
      setError("Authentication failed. Please try signing in again.");
    } else if (authError === "otp_expired") {
      setError("The sign-in link has expired. Please request a new one.");
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (password) {
        // Password-based login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        // Magic link (email-only) login
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setEmailSent(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="flex items-center gap-2">
          <Church className="h-7 w-7 text-indigo-600" />
          <span className="text-lg font-bold text-gray-900 tracking-tight">KingdomFlow</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Eyebrow */}
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-600 mb-3">
          Made for communities
        </p>

        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Welcome back.
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Your people, gatherings and ministry plans, together in one place.
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            {emailSent ? (
              <div className="text-center py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We sent a sign-in link to <strong>{email}</strong>. Click the link to continue.
                </p>
                <button onClick={() => setEmailSent(false)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon className="h-5 w-5" />
                  )}
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-500 uppercase tracking-wider">or</span>
                  </div>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@church.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    {password && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[34px] text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>

                  {password && (
                    <div className="flex justify-end">
                      <Link href="/auth/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                    ) : password ? (
                      "Sign in securely"
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Email me a secure sign-in link
                      </>
                    )}
                  </Button>
                </form>

                {!password && (
                  <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                    Email links require an authorized sending provider. If your link does not arrive, use a password above.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Footer links */}
          <p className="text-center text-sm text-gray-600 mt-6">
            New to KingdomFlow?{" "}
            <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-700">
              Create account
            </Link>
          </p>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Private, role-based ministry workspaces</span>
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            By continuing you agree to our{" "}
            <a href="#" className="underline hover:text-gray-600">Terms</a> and{" "}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
}

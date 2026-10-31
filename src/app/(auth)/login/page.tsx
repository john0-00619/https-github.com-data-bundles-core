"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { login, googleSignIn, ensureSeedData, getSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kingdomflow.church");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{ ensureSeedData(); if(getSession()) router.replace("/dashboard"); },[router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await new Promise(r=>setTimeout(r, 400));
      login(email, password);
      router.push("/dashboard");
    } catch (err:any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const onGoogle = () => {
    googleSignIn();
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-ink-900 text-white flex items-center justify-center font-display font-bold">K</div>
        <span className="font-display font-semibold">KingdomFlow</span>
        <span className="ml-auto text-xs tracking-widest uppercase bg-stone-100 px-2 py-1 rounded-full">Made for communities</span>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-[32px] font-medium tracking-tight leading-none">Welcome back.</h1>
        <p className="text-sm text-stone-500 mt-2">Your people, gatherings and ministry plans, together in one place.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-[20px] p-6 shadow-soft">
        <div className="text-sm font-semibold">Sign in securely</div>
        <div className="text-xs text-stone-500 mb-4">Secure sign-in for your KingdomFlow workspace.</div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={onGoogle} className="h-10 bg-white border border-stone-200 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-stone-50">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="" /> Continue with Google
          </button>
          <Link href="/forgot" className="h-10 bg-stone-50 border border-stone-200 rounded-full text-sm font-medium flex items-center justify-center hover:bg-stone-100">Use an email link</Link>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Email address</Label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@church.org" type="email" required className="mt-1.5" />
            <div className="text-xs text-stone-500 mt-1">Demo: admin@kingdomflow.church / admin123</div>
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" required className="mt-1.5" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in →"}
          </Button>
          <div className="text-xs text-stone-500 text-center">Email links require an authorized sending provider. If your link does not arrive, use secure sign-in above.</div>
        </form>
      </div>

      <div className="text-center text-sm mt-6">
        <span className="text-stone-500">New to KingdomFlow?</span> <Link href="/signup" className="font-medium underline decoration-stone-300">Create account</Link>
      </div>
      <div className="text-center text-xs text-stone-400 mt-6">
        By continuing you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
      </div>
      <div className="text-center text-xs text-stone-400 mt-2">Private, role-based ministry workspaces</div>
    </div>
  );
}

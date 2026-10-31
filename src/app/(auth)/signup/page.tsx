"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { register, googleSignIn, ensureSeedData } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");

  useEffect(()=>{ ensureSeedData(); },[]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await new Promise(r=>setTimeout(r, 400));
      const { verifyUrl: url } = register({ name, email, password });
      setVerifyUrl(url);
      // Critical: stay on Arena app — redirect to verify page within same origin
      // Simulate email sent — navigate to verify prompt
      setTimeout(()=> router.push(`/verify?email=${encodeURIComponent(email)}&sent=1`), 800);
    } catch (err:any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const onGoogle = () => {
    googleSignIn();
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <h1 className="font-display text-[32px] font-medium tracking-tight leading-none">Start with KingdomFlow.</h1>
        <p className="text-sm text-stone-500 mt-2">Bring your church, ministry or campus fellowship together in one organized workspace.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-[20px] p-6 shadow-soft">
        <div className="text-sm font-semibold">Create your account</div>
        <div className="text-xs text-stone-500 mb-4">Secure sign-in for your KingdomFlow workspace.</div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={onGoogle} className="h-10 bg-white border border-stone-200 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-stone-50">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="" /> Create with Google
          </button>
          <div className="h-10 bg-stone-50 border border-stone-200 rounded-full text-sm font-medium flex items-center justify-center text-stone-600">Use an email link</div>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Pastor John Doe" required className="mt-1.5" />
          </div>
          <div>
            <Label>Email address</Label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@church.org" type="email" required className="mt-1.5" />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" type="password" required className="mt-1.5" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">{error}</div>}
          {verifyUrl && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl px-3 py-2 break-all">Verification link (demo): {verifyUrl}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create account →"}
          </Button>
          <div className="text-xs text-stone-500 text-center">Email links require an authorized sending provider. If your link does not arrive, use secure sign-in above.</div>
        </form>
      </div>

      <div className="text-center text-sm mt-6">
        <span className="text-stone-500">Already registered?</span> <Link href="/login" className="font-medium underline decoration-stone-300">Sign in</Link>
      </div>
    </div>
  );
}

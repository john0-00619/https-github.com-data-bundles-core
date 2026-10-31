"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
export default function ForgotPage() {
  const [email,setEmail]=useState(""); const [sent,setSent]=useState(false);
  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white border border-stone-200 rounded-[20px] p-6 shadow-soft">
        <h1 className="font-display text-xl font-medium">Reset your password</h1>
        <p className="text-sm text-stone-500 mt-1">We’ll send a password reset link to your email. You’ll stay inside KingdomFlow.</p>
        {!sent ? (
          <form onSubmit={e=>{e.preventDefault(); setSent(true);}} className="mt-6 space-y-4">
            <div><Label>Email address</Label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@church.org" type="email" required className="mt-1.5" /></div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        ) : (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
            If an account exists for {email}, we’ve sent a reset link. Check your inbox and return to <Link href="/login" className="underline font-medium">Sign in</Link>.
          </div>
        )}
      </div>
      <div className="text-center text-sm mt-6"><Link href="/login" className="underline">Back to sign in</Link></div>
    </div>
  );
}

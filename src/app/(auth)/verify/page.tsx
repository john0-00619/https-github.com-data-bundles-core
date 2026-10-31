"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { verifyEmail, resendVerification } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const sent = params.get("sent");
  const [status, setStatus] = useState<"idle"|"verifying"|"success"|"expired"|"error">("idle");
  const [msg, setMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [newLink, setNewLink] = useState("");

  useEffect(()=>{
    if (token && email) {
      setStatus("verifying");
      try {
        const user = verifyEmail(token, email);
        setStatus("success");
        setMsg(`Welcome, ${user.name}! Your email is verified.`);
        setTimeout(()=> router.push("/dashboard"), 1500);
      } catch (e:any) {
        if (e.message === "EXPIRED") setStatus("expired");
        else { setStatus("error"); setMsg(e.message); }
      }
    } else if (sent) {
      setStatus("idle");
    }
  },[token, email, router, sent]);

  const onResend = () => {
    if (!email) return;
    setResending(true);
    try {
      const { verifyUrl } = resendVerification(email);
      setNewLink(verifyUrl);
      setMsg("A new verification link has been generated.");
    } catch (e:any) { setMsg(e.message); }
    setResending(false);
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white border border-stone-200 rounded-[20px] p-8 shadow-soft text-center">
        {sent && status==="idle" && (
          <>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">✉️</div>
            <h1 className="font-display text-xl font-medium">Check your email</h1>
            <p className="text-sm text-stone-500 mt-2">We’ve sent a verification link to <span className="font-medium text-ink-900">{email}</span>. Click the link to verify your account. You’ll stay in KingdomFlow — no external redirect.</p>
            <div className="mt-6 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600">
              Demo: Open{" "}
              <Link href={`/verify?token=${newLink.split('token=')[1]?.split('&')[0] || ''}&email=${encodeURIComponent(email)}`} className="underline font-medium">
                verify manually
              </Link>{" "}
              or check your verification URL above.
            </div>
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="secondary" onClick={onResend} disabled={resending}>{resending?"Resending...":"Resend link"}</Button>
              <Link href="/login"><Button>Back to sign in</Button></Link>
            </div>
            {newLink && <div className="mt-4 text-xs break-all bg-emerald-50 border border-emerald-200 rounded-xl p-2">{newLink}</div>}
          </>
        )}
        {status==="verifying" && <>
          <div className="h-12 w-12 border-4 border-stone-200 border-t-ink-900 rounded-full animate-spin mx-auto mb-4" />
          <h1 className="font-display text-xl font-medium">Verifying...</h1>
          <p className="text-sm text-stone-500 mt-2">Please wait while we validate your token.</p>
        </>}
        {status==="success" && <>
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
          <h1 className="font-display text-xl font-medium">Verified!</h1>
          <p className="text-sm text-stone-500 mt-2">{msg} Redirecting to dashboard...</p>
        </>}
        {status==="expired" && <>
          <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">⏰</div>
          <h1 className="font-display text-xl font-medium">Link expired</h1>
          <p className="text-sm text-stone-500 mt-2">This verification link has expired. Request a new one to continue.</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={onResend} disabled={resending || !email}>{resending?"Sending...":"Resend verification"}</Button>
            <Link href="/login"><Button variant="secondary">Back to login</Button></Link>
          </div>
          {newLink && <div className="mt-4 text-xs break-all bg-white border border-stone-200 rounded-xl p-3">{newLink}<div className="mt-2"><Link href={newLink} className="text-kingdom-600 underline">Open verification link</Link></div></div>}
          {msg && <div className="mt-3 text-xs text-stone-500">{msg}</div>}
        </>}
        {status==="error" && <>
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">!</div>
          <h1 className="font-display text-xl font-medium">Verification failed</h1>
          <p className="text-sm text-red-600 mt-2">{msg}</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={onResend}>Resend link</Button>
            <Link href="/login"><Button variant="secondary">Sign in</Button></Link>
          </div>
        </>}
      </div>
      <div className="text-center text-xs text-stone-400 mt-4">You remain in KingdomFlow. No redirect to Zite.</div>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense fallback={<div>Loading...</div>}><VerifyInner /></Suspense>;
}

"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar, Topbar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(()=>{
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    // Refresh persistence check — session remains after reload
    setReady(true);
  },[router, pathname]);

  if (!ready) return <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center"><div className="h-8 w-8 border-4 border-stone-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#fdfcf8]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="lg:pl-[280px]">
        <Topbar onMenu={()=>setMobileOpen(true)} />
        <main className="p-4 lg:p-6 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}

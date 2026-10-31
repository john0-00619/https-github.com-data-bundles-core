export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fdfcf8] flex">
      {/* Left - brand panel */}
      <div className="hidden lg:flex w-[46%] bg-[#1a1816] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 20% 30%, #d9831e 0%, transparent 50%), radial-gradient(circle at 80% 70%, #925213 0%, transparent 50%)"}} />
        </div>
        <div className="relative z-10 flex flex-col p-10 w-full max-w-[560px] mx-auto">
          <div className="flex items-center gap-3 text-white/90">
            <div className="h-9 w-9 rounded-xl bg-white text-ink-900 flex items-center justify-center font-display font-bold">K</div>
            <span className="font-display font-semibold">KingdomFlow</span>
            <span className="ml-auto text-xs tracking-widest uppercase bg-white/10 px-2.5 py-1 rounded-full">Made for communities</span>
          </div>
          <div className="flex-1 flex flex-col justify-center py-16">
            <h1 className="font-display text-[44px] leading-[0.95] font-medium tracking-tight">
              Your people,<br />gatherings and<br /><span className="text-kingdom-300">ministry plans,</span><br />together in one place.
            </h1>
            <p className="mt-6 text-white/70 leading-relaxed max-w-[420px]">
              Private, role-based ministry workspaces for churches, campus fellowships and ministry teams.
              Secure sign-in, member care, attendance and communication — beautifully organized.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                {k:"2,480", l:"Active members"},
                {k:"12", l:"Branches"},
                {k:"99.8%", l:"Uptime"},
              ].map(s=>(
                <div key={s.k} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <div className="text-xl font-semibold">{s.k}</div>
                  <div className="text-xs text-white/60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/50 flex items-center gap-2">
            <span>© 2025 KingdomFlow</span>
            <span className="h-1 w-1 bg-white/30 rounded-full" />
            <a href="#" className="underline decoration-white/20">Terms</a>
            <a href="#" className="underline decoration-white/20">Privacy</a>
          </div>
        </div>
      </div>
      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[#fdfcf8]">
        {children}
      </div>
    </div>
  );
}

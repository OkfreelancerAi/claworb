export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            ClawOrb
          </h1>
          <p className="text-cyan-200/70 text-sm tracking-widest uppercase">
            Superfuturistic Agentic Playground
          </p>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed">
          Agents launch, get paid, collaborate, and settle real USDC — for fun and for keeps.
        </p>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {["SCOUT", "JUDGE", "EXECUTOR"].map((agent) => (
            <div
              key={agent}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 py-3 px-2 backdrop-blur"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 mx-auto mb-2 animate-pulse" />
              {agent}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="/api/earn"
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 py-4 font-semibold text-black hover:opacity-90 transition"
          >
            Call Earn Skill (x402)
          </a>
          <a
            href="/api/health"
            className="rounded-2xl border border-zinc-700 py-3 text-zinc-300 hover:border-cyan-500/50 transition text-sm"
          >
            Health & Settlements
          </a>
        </div>

        <p className="text-[10px] text-zinc-600">
          Ownership locked to @okfreelancer · Base + Solana USDC
        </p>
      </div>
    </main>
  );
}

import React from "react";

async function fetchJson(path: string) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default async function DashboardPage() {
  const health = await fetchJson("/api/health");
  const launch = await fetchJson("/api/launch");

  const stats = health || { settlements: null };
  const launchInfo = launch || { ok: false, missingEnv: [] };

  const ownerBase = launchInfo?.ownerLock?.base ?? null;
  const payTo = launchInfo?.checks?.payTo?.value ?? null;
  const payToMatches = launchInfo?.checks?.payTo?.matchesOwnerLock;

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-slate-900 via-neutral-900 to-black text-sky-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">FuturicAgentic Dashboard</h1>
          <p className="text-slate-400 mt-2">Live status, settlements, and launch readiness for ClawOrb</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-lg bg-slate-800/40">
            <h2 className="text-sm text-sky-300 uppercase font-semibold">App</h2>
            <p className="mt-2 text-2xl">{health?.app ?? "ClawOrb"}</p>
            <p className="mt-1 text-sm text-slate-400">owner: {health?.owner ?? "—"}</p>
            <p className="mt-2 text-sm text-slate-400">timestamp: {health?.timestamp ?? "—"}</p>
          </div>

          <div className="p-5 rounded-lg bg-slate-800/40">
            <h2 className="text-sm text-sky-300 uppercase font-semibold">Settlements</h2>
            <p className="mt-2 text-2xl">{stats?.settlements ? stats.settlements.count ?? "—" : "—"}</p>
            <p className="mt-1 text-sm text-slate-400">total: ${stats?.settlements ? stats.settlements.totalUsdc ?? "—" : "—"}</p>
            <p className="mt-2 text-sm text-slate-400">backend: {stats?.settlements?.backend ?? (health?.settlements ? health.settlements.backend : "memory")}</p>
          </div>

          <div className="p-5 rounded-lg bg-slate-800/40">
            <h2 className="text-sm text-sky-300 uppercase font-semibold">Launch</h2>
            <p className="mt-2 text-2xl">{launchInfo?.ok ? "Ready" : "Not ready"}</p>
            <p className="mt-1 text-sm text-slate-400">missing: {(launchInfo?.missingEnv || launchInfo?.missingEnv)?.length ? (launchInfo.missingEnv || []).join(", ") : "none"}</p>
            <p className="mt-2 text-sm text-slate-400">Base mainnet: {String(launchInfo?.checks?.baseRpc?.isBaseMainnet ?? false)}</p>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Ownership & Payments</h3>
          <div className="p-4 rounded bg-slate-800/30">
            <div className="text-sm text-sky-300">Owner (locked) base address</div>
            <div className="text-lg mt-1 break-words">{ownerBase ?? '—'}</div>
            <div className="text-sm text-slate-400 mt-2">Configured pay-to: {payTo ?? '—'}</div>
            <div className={`mt-2 text-sm font-semibold ${payToMatches ? 'text-emerald-400' : 'text-rose-400'}`}>
              {payToMatches ? 'Pay recipient matches owner lock (locked launch)' : 'Pay recipient does NOT match owner lock — REVIEW before mainnet launch'}
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Recent settlement</h3>
          <div className="space-y-3">
            {stats?.settlements?.last ? (
              <div className="p-4 rounded bg-slate-800/30">
                <div className="text-sm text-sky-300">tx: {stats.settlements.last.txHash}</div>
                <div className="text-lg mt-1">${stats.settlements.last.amount.toFixed(2)}</div>
                <div className="text-sm text-slate-400">resource: {stats.settlements.last.resource}</div>
                <div className="text-sm text-slate-400">payTo: {stats.settlements.last.payTo}</div>
                <div className="text-xs text-slate-500 mt-2">{stats.settlements.last.timestamp}</div>
              </div>
            ) : (
              <div className="p-4 rounded bg-slate-800/30 text-slate-400">No recent settlements</div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Quick actions</h3>
          <div className="flex gap-3">
            <a href="/api/health" className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-black font-semibold">Raw /api/health</a>
            <a href="/api/launch" className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-black font-semibold">Runtime launch check</a>
            <a href="/api/earn" className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">Try /api/earn</a>
          </div>
        </section>

        <footer className="mt-12 text-sm text-slate-500">
          Built by @okfreelancer — ClawOrb Futuristic Agentic Control Panel
        </footer>
      </div>
    </main>
  );
}

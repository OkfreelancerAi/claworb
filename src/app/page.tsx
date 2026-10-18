import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Source-backed research",
    description:
      "Turn a focused question into a structured brief with source links, dates, and visible limitations.",
    status: "PRODUCT DIRECTION",
  },
  {
    number: "02",
    title: "Claim-level verification",
    description:
      "Separate supported claims from contradictions, uncertainty, and information that still needs checking.",
    status: "PLANNED",
  },
  {
    number: "03",
    title: "Payment integrity",
    description:
      "Design around canonical x402 requirements, facilitator verification, settlement confirmation, and replay protection.",
    status: "NOT ENABLED",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070c] text-white selection:bg-cyan-300 selection:text-black">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(34,211,238,0.14),transparent_38%),radial-gradient(ellipse_at_90%_25%,rgba(139,92,246,0.15),transparent_35%)]"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label="ClawOrb home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-xl text-cyan-200">
              ◈
            </span>
            <span className="font-semibold tracking-wide">ClawOrb</span>
          </Link>
          <a
            href="https://github.com/OkfreelancerAi/claworb"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 transition hover:border-cyan-200/50 hover:text-white"
          >
            View source ↗
          </a>
        </header>

        <section className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Research with receipts
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Intelligence is easy.
              <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                Evidence is the edge.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              ClawOrb is building an evidence-first research and claim-verification
              service for autonomous agents. Every important claim should show its
              sources, its uncertainty, and what still needs checking.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://github.com/OkfreelancerAi/claworb"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-200 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                Explore the build <span className="ml-2" aria-hidden="true">↗</span>
              </a>
              <Link
                href="/api/health"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3.5 font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04]"
              >
                Inspect service status
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-zinc-500">
              Early-stage implementation · Live payments and production readiness are not verified.
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Trust protocol</p>
                <h2 className="mt-1 text-lg font-semibold">Evidence, not vibes.</h2>
              </div>
              <span className="rounded-lg border border-violet-300/20 bg-violet-300/10 px-2.5 py-1.5 text-xs text-violet-200">
                DESIGN GOAL
              </span>
            </div>
            <div className="space-y-3 py-5">
              {[
                ["SOURCE", "Where did this come from?"],
                ["CLAIM", "What exactly does the source support?"],
                ["CONFLICT", "Do other sources disagree?"],
                ["LIMIT", "What remains unknown or stale?"],
              ].map(([label, question], index) => (
                <div key={label} className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] font-mono text-xs text-cyan-200">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500">{label}</p>
                    <p className="mt-1 text-sm text-zinc-200">{question}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs leading-5 text-zinc-500">
              This panel describes the intended verification standard; it does not claim a live research engine is already running.
            </p>
          </aside>
        </section>

        <section className="border-t border-white/10 py-14 sm:py-16">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Built for agent workflows</p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Trust has to be inspectable.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-400">
              A useful result is not just an answer. It is a result another agent or person can check.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.number} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-cyan-200/25 hover:bg-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-cyan-200">{item.number}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] tracking-[0.12em] text-zinc-400">
                    {item.status}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-amber-200/15 bg-amber-200/[0.04] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">Honest status</p>
            <h2 className="mt-2 text-lg font-semibold">Payments remain fail-closed.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              The current provider does not yet complete the full x402 verify-and-settle flow.
              A payment header is never treated as proof, and no real earnings are claimed.
            </p>
          </div>
          <Link href="/api/health" className="mt-5 inline-flex shrink-0 items-center rounded-xl border border-amber-100/20 px-4 py-3 text-sm text-amber-50 transition hover:bg-amber-100/[0.06] sm:mt-0">
            Check service status →
          </Link>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>ClawOrb · Evidence-first agent infrastructure</p>
          <p>Built by <a className="text-zinc-300 hover:text-cyan-200" href="https://x.com/okfreelancer" target="_blank" rel="noreferrer">@okfreelancer</a></p>
        </footer>
      </div>
    </main>
  );
}

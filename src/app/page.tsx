export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex max-w-md flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Mini Trading Journal
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            Track your trades, analyze performance, and refine your strategy.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-500"
            >
              Get Started
            </a>
            <a
              href="#"
              className="rounded-lg border border-slate-600 px-6 py-3 font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/50"
            >
              View Trades
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

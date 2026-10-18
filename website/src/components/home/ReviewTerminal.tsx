import { CheckCircle } from 'lucide-react';

const HIGHLIGHTS = [
  'Findings on the exact diff lines',
  'Per-repository custom instructions',
  'Your keys, your infrastructure',
] as const;

export function ReviewTerminal() {
  return (
    <section className="border-ink bg-ink border-b-4 py-24 text-white">
      <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="font-display mb-6 text-4xl font-black md:text-5xl lg:text-6xl">
            IT WORKS WHERE YOU WORK
          </h2>
          <p className="border-accent mb-8 border-l-8 pl-6 text-xl font-semibold text-white/85">
            No new tool to adopt. Metis lives in your pull requests and talks to you through review
            comments, just like a teammate would.
          </p>
          <ul className="space-y-4 text-lg font-semibold">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <CheckCircle className="text-accent h-6 w-6 shrink-0" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true">
          <div className="overflow-hidden border-4 border-white bg-[#0b0b0b] font-mono shadow-[12px_12px_0px_0px_var(--color-accent)]">
            <div className="flex items-center gap-2 border-b-4 border-white/20 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-white/25" />
              <span className="h-3 w-3 rounded-full bg-white/25" />
              <span className="h-3 w-3 rounded-full bg-white/25" />
              <span className="ml-4 text-xs font-semibold text-white/60">metis-bot — bash</span>
            </div>

            <div className="p-6 text-sm leading-relaxed md:text-base">
              <p className="mb-2">
                <span className="text-accent font-bold">➜</span>{' '}
                <span className="font-bold">~/project</span> git push origin feature/new-api
              </p>
              <div className="mb-4 ml-1 border-l-2 border-white/20 pl-4 text-white/60">
                <p>Enumerating objects: 5, done.</p>
                <p>Writing objects: 100% (3/3), 320 bytes, done.</p>
                <p>To github.com:acme/api.git</p>
              </div>

              <p className="mb-2 animate-pulse font-bold">
                <span className="text-accent">@metis-bot</span> is analyzing changes...
              </p>

              <div className="text-accent mt-4 space-y-2">
                <p>✔ Posted 2 inline findings (1 CRITICAL · SECURITY)</p>
                <p>✔ Rewrote PR title and appended a summary</p>
                <div className="mt-4 border border-white/20 bg-white/5 p-2 font-bold text-white">
                  Review submitted: REQUEST_CHANGES
                </div>
              </div>

              <p className="mt-4">
                <span className="text-accent font-bold">➜</span>{' '}
                <span className="font-bold">~/project</span>{' '}
                <span className="inline-block h-4 w-2 animate-pulse bg-white align-middle" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { CheckCircle } from 'lucide-react';

const HIGHLIGHTS = [
  'Findings on the exact diff lines',
  'Per-repository custom instructions',
  'Your keys, your infrastructure',
] as const;

export function ReviewTerminal() {
  return (
    <section className="border-b-4 border-black bg-black px-4 py-20 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row">
        <div className="md:w-1/2">
          <h2 className="font-display mb-6 text-4xl font-black text-white md:text-5xl">
            IT WORKS WHERE YOU WORK
          </h2>
          <p className="mb-8 border-l-8 border-[var(--metis-orange-dark)] pl-6 text-xl font-semibold text-white/90">
            No new tool to adopt. Metis lives in your pull requests and talks to you through review
            comments, just like a teammate would.
          </p>
          <ul className="space-y-4 text-lg font-semibold">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <CheckCircle
                  className="h-6 w-6 shrink-0 fill-[var(--metis-orange-dark)]"
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-1/2" aria-hidden="true">
          <div className="overflow-hidden rounded-xl border-4 border-white bg-[#0b0b0b] font-mono shadow-[12px_12px_0px_0px_var(--metis-orange-dark)]">
            <div className="flex items-center gap-2 border-b-4 border-white/20 bg-black px-4 py-3">
              <div className="h-3 w-3 rounded-full border border-white/20 bg-[var(--metis-red)]" />
              <div className="h-3 w-3 rounded-full border border-white/20 bg-[var(--metis-orange-dark)]" />
              <div className="h-3 w-3 rounded-full border border-white/20 bg-white" />
              <div className="ml-4 text-xs font-semibold text-white/70">metis-bot — bash</div>
            </div>

            <div className="p-6 text-sm leading-relaxed md:text-base">
              <p className="mb-2">
                <span className="font-bold text-[var(--metis-orange-dark)]">➜</span>{' '}
                <span className="font-bold">~/project</span> git push origin feature/new-api
              </p>
              <div className="mb-4 ml-1 border-l-2 border-white/20 pl-4 text-white/70">
                <p>Enumerating objects: 5, done.</p>
                <p>Writing objects: 100% (3/3), 320 bytes, done.</p>
                <p>To github.com:acme/api.git</p>
              </div>

              <p className="mb-2 animate-pulse font-bold">
                <span className="text-[var(--metis-red)]">@metis-bot</span> is analyzing changes...
              </p>

              <div className="mt-4 space-y-2 text-[var(--metis-orange-dark)]">
                <p>✔ Posted 2 inline findings (1 CRITICAL · SECURITY)</p>
                <p>✔ Rewrote PR title and appended a summary</p>
                <div className="mt-4 rounded border border-white/20 bg-white/5 p-2 font-bold text-white">
                  Review submitted: REQUEST_CHANGES
                </div>
              </div>

              <p className="mt-4">
                <span className="font-bold text-[var(--metis-orange-dark)]">➜</span>{' '}
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

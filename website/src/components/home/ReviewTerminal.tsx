import type React from 'react';
import { CheckCircle } from 'lucide-react';

const HIGHLIGHTS = [
  'Reviews arrive as inline PR comments',
  'Issues come back as ready-to-review PRs',
  'Your keys, your infrastructure',
] as const;

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2">
      <span className="text-accent font-bold">➜</span> <span className="font-bold">~/project</span>{' '}
      {children}
    </p>
  );
}

function BotLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-bold">
      <span className="text-accent">@metis-bot</span> {children}
    </p>
  );
}

export function ReviewTerminal() {
  return (
    <section className="border-ink bg-ink border-b-4 py-24 text-white">
      <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="font-display mb-6 text-4xl font-black md:text-5xl lg:text-6xl">
            IT WORKS WHERE YOU WORK
          </h2>
          <p className="border-accent mb-8 border-l-8 pl-6 text-xl font-semibold text-white/85">
            No new tool to adopt. Metis lives in your repository: it reviews the pull requests you
            open and answers issues with pull requests of its own, just like a teammate would.
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
              <span className="ml-4 text-xs font-semibold text-white/60">metis-bot — activity</span>
            </div>

            <div className="space-y-5 p-6 text-sm leading-relaxed md:text-base">
              <div>
                <Prompt>git push origin feature/new-api</Prompt>
                <BotLine>is reviewing PR #214…</BotLine>
                <div className="text-accent ml-1 border-l-2 border-white/20 pl-4">
                  <p>✔ 2 inline findings (1 CRITICAL · SECURITY)</p>
                  <p>✔ Title rewritten, summary added</p>
                  <p className="font-bold text-white">Review submitted: REQUEST_CHANGES</p>
                </div>
              </div>

              <div>
                <BotLine>picked up issue #128 · Export reviews as CSV</BotLine>
                <div className="text-accent ml-1 border-l-2 border-white/20 pl-4">
                  <p>✔ Branch metis/issue-128 · 3 files changed</p>
                  <p>✔ run_tests · 42 passed</p>
                  <p className="font-bold text-white">Pull request #129 opened</p>
                </div>
              </div>

              <p>
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

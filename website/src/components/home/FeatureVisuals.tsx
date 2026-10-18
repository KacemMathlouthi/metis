/**
 * Illustrative mock-ups of Metis features for the feature deck.
 * They are decorative (the deck marks them aria-hidden); the card text carries the meaning.
 */
import type React from 'react';
import { Check, CircleDot, GitBranch, GitPullRequest, Play, Upload, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const FRAME = 'border-4 border-black bg-white shadow-[5px_5px_0px_0px_#000]';

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border-2 border-black px-1.5 py-0.5 font-mono text-[0.65rem] font-black tracking-wide uppercase',
        className
      )}
    >
      {children}
    </span>
  );
}

export function ReviewVisual() {
  return (
    <div className={cn(FRAME, 'overflow-hidden font-mono text-xs')}>
      <div className="flex items-center justify-between border-b-4 border-black bg-black px-3 py-2 text-white">
        <span className="truncate">src/api/users.ts</span>
        <span className="text-white/60">+12 −3</span>
      </div>
      <div className="divide-y divide-black/10">
        <p className="truncate px-3 py-1.5 text-black/60">
          <span className="mr-3 text-black/40">41</span>const id = req.params.id;
        </p>
        <p className="truncate bg-[var(--metis-pastel-red)] px-3 py-1.5">
          <span className="mr-3 text-black/40">42</span>
          {'db.query(`SELECT * FROM users WHERE id = ${id}`)'}
        </p>
      </div>
      <div className="m-3 border-2 border-black bg-[var(--metis-cream)] p-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center border-2 border-black bg-[var(--metis-orange)] font-sans font-black text-white">
            M
          </span>
          <span className="font-bold">metis-bot</span>
          <Tag className="bg-[var(--metis-red)] text-white">Critical</Tag>
          <Tag className="bg-[var(--metis-yellow)]">Security</Tag>
        </div>
        <p className="mb-1 font-sans text-sm font-black">SQL injection in user lookup</p>
        <p className="font-sans leading-snug text-black/70">
          <code>id</code> comes straight from the URL. Use a parameterized query instead.
        </p>
      </div>
    </div>
  );
}

export function SummaryVisual() {
  return (
    <div className={cn(FRAME, 'p-4 text-sm')}>
      <p className="mb-1 flex items-center gap-2 font-mono text-xs font-bold text-black/50">
        <GitPullRequest className="h-4 w-4" /> #214 · feature/session-refresh
      </p>
      <p className="font-mono text-sm text-black/40 line-through">fix stuff</p>
      <p className="font-display mb-4 text-lg leading-tight font-black">
        Fix token refresh race in session middleware
      </p>
      <div className="border-t-2 border-dashed border-black/30 pt-3">
        <p className="mb-2 font-mono text-xs font-black tracking-widest text-[var(--metis-orange-dark)] uppercase">
          Summary by Metis
        </p>
        <ul className="space-y-1.5 font-semibold text-black/75">
          {[
            'Serializes concurrent refresh calls behind one lock',
            'Retries the original request with the new token',
            'Adds tests for parallel 401 responses',
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 bg-[var(--metis-orange)]" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const AGENT_STEPS = [
  { icon: CircleDot, label: 'Issue #128 · Export reviews as CSV', tone: 'bg-white' },
  { icon: GitBranch, label: 'git_create_branch metis/issue-128', tone: 'bg-white' },
  { icon: Wrench, label: 'replace_in_files · 3 files', tone: 'bg-white' },
  { icon: Play, label: 'run_tests · 42 passed', tone: 'bg-white' },
  { icon: Upload, label: 'git_push origin metis/issue-128', tone: 'bg-white' },
  { icon: Check, label: 'Pull request #129 opened', tone: 'bg-[var(--metis-yellow)]' },
] as const;

export function IssueToPrVisual() {
  return (
    <ol className={cn(FRAME, 'relative space-y-2.5 p-4')}>
      <span className="absolute top-6 bottom-6 left-[1.85rem] w-1 bg-black" />
      {AGENT_STEPS.map(({ icon: Icon, label, tone }) => (
        <li key={label} className="relative flex items-center gap-3">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black',
              tone
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate font-mono text-xs font-semibold sm:text-sm">{label}</span>
        </li>
      ))}
    </ol>
  );
}

const PROVIDERS = ['Gemini', 'GPT', 'Claude', 'Mistral', 'Azure', 'Self-hosted'] as const;

export function LlmVisual() {
  return (
    <div className={cn(FRAME, 'p-4')}>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {PROVIDERS.map((provider) => (
          <span
            key={provider}
            className={cn(
              'border-2 border-black px-2 py-2 text-center text-xs font-black uppercase sm:text-sm',
              provider === 'Claude'
                ? 'bg-[var(--metis-orange)] text-white shadow-[3px_3px_0px_0px_#000]'
                : 'bg-white'
            )}
          >
            {provider}
          </span>
        ))}
      </div>
      <pre className="overflow-hidden border-2 border-black bg-[#0b0b0b] p-3 font-mono text-xs leading-relaxed text-white">
        <span className="text-white/50"># backend/.env</span>
        {'\n'}
        <span className="text-[var(--metis-orange-light)]">MODEL_NAME</span>
        =anthropic/claude-sonnet-5-5
        {'\n'}
        <span className="text-[var(--metis-orange-light)]">ANTHROPIC_API_KEY</span>=sk-ant-…
      </pre>
    </div>
  );
}

const FINDING_BARS = [
  { label: 'Bug', width: '82%' },
  { label: 'Security', width: '58%' },
  { label: 'Performance', width: '41%' },
  { label: 'Testing', width: '27%' },
] as const;

export function DashboardVisual() {
  return (
    <div className={cn(FRAME, 'p-4')}>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Reviews', value: '128' },
          { label: 'Findings', value: '342' },
          { label: 'Critical', value: '12' },
        ].map((stat) => (
          <div key={stat.label} className="border-2 border-black bg-[var(--metis-cream)] p-2">
            <p className="font-display text-xl font-black sm:text-2xl">{stat.value}</p>
            <p className="font-mono text-[0.65rem] font-bold text-black/60 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mb-2 font-mono text-xs font-black text-black/60 uppercase">
        Findings by category
      </p>
      <div className="space-y-2">
        {FINDING_BARS.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-xs font-semibold">{bar.label}</span>
            <span className="h-4 flex-1 border-2 border-black bg-white">
              <span
                className="block h-full bg-[var(--metis-orange)]"
                style={{ width: bar.width }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

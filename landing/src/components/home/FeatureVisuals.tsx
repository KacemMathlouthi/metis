/**
 * Illustrative mock-ups of Metis features for the feature deck.
 * They are decorative (the deck marks them aria-hidden); the card text carries the meaning.
 */
import type React from 'react';
import { Check, CircleDot, GitBranch, GitPullRequest, Play, Upload, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const FRAME = 'border-ink bg-surface border-4 shadow-[5px_5px_0px_0px_#000]';

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border-2 border-black px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wide uppercase',
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
        <p className="bg-danger/15 truncate px-3 py-1.5">
          <span className="mr-3 text-black/40">42</span>
          {'db.query(`SELECT * FROM users WHERE id = ${id}`)'}
        </p>
      </div>
      <div className="border-ink bg-surface-alt m-3 border-2 p-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="bg-accent text-ink font-display flex h-6 w-6 items-center justify-center border-2 border-black">
            M
          </span>
          <span className="font-bold">metis-bot</span>
          <Tag className="bg-danger text-white">Critical</Tag>
          <Tag className="bg-highlight">Security</Tag>
        </div>
        <p className="mb-1 font-sans text-sm font-semibold">SQL injection in user lookup</p>
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
      <p className="mb-4 text-lg leading-tight font-semibold">
        Fix token refresh race in session middleware
      </p>
      <div className="border-t-2 border-dashed border-black/30 pt-3">
        <p className="text-ink/60 mb-2 font-mono text-xs font-medium">Summary by Metis</p>
        <ul className="space-y-1.5 font-semibold text-black/75">
          {[
            'Serializes concurrent refresh calls behind one lock',
            'Retries the original request with the new token',
            'Adds tests for parallel 401 responses',
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="bg-accent mt-1.5 h-2 w-2 shrink-0" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const AGENT_STEPS = [
  { icon: CircleDot, label: 'Issue #128 · Export reviews as CSV', tone: 'bg-surface' },
  { icon: GitBranch, label: 'git_create_branch metis/issue-128', tone: 'bg-surface' },
  { icon: Wrench, label: 'replace_in_files · 3 files', tone: 'bg-surface' },
  { icon: Play, label: 'run_tests · 42 passed', tone: 'bg-surface' },
  { icon: Upload, label: 'git_push origin metis/issue-128', tone: 'bg-surface' },
  { icon: Check, label: 'Pull request #129 opened', tone: 'bg-highlight' },
] as const;

export function IssueToPrVisual() {
  return (
    <ol className={cn(FRAME, 'relative space-y-2.5 p-4')}>
      <span className="bg-ink absolute top-6 bottom-6 left-[30px] w-1" />
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
              'border-2 border-black px-2 py-2 text-center text-xs font-medium sm:text-sm',
              provider === 'Claude' ? 'bg-accent shadow-[3px_3px_0px_0px_#000]' : 'bg-transparent'
            )}
          >
            {provider}
          </span>
        ))}
      </div>
      <pre className="overflow-hidden border-2 border-black bg-[#0b0b0b] p-3 font-mono text-xs leading-relaxed text-white">
        <span className="text-white/50"># backend/.env</span>
        {'\n'}
        <span className="text-accent">MODEL_NAME</span>
        =anthropic/claude-sonnet-5-5
        {'\n'}
        <span className="text-accent">ANTHROPIC_API_KEY</span>=sk-ant-…
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
          <div key={stat.label} className="border-ink bg-surface-alt border-2 p-2">
            <p className="font-display text-xl sm:text-2xl">{stat.value}</p>
            <p className="font-mono text-[0.65rem] font-bold text-black/60 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mb-2 font-mono text-xs font-medium text-black/60">Findings by category</p>
      <div className="space-y-2">
        {FINDING_BARS.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-xs font-semibold">{bar.label}</span>
            <span className="h-4 flex-1 border-2 border-black bg-transparent">
              <span className="bg-accent block h-full" style={{ width: bar.width }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

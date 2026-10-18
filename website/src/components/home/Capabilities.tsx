import type React from 'react';
import {
  Bug,
  CheckCheck,
  Database,
  Droplets,
  FileText,
  FlaskConical,
  Gauge,
  Info,
  KeyRound,
  MessageSquare,
  OctagonX,
  Paintbrush,
  Repeat,
  ShieldAlert,
  Siren,
  TestTube,
  Timer,
  TriangleAlert,
  Wrench,
  XCircle,
} from 'lucide-react';
import { SectionHeading } from '@/components/home/SectionHeading';
import { MagnifiedBento, type BentoTag } from '@/components/magnified-bento';
import { cn } from '@/lib/utils';

const FINDING_ROWS: readonly (readonly BentoTag[])[] = [
  [
    { id: 'bug', label: 'Bug', icon: Bug },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'maintainability', label: 'Maintainability', icon: Wrench },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'testing', label: 'Testing', icon: FlaskConical },
    { id: 'style', label: 'Style', icon: Paintbrush },
  ],
  [
    { id: 'critical', label: 'Critical', icon: Siren },
    { id: 'error', label: 'Error', icon: OctagonX },
    { id: 'warning', label: 'Warning', icon: TriangleAlert },
    { id: 'info', label: 'Info', icon: Info },
    { id: 'approve', label: 'Approve', icon: CheckCheck },
    { id: 'request-changes', label: 'Request changes', icon: XCircle },
    { id: 'comment', label: 'Comment', icon: MessageSquare },
  ],
  [
    { id: 'sql-injection', label: 'SQL injection', icon: Database },
    { id: 'race-conditions', label: 'Race conditions', icon: Timer },
    { id: 'resource-leaks', label: 'Resource leaks', icon: Droplets },
    { id: 'leaked-secrets', label: 'Leaked secrets', icon: KeyRound },
    { id: 'n-plus-one', label: 'N+1 queries', icon: Repeat },
    { id: 'missing-tests', label: 'Missing tests', icon: TestTube },
    { id: 'error-handling', label: 'Swallowed errors', icon: Bug },
  ],
];

function Cell({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'border-ink bg-surface flex flex-col border-4 shadow-[6px_6px_0px_0px_#000]',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="border-ink flex min-h-36 flex-1 items-center justify-center border-b-4 p-5"
      >
        {children}
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-xl font-black uppercase">{title}</h3>
        <p className="text-ink/70 mt-2 font-semibold">{description}</p>
      </div>
    </div>
  );
}

const Chip = ({ children, active }: { children: React.ReactNode; active?: boolean }) => (
  <span
    className={cn(
      'border-ink border-2 px-2.5 py-1 font-mono text-xs font-black',
      active && 'bg-accent shadow-[3px_3px_0px_0px_#000]'
    )}
  >
    {children}
  </span>
);

export function Capabilities() {
  return (
    <section id="capabilities" className="border-ink bg-surface-alt border-b-4 py-24">
      <div className="site-container">
        <SectionHeading
          title="Agents with real tools"
          subtitle="Neither agent guesses from a diff. Both work inside a copy of your repository, the way an engineer would."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MagnifiedBento
            className="md:col-span-2"
            rows={FINDING_ROWS}
            title="Knows what to look for"
            description="Every finding carries a category and a severity, and every review ends with a verdict, so critical issues never drown in nits. Drag the lens to look closer."
          />

          <Cell
            title="Runs your code"
            description="Both agents run your tests and linters in the sandbox: the reviewer to back up its claims, the coder to prove its change works."
          >
            <div className="flex flex-wrap justify-center gap-2">
              <Chip active>run_tests</Chip>
              <Chip>run_linter</Chip>
              <Chip>search_files</Chip>
              <Chip>read_file</Chip>
            </div>
          </Cell>

          <Cell
            title="Isolated by design"
            description="Every review and every coding run gets a fresh Daytona sandbox, deleted when it ends. Agent tools never touch your servers."
          >
            <div className="border-ink relative border-4 border-dashed px-6 py-4 text-center">
              <span className="bg-surface absolute -top-3 left-3 px-1 font-mono text-[0.65rem] font-black uppercase">
                sandbox
              </span>
              <p className="font-mono text-sm font-bold">workspace/repo</p>
              <p className="text-ink/60 font-mono text-xs">deleted after the run</p>
            </div>
          </Cell>

          <Cell
            title="Your rules"
            description="Tune review sensitivity and ignored files per repository, and give coding agents extra instructions when you launch them."
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <Chip>LOW</Chip>
                <Chip active>MEDIUM</Chip>
                <Chip>HIGH</Chip>
              </div>
              <div className="flex gap-2">
                <Chip>*.lock</Chip>
                <Chip>migrations/**</Chip>
              </div>
            </div>
          </Cell>

          <Cell
            title="Findings as it goes"
            description="Comments land on the PR while the agent is still working, not in one batch at the end."
          >
            <ol className="w-full max-w-60 space-y-2">
              {[
                '0:12 · Null check in parser',
                '0:31 · N+1 query in loader',
                '0:48 · Review submitted',
              ].map((entry, index) => (
                <li
                  key={entry}
                  className={cn(
                    'border-ink border-2 px-2 py-1 font-mono text-xs font-semibold',
                    index === 2 && 'bg-highlight'
                  )}
                >
                  {entry}
                </li>
              ))}
            </ol>
          </Cell>

          <Cell
            className="md:col-span-2"
            title="Every run on record"
            description="Each Issue → PR run keeps its full conversation and every tool call, so you can replay exactly how a pull request was built."
          >
            <ol className="flex w-full max-w-xl flex-wrap justify-center gap-2">
              {[
                'read_file',
                'search_files',
                'replace_in_files',
                'run_tests',
                'git_commit',
                'finish_task',
              ].map((tool, index, tools) => (
                <li
                  key={tool}
                  className={cn(
                    'border-ink border-2 px-2 py-1 font-mono text-xs font-semibold',
                    index === tools.length - 1 && 'bg-highlight'
                  )}
                >
                  {index + 1}. {tool}
                </li>
              ))}
            </ol>
          </Cell>

          <Cell
            title="Verified before it opens"
            description="Metis confirms the agent's branch actually landed on GitHub before it opens the pull request."
          >
            <div className="font-mono text-xs leading-relaxed font-semibold">
              <p>$ git ls-remote --heads origin</p>
              <p className="text-ink/60"> refs/heads/metis/issue-128</p>
              <p className="border-ink bg-highlight mt-2 inline-block border-2 px-2 py-1">
                ✔ Pull request #129 opened
              </p>
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}

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
        'flex flex-col border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000]',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="flex min-h-36 flex-1 items-center justify-center border-b-4 border-black bg-[var(--metis-cream)] p-5"
      >
        {children}
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-xl font-black uppercase">{title}</h3>
        <p className="mt-2 font-semibold text-black/70">{description}</p>
      </div>
    </div>
  );
}

const Chip = ({ children, active }: { children: React.ReactNode; active?: boolean }) => (
  <span
    className={cn(
      'border-2 border-black px-2.5 py-1 font-mono text-xs font-black',
      active ? 'bg-[var(--metis-orange)] text-white shadow-[3px_3px_0px_0px_#000]' : 'bg-white'
    )}
  >
    {children}
  </span>
);

export function Capabilities() {
  return (
    <section
      id="capabilities"
      className="border-b-4 border-black bg-[var(--metis-pastel-2)] px-4 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-4 text-center text-4xl font-black uppercase md:text-5xl">
          A reviewer with real tools
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-lg font-semibold text-black/70">
          Metis doesn't guess from a diff. It works inside a copy of your repository, the way an
          engineer would.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MagnifiedBento
            className="md:col-span-2"
            rows={FINDING_ROWS}
            title="Knows what to look for"
            description="Every finding carries a category and a severity, and every review ends with a verdict, so critical issues never drown in nits. Drag the lens to look closer."
          />

          <Cell
            title="Runs your code"
            description="The reviewer runs your tests and linters inside the sandbox to back up what it claims."
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
            description="Each run gets a fresh Daytona sandbox that is deleted when it ends. Agent tools never touch your servers."
          >
            <div className="relative border-4 border-dashed border-black bg-white px-6 py-4 text-center">
              <span className="absolute -top-3 left-3 bg-[var(--metis-cream)] px-1 font-mono text-[0.65rem] font-black uppercase">
                sandbox
              </span>
              <p className="font-mono text-sm font-bold">workspace/repo</p>
              <p className="font-mono text-xs text-black/60">deleted after the run</p>
            </div>
          </Cell>

          <Cell
            title="Your rules"
            description="Pick a sensitivity per repository, add custom instructions, and ignore the files that don't matter."
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
                    'border-2 border-black px-2 py-1 font-mono text-xs font-semibold',
                    index === 2 ? 'bg-[var(--metis-yellow)]' : 'bg-white'
                  )}
                >
                  {entry}
                </li>
              ))}
            </ol>
          </Cell>
        </div>
      </div>
    </section>
  );
}

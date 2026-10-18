import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Box,
  CircleDot,
  GitPullRequest,
  ListOrdered,
  MessageSquareCode,
  Webhook,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from '@/components/home/SectionHeading';

/**
 * Step pictures, picked up automatically from src/assets/how-it-works/.
 * Name a file after its step key, e.g. `review-1.webp` or `issue-3.png`; until a picture
 * exists, the step shows its icon instead.
 */
const STEP_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('/src/assets/how-it-works/*.{png,jpg,jpeg,webp,avif,svg}', {
      eager: true,
      import: 'default',
    })
  ).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.')), url])
);

interface Step {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Flow {
  id: string;
  label: string;
  title: string;
  summary: string;
  steps: readonly Step[];
}

const FLOWS: readonly Flow[] = [
  {
    id: 'review-flow',
    label: 'Automatic · every PR',
    title: 'Review a pull request',
    summary: 'Open or update a PR and the review starts on its own.',
    steps: [
      {
        key: 'review-1',
        icon: Webhook,
        title: 'A PR is opened',
        description:
          'GitHub sends a signed webhook. Metis verifies it, records a pending review, and answers in milliseconds.',
      },
      {
        key: 'review-2',
        icon: ListOrdered,
        title: 'Work is queued',
        description:
          'A review job and a summary job go onto a Redis queue, so slow LLM calls never block your webhooks.',
      },
      {
        key: 'review-3',
        icon: Box,
        title: 'An agent investigates',
        description:
          'A worker clones the PR branch into a fresh Daytona sandbox. The agent reads files, searches the codebase, and runs tests and linters.',
      },
      {
        key: 'review-4',
        icon: MessageSquareCode,
        title: 'Feedback lands on the PR',
        description:
          'Findings appear inline as the agent finds them, then a summary review with a verdict. The PR title and description are updated too.',
      },
    ],
  },
  {
    id: 'issue-flow',
    label: 'On demand · any issue',
    title: 'Turn an issue into a PR',
    summary: 'Pick an issue in the dashboard and a coding agent takes it from there.',
    steps: [
      {
        key: 'issue-1',
        icon: CircleDot,
        title: 'Pick an issue',
        description:
          'Choose any open issue from the dashboard and launch an agent, with optional instructions for how to approach it.',
      },
      {
        key: 'issue-2',
        icon: Box,
        title: 'A sandbox spins up',
        description:
          'A worker clones your default branch into a fresh Daytona sandbox, with git credentials scoped to your GitHub App.',
      },
      {
        key: 'issue-3',
        icon: Bot,
        title: 'The agent codes',
        description:
          'It creates a branch, edits the code, runs your tests and linters, then commits and pushes its work.',
      },
      {
        key: 'issue-4',
        icon: GitPullRequest,
        title: 'A PR opens for review',
        description:
          'Metis checks the branch landed on GitHub and opens the pull request. The full run is saved so you can replay every step.',
      },
    ],
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const image = STEP_IMAGES[step.key];
  const Icon = step.icon;

  return (
    <li className="border-ink bg-surface flex flex-col border-4 shadow-[6px_6px_0px_0px_#000]">
      <div className="border-ink bg-surface-alt relative aspect-[4/3] overflow-hidden border-b-4">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center" aria-hidden="true">
            <Icon className="size-16" strokeWidth={1.5} />
          </div>
        )}
        <span className="font-display border-ink bg-highlight absolute top-3 left-3 flex size-10 items-center justify-center border-4 text-xl font-black">
          {index + 1}
        </span>
      </div>
      <div className="p-5">
        <h4 className="font-display mb-2 text-lg font-black uppercase">{step.title}</h4>
        <p className="text-ink/75 font-semibold">{step.description}</p>
      </div>
    </li>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-ink border-b-4 py-24">
      <div className="site-container">
        <SectionHeading
          title="How it works"
          subtitle="Two flows on the same engine: one reviews the code you write, the other writes code for you to review."
        />

        <div className="space-y-16">
          {FLOWS.map((flow) => (
            <div key={flow.id} role="group" aria-labelledby={flow.id}>
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-ink/60 mb-2 font-mono text-sm font-black tracking-widest uppercase">
                    {flow.label}
                  </p>
                  <h3 id={flow.id} className="font-display text-3xl font-black uppercase">
                    {flow.title}
                  </h3>
                </div>
                <p className="text-ink/70 max-w-md font-semibold md:text-right">{flow.summary}</p>
              </div>
              <ol className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {flow.steps.map((step, index) => (
                  <StepCard key={step.key} step={step} index={index} />
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/docs/architecture"
            className="decoration-accent hover:decoration-ink inline-flex items-center gap-2 font-bold underline decoration-4 underline-offset-4"
          >
            Read the architecture guide <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

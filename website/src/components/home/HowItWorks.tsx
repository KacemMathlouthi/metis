import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/home/SectionHeading';

const STEPS = [
  {
    title: 'A PR is opened',
    description:
      'GitHub sends a signed webhook. Metis verifies it, records a pending review, and answers in milliseconds.',
  },
  {
    title: 'Work is queued',
    description:
      'A review job and a summary job go onto a Redis queue, so slow LLM calls never block your webhooks.',
  },
  {
    title: 'An agent investigates',
    description:
      'A Celery worker clones the PR branch into an isolated Daytona sandbox. The agent reads files, searches the codebase, and runs tests and linters.',
  },
  {
    title: 'Feedback lands on GitHub',
    description:
      'Findings are posted inline as the agent discovers them, followed by a summary review. Everything is stored for your dashboard.',
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-ink border-b-4 py-24">
      <div className="site-container">
        <SectionHeading
          title="How it works"
          subtitle={
            <>
              From <code className="font-mono">git push</code> to review comments, without you
              lifting a finger.
            </>
          }
        />

        <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-ink border-4 p-6 shadow-[6px_6px_0px_0px_#000]">
              <span className="font-display border-ink bg-highlight mb-5 flex h-12 w-12 items-center justify-center border-4 text-2xl font-black">
                {index + 1}
              </span>
              <h3 className="font-display mb-2 text-xl font-black uppercase">{step.title}</h3>
              <p className="text-ink/75 font-semibold">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
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

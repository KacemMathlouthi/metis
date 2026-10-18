import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
    <section id="how-it-works" className="border-b-4 border-black bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-4 text-center text-4xl font-black uppercase md:text-5xl">
          How it works
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-lg font-semibold text-black/70">
          From <code className="font-mono">git push</code> to review comments, without you lifting a
          finger.
        </p>

        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative border-4 border-black bg-[var(--metis-cream)] p-6 shadow-[6px_6px_0px_0px_#000]"
            >
              <span className="font-display mb-4 flex h-12 w-12 items-center justify-center border-4 border-black bg-[var(--metis-yellow)] text-2xl font-black">
                {index + 1}
              </span>
              <h3 className="font-display mb-2 text-xl font-black uppercase">{step.title}</h3>
              <p className="font-semibold text-black/80">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Link
            to="/docs/architecture"
            className="inline-flex items-center gap-2 font-bold underline decoration-[var(--metis-orange)] decoration-4 underline-offset-4 hover:decoration-black"
          >
            Read the architecture guide <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

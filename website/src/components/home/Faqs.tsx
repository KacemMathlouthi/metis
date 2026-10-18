import type React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '@/components/home/SectionHeading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { REPO_URL } from '@/site';

const linkClasses =
  'decoration-accent hover:decoration-ink font-medium underline decoration-2 underline-offset-2';

const QUESTIONS: readonly { id: string; question: string; answer: React.ReactNode }[] = [
  {
    id: 'cost',
    question: 'Is Metis free?',
    answer:
      'Yes. Metis is MIT-licensed and free to self-host. You only pay for the services you plug into it: your LLM provider, Daytona sandboxes, and wherever you host the stack.',
  },
  {
    id: 'hosted',
    question: 'Is there a hosted version?',
    answer: (
      <>
        Not right now. You run Metis yourself with your own GitHub App. The{' '}
        <Link to="/docs/quickstart" className={linkClasses}>
          quickstart
        </Link>{' '}
        gets the whole stack running with Docker Compose.
      </>
    ),
  },
  {
    id: 'models',
    question: 'Which LLMs can I use?',
    answer:
      'Any model LiteLLM supports that can call tools: Gemini on Vertex AI, OpenAI, Anthropic, Mistral, Azure OpenAI, and many more. Switching is a change to MODEL_NAME, no code changes.',
  },
  {
    id: 'code',
    question: 'Where does my code go?',
    answer:
      'Only to the services you configure. The repository is cloned into a Daytona sandbox (Daytona Cloud or your own instance) that is deleted after each run, and the agent sends the code it reads to your LLM provider.',
  },
  {
    id: 'languages',
    question: 'Which languages does it review?',
    answer:
      'Any language. The agent reads code as text and can run commands. Sandboxes come with Python, TypeScript, and JavaScript runtimes, so running tests and linters works best in those ecosystems.',
  },
  {
    id: 'writes',
    question: 'Will Metis push code to my repositories?',
    answer:
      'Reviews never change code: the reviewer has read-only tools. Only the Issue → PR agent writes, and only when you launch it. It pushes a new branch and opens a pull request for you to review.',
  },
  {
    id: 'strictness',
    question: 'Can I control how strict reviews are?',
    answer:
      'Yes. Each repository has a sensitivity level (low, medium, high), custom instructions for your conventions, and ignore patterns for files that should never be reviewed.',
  },
  {
    id: 'permissions',
    question: 'What access does the GitHub App need?',
    answer: (
      <>
        Contents and pull requests (read and write), issues (read), and metadata. The{' '}
        <Link to="/docs/github-app" className={linkClasses}>
          GitHub App guide
        </Link>{' '}
        explains what each permission is used for.
      </>
    ),
  },
];

/** Adapted from @efferd/faqs-1. */
export function Faqs() {
  return (
    <section id="faq" className="border-ink bg-surface-alt border-b-4 py-24">
      <div className="site-container">
        <SectionHeading
          title="Questions, answered"
          subtitle="The short version of what people ask before they self-host Metis."
        />
        <Accordion
          type="single"
          collapsible
          className="border-ink bg-surface mx-auto max-w-4xl border-4 shadow-[6px_6px_0px_0px_#000]"
        >
          {QUESTIONS.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="px-5 md:px-6">
              <AccordionTrigger className="py-5 text-base font-medium md:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="type-body text-ink/75 max-w-[68ch] pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="type-body text-ink/75 mt-8 text-center">
          Can't find your answer?{' '}
          <a
            href={`${REPO_URL}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClasses}
          >
            Open an issue on GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}

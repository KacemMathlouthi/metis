import { ArrowDown } from 'lucide-react';
import { ScrollStackDeck, type DeckItem } from '@/components/scroll-stack-deck';
import {
  DashboardVisual,
  IssueToPrVisual,
  LlmVisual,
  ReviewVisual,
  SummaryVisual,
} from '@/components/home/FeatureVisuals';

const FEATURES: readonly DeckItem[] = [
  {
    id: 'reviews',
    tabTitle: '01 · PR reviews',
    title: 'Reviews that read the whole codebase',
    description:
      'Every opened or updated pull request gets reviewed. Metis explores the surrounding code, not just the diff, and posts findings on the exact lines, tagged by severity and category.',
    visual: <ReviewVisual />,
    color: 'var(--metis-yellow)',
  },
  {
    id: 'summaries',
    tabTitle: '02 · PR summaries',
    title: 'Every pull request explains itself',
    description:
      'A second agent runs alongside the review. It rewrites vague titles and appends a clear summary of what changed, so reviewers start with context.',
    visual: <SummaryVisual />,
    color: 'var(--metis-pastel-3)',
  },
  {
    id: 'issue-to-pr',
    tabTitle: '03 · Issue → PR',
    title: 'From issue to pull request, hands-off',
    description:
      'Launch a coding agent on any GitHub issue. It branches, edits code, runs your tests and linters, pushes, and opens a PR for you to review.',
    visual: <IssueToPrVisual />,
    color: 'var(--metis-orange-light)',
  },
  {
    id: 'any-llm',
    tabTitle: '04 · Any LLM',
    title: 'Bring the model you trust',
    description:
      'Built on LiteLLM. Use Gemini, GPT, Claude, Mistral, Azure OpenAI, or a model you host yourself. Switching is one environment variable.',
    visual: <LlmVisual />,
    color: 'var(--metis-pastel-red)',
  },
  {
    id: 'dashboard',
    tabTitle: '05 · Dashboard',
    title: 'See everything your reviewer sees',
    description:
      'Choose which repositories get reviewed, tune each one, browse every finding, and replay agent runs step by step.',
    visual: <DashboardVisual />,
    color: '#ffffff',
  },
];

export function FeatureDeck() {
  return (
    <section id="features" className="border-b-4 border-black">
      <div className="px-4 pt-20 text-center">
        <h2 className="font-display mb-4 text-4xl font-black uppercase underline decoration-[var(--metis-red)] decoration-8 md:text-5xl">
          What Metis does
        </h2>
        <p className="mx-auto max-w-2xl text-lg font-semibold text-black/70">
          One GitHub App, five jobs. Keep scrolling to deal the deck.
        </p>
        <ArrowDown className="mx-auto mt-6 h-7 w-7 animate-bounce" aria-hidden="true" />
      </div>
      <ScrollStackDeck items={FEATURES} />
    </section>
  );
}

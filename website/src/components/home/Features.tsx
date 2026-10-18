import { Bot, Code, Cpu, FileText } from 'lucide-react';

const FEATURES = [
  {
    icon: Code,
    title: 'PR REVIEWS',
    description:
      'Every opened or updated pull request gets reviewed. Metis reads the surrounding code, not just the diff, and posts findings inline on the exact lines, tagged by severity and category.',
    color: 'bg-[var(--metis-pastel-1)]',
    shadow: 'shadow-[10px_10px_0px_0px_var(--metis-orange)]',
  },
  {
    icon: FileText,
    title: 'PR SUMMARIES',
    description:
      'Vague titles and empty descriptions get fixed. Metis rewrites the PR title and appends a clear summary of what changed, so reviewers start with context.',
    color: 'bg-[var(--metis-pastel-2)]',
    shadow: 'shadow-[10px_10px_0px_0px_var(--metis-orange-light)]',
  },
  {
    icon: Bot,
    title: 'ISSUE → PR',
    description:
      'Point an agent at a GitHub issue. It creates a branch, writes the change, runs your tests and linters, commits, and opens a pull request for you to review.',
    color: 'bg-[var(--metis-pastel-3)]',
    shadow: 'shadow-[10px_10px_0px_0px_var(--metis-orange-dark)]',
  },
  {
    icon: Cpu,
    title: 'ANY LLM',
    description:
      'Built on LiteLLM. Use Gemini, GPT, Claude, Mistral, or a model you host yourself, by changing a single environment variable.',
    color: 'bg-[var(--metis-pastel-4)]',
    shadow: 'shadow-[10px_10px_0px_0px_var(--metis-red)]',
  },
] as const;

export function Features() {
  return (
    <section id="features" className="border-b-4 border-black px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display mb-16 text-center text-4xl font-black uppercase underline decoration-[var(--metis-red)] decoration-8 md:text-5xl">
          What Metis does
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description, color, shadow }) => (
            <article
              key={title}
              className={`${color} ${shadow} flex flex-col items-start border-4 border-black p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#000]`}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000]">
                <Icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="font-display mb-3 text-2xl font-black tracking-tight">{title}</h3>
              <p className="text-lg leading-relaxed font-semibold">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

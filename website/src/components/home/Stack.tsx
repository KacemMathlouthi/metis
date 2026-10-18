import { BrandLogo, type BrandName } from '@/components/brand-logos';
import { SectionHeading } from '@/components/home/SectionHeading';

interface StackItem {
  logo: BrandName;
  name: string;
  role: string;
}

const PLATFORM: readonly StackItem[] = [
  { logo: 'fastapi', name: 'FastAPI', role: 'Webhooks & REST API' },
  { logo: 'celery', name: 'Celery', role: 'Background agents' },
  { logo: 'redis', name: 'Redis', role: 'Job queue' },
  { logo: 'postgresql', name: 'PostgreSQL', role: 'Reviews, findings & runs' },
  { logo: 'daytona', name: 'Daytona', role: 'Isolated sandboxes' },
  { logo: 'react', name: 'React', role: 'Dashboard' },
];

const MODELS: readonly StackItem[] = [
  { logo: 'gemini', name: 'Gemini', role: 'via Vertex AI' },
  { logo: 'openai', name: 'OpenAI', role: 'GPT models' },
  { logo: 'anthropic', name: 'Anthropic', role: 'Claude models' },
  { logo: 'mistral', name: 'Mistral AI', role: 'Mistral models' },
  { logo: 'azure', name: 'Azure OpenAI', role: 'Your deployments' },
  { logo: 'litellm', name: 'LiteLLM', role: '100+ more providers' },
];

function StackGrid({ label, items }: { label: string; items: readonly StackItem[] }) {
  return (
    <div>
      <h3 className="text-ink/60 mb-4 font-mono text-sm font-black tracking-widest uppercase">
        {label}
      </h3>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <li
            key={item.name}
            className="border-ink hover:bg-surface-alt flex flex-col items-start gap-4 border-2 p-4 transition-colors"
          >
            <BrandLogo name={item.logo} className="size-9" />
            <div>
              <p className="font-display text-lg leading-tight font-black">{item.name}</p>
              <p className="text-ink/60 mt-1 text-sm font-semibold">{item.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stack() {
  return (
    <section id="stack" className="border-ink border-b-4 py-24">
      <div className="site-container">
        <SectionHeading
          title="Boring tech, on purpose"
          subtitle="Built from open-source parts you already know how to run, and the model provider you already use."
        />
        <div className="space-y-12">
          <StackGrid label="Runs on" items={PLATFORM} />
          <StackGrid label="Thinks with" items={MODELS} />
        </div>
      </div>
    </section>
  );
}

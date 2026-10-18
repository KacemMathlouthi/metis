import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { CodeBlock } from '@/components/ui/CodeBlock';
import lechat from '@/assets/lechat.gif';
import { REPO_URL } from '@/site';

const QUICKSTART = `
git clone ${REPO_URL}.git
cd metis

# add your GitHub App, LLM and Daytona keys
cp backend/.env.example backend/.env

# API, worker, dashboard, Postgres and Redis
make dev
`;

export function SelfHostCta() {
  return (
    <section className="border-b-4 border-black bg-[var(--metis-pastel-3)] px-4 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div>
          <img
            src={lechat}
            alt=""
            width={894}
            height={469}
            loading="lazy"
            className="mb-6 h-28 w-auto border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000]"
          />
          <h2 className="font-display mb-6 text-4xl font-black uppercase md:text-5xl">
            Run it yourself
          </h2>
          <p className="mb-8 text-lg font-semibold">
            Metis is free and open source. Bring your own GitHub App, LLM key, and Daytona account,
            and the whole stack starts with one command. Your code only goes to the services you
            configure.
          </p>
          <ButtonLink href="/docs/quickstart" size="lg">
            READ THE QUICKSTART <ArrowRight />
          </ButtonLink>
        </div>
        <CodeBlock code={QUICKSTART} title="terminal" className="my-0" />
      </div>
    </section>
  );
}

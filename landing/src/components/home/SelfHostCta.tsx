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
    <section className="border-ink bg-accent border-b-4 py-24">
      <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          {/* The GIF has an opaque white background; multiply blends it into the section color. */}
          <img
            src={lechat}
            alt=""
            width={894}
            height={469}
            loading="lazy"
            className="mb-6 h-28 w-auto mix-blend-multiply"
          />
          <h2 className="type-title mb-6">Run it yourself</h2>
          <p className="type-lede mb-8 max-w-[60ch] text-pretty">
            Metis is free and open source. Bring your own GitHub App, LLM key, and Daytona account,
            and the whole stack starts with one command. Your code only goes to the services you
            configure.
          </p>
          <ButtonLink href="/docs/quickstart" size="lg" variant="dark">
            Read the quickstart <ArrowRight />
          </ButtonLink>
        </div>
        <CodeBlock
          code={QUICKSTART}
          title="terminal"
          className="my-0 shadow-[8px_8px_0px_0px_#000]"
        />
      </div>
    </section>
  );
}

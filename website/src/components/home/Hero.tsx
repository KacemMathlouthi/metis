import { BookOpen, Github } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import handshakeWithAi from '@/assets/handshake-with-ai.jpg';
import { REPO_URL } from '@/site';

export function Hero() {
  return (
    <header className="relative -mt-14 flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden pt-28 pb-20 text-center">
      <img
        src={handshakeWithAi}
        alt=""
        width={1920}
        height={622}
        fetchPriority="high"
        className="pointer-events-none absolute top-1/2 right-0 left-0 z-0 h-auto w-full -translate-y-1/2 opacity-20 mix-blend-multiply"
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(255,130,5,0.18),transparent_60%)]" />

      <div className="site-container relative z-10 flex flex-col items-center">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="border-ink mb-8 inline-flex items-center gap-2 border-2 px-3 py-1 font-mono text-xs font-bold hover:underline"
        >
          <span className="bg-accent size-2" aria-hidden="true" />
          OPEN SOURCE · MIT · KacemMathlouthi/metis
        </a>
        <h1 className="font-display-tight mb-8 text-5xl leading-none font-black sm:text-7xl lg:text-8xl xl:text-9xl">
          YOUR AI <br />
          <span className="border-ink bg-accent inline-block -rotate-2 border-4 px-4 shadow-[8px_8px_0px_0px_#000]">
            CODE
          </span>{' '}
          COMPANION
        </h1>
        <p className="text-ink/80 mb-10 max-w-2xl text-lg font-semibold md:text-xl">
          An open-source GitHub App with two jobs: review every pull request you open, and turn the
          issues you pick into pull requests. Self-hosted, with the LLM of your choice.
        </p>
        <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
          <ButtonLink href="/docs/quickstart" size="lg">
            SELF-HOST METIS <BookOpen />
          </ButtonLink>
          <ButtonLink href={REPO_URL} size="lg" variant="outline">
            VIEW ON GITHUB <Github />
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

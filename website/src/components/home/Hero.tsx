import { BookOpen, Github } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import handshakeWithAi from '@/assets/handshake-with-ai.jpg';
import { REPO_URL } from '@/site';

export function Hero() {
  return (
    <header className="relative flex min-h-[calc(100vh-156px)] flex-col items-center justify-center overflow-hidden border-b-4 border-black px-4 py-16 text-center">
      <img
        src={handshakeWithAi}
        alt=""
        width={1920}
        height={622}
        fetchPriority="high"
        className="pointer-events-none absolute top-1/2 right-0 left-0 z-0 h-auto w-full -translate-y-1/2 opacity-20 mix-blend-multiply"
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_0%_0%,rgba(252,211,77,0.35),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_100%_100%,rgba(251,146,60,0.24),transparent_40%)]" />

      <div className="relative z-10 max-w-5xl">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 inline-block rotate-[-2deg] border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[4px_4px_0px_0px_var(--metis-orange)] hover:underline"
        >
          OPEN SOURCE · MIT · KacemMathlouthi/metis
        </a>
        <h1 className="font-display-tight mb-8 text-5xl leading-none font-black sm:text-6xl md:text-8xl">
          YOUR AI <br />
          <span className="inline-block -rotate-2 border-4 border-black bg-[var(--metis-orange)] px-4 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            CODE
          </span>{' '}
          COMPANION
        </h1>
        <p className="mx-auto mb-10 max-w-2xl border-2 border-black bg-white/95 p-4 text-base font-semibold shadow-[6px_6px_0px_0px_var(--metis-orange-light)] md:text-lg">
          An open-source GitHub App that reviews your pull requests, writes their summaries, and
          turns issues into PRs. Self-hosted, with the LLM of your choice.
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

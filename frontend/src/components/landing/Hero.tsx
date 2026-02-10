import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github } from 'lucide-react';
import handshakeWithAi from '@/assets/Handshake-with-AI.png';

export const Hero: React.FC = () => {
  return (
    <header className="relative flex min-h-[calc(100vh-156px)] flex-col items-center justify-center overflow-hidden border-b-4 border-black bg-[var(--metis-cream)] px-4 py-14 text-center text-black">
      <img
        src={handshakeWithAi}
        alt="Human and AI handshake"
        className="pointer-events-none absolute top-1/2 right-0 left-0 z-0 h-auto w-full -translate-y-1/2 opacity-20"
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_0%_0%,rgba(252,211,77,0.35),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_100%_100%,rgba(251,146,60,0.24),transparent_40%)]" />

      <div className="relative z-10 max-w-5xl">
        <Badge className="mb-6 rotate-[-2deg] border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_var(--metis-orange)]">
          OPEN SOURCE -{' '}
          <a
            href="https://github.com/KacemMathlouthi/metis"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            KacemMathlouthi/metis
          </a>
        </Badge>
        <h1 className="landing-display-tight mb-8 text-6xl leading-none font-black md:text-8xl">
          YOUR AI <br />
          <span className="inline-block -rotate-2 transform border-4 border-black bg-[var(--metis-orange)] px-4 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            CODE
          </span>{' '}
          COMPANION
        </h1>
        <p className="mx-auto mb-10 max-w-xl border-2 border-black bg-white/95 p-3 text-base font-semibold text-black shadow-[6px_6px_0px_0px_var(--metis-orange-light)] md:text-lg">
          Review fast. Ship clean.
          <br />
          Metis catches issues before they hit production.
        </p>
        <div className="flex flex-col justify-center gap-6 md:flex-row">
          <Button size="lg" className="bg-[var(--metis-orange)] text-white">
            INSTALL ON GITHUB <Github className="h-6 w-6" />
          </Button>
          <Button size="lg" className="bg-white">
            VIEW DEMO
          </Button>
        </div>
      </div>
    </header>
  );
};

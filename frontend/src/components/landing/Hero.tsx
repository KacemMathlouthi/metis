import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <header className="relative flex min-h-[calc(100vh-156px)] flex-col items-center justify-center overflow-hidden border-b-4 border-black bg-[var(--metis-cream)] px-4 py-20 text-center">
      {/* Decorative Grid Background */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-[0.08]">
        {Array.from({ length: 400 }).map((_, i) => (
          <div key={i} className="h-full w-full border border-black"></div>
        ))}
      </div>
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[var(--metis-pastel-red)] blur-2xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[var(--metis-pastel-orange)] blur-2xl" />

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
        <p className="mx-auto mb-10 max-w-2xl border-2 border-black bg-white p-4 text-xl font-semibold shadow-[6px_6px_0px_0px_var(--metis-orange-light)] md:text-2xl">
          Metis doesn't just chat. It reviews PRs, writes docs, fixes bugs, and makes your repo
          shine.
        </p>
        <div className="flex flex-col justify-center gap-6 md:flex-row">
          <Button size="xl" className="bg-[var(--metis-orange)] text-white">
            INSTALL ON GITHUB <Github className="h-6 w-6" />
          </Button>
          <Button size="xl" className="bg-white">
            VIEW DEMO
          </Button>
        </div>
      </div>
    </header>
  );
};

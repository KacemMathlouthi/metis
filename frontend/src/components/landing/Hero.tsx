import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <header className="relative flex min-h-[calc(100vh-156px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* Decorative Grid Background */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-10">
        {Array.from({ length: 400 }).map((_, i) => (
          <div key={i} className="h-full w-full border border-black"></div>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl">
        <Badge className="mb-6 rotate-[-2deg] border-2 border-white bg-black text-white shadow-[4px_4px_0px_0px_#F472B6]">
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
        <h1 className="mb-8 text-6xl leading-none font-black tracking-tight md:text-8xl">
          YOUR AI <br />
          <span className="inline-block -rotate-2 transform border-4 border-black bg-[#4ADE80] px-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            CODE
          </span>{' '}
          COMPANION
        </h1>
        <p className="mx-auto mb-10 max-w-2xl border-2 border-black bg-white p-4 text-xl font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:text-2xl">
          Metis doesn't just chat. It reviews PRs, writes docs, fixes bugs, and makes your repo
          shine.
        </p>
        <div className="flex flex-col justify-center gap-6 md:flex-row">
          <Button size="xl" className="bg-[#F472B6]">
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

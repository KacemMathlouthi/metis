import React from 'react';
import { Github, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="relative overflow-hidden bg-black pt-24 pb-0">
      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center justify-center gap-6">
          <p className="text-center text-sm font-semibold tracking-tight text-white">
            Made by{' '}
            <span className="inline-block -rotate-2 transform cursor-default border-2 border-white bg-[var(--metis-pastel-orange)] px-2 py-0.5 text-black shadow-[2px_2px_0px_0px_var(--metis-red)]">
              Kacem Mathlouthi
            </span>{' '}
            with 💗
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/KacemMathlouthi"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 border-2 border-white bg-black px-4 py-2 text-xs font-semibold text-white shadow-[2px_2px_0px_0px_var(--metis-red)] transition-all hover:translate-x-0.5 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-none"
            >
              <Github className="h-4 w-4" />
              <span>GITHUB</span>
            </a>
            <a
              href="https://linkedin.com/in/kacem-mathlouthi"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 border-2 border-white bg-black px-4 py-2 text-xs font-semibold text-white shadow-[2px_2px_0px_0px_var(--metis-orange-dark)] transition-all hover:translate-x-0.5 hover:-translate-y-0.5 hover:border-[var(--metis-orange-dark)] hover:bg-[var(--metis-orange-dark)] hover:text-white hover:shadow-none"
            >
              <Linkedin className="h-4 w-4" />
              <span>LINKEDIN</span>
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative flex w-full justify-center overflow-hidden select-none">
        <h2
          className="landing-display translate-y-4 transform bg-clip-text pb-4 text-[13rem] leading-[0.82] font-black tracking-[-0.01em] text-transparent opacity-90 drop-shadow-[0_10px_20px_rgba(225,5,0,0.35)] md:text-[18rem] lg:text-[24rem] xl:text-[30rem]"
          style={{
            backgroundImage:
              'linear-gradient(180deg, var(--metis-yellow) 0%, var(--metis-orange-light) 28%, var(--metis-orange) 52%, var(--metis-orange-dark) 72%, var(--metis-red) 100%)',
            letterSpacing: '0.02em',
          }}
        >
          METIS
        </h2>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>
    </footer>
  );
};

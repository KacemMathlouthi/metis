import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden bg-black px-4 pb-0 pt-20 text-center">
      <div className="relative z-10 mb-12">
        <p className="mb-8 text-xl font-bold text-white">
          Made by{' '}
          <span className="inline-block -rotate-1 transform border-2 border-[#FCD34D] bg-[#FCD34D] px-3 py-1 text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]">
            Kacem Mathlouthi
          </span>{' '}
          with 💗
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="https://github.com/KacemMathlouthi"
            target="_blank"
            rel="noopener noreferrer"
            className="transform border-2 border-white bg-white px-6 py-3 font-black text-black shadow-[4px_4px_0px_0px_#F472B6] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_#F472B6]"
          >
            <Github className="inline h-5 w-5" /> GITHUB
          </a>
          <a
            href="https://linkedin.com/in/kacem-mathlouthi"
            target="_blank"
            rel="noopener noreferrer"
            className="transform border-2 border-white bg-white px-6 py-3 font-black text-black shadow-[4px_4px_0px_0px_#FCD34D] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_#4ADE80]"
          >
            LINKEDIN
          </a>
        </div>
      </div>
      <div className="relative">
        <h2 className="bg-gradient-to-b from-[#FCD34D] via-[#ffc400] to-[#F472B6] bg-clip-text pb-0 text-[8rem] font-black leading-none text-transparent md:text-[14rem] lg:text-[18rem] xl:text-[22rem]">
          METIS
        </h2>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
      </div>
    </footer>
  );
};

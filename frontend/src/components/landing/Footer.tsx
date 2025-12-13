import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="relative overflow-hidden bg-black px-4 pt-14 pb-0 text-center">
      <div className="relative z-10 mb-1">
        <p className="mb-6 text-lg font-bold text-white">
          Made by{' '}
          <span className="shadow-brutal-white inline-block -rotate-1 transform border-2 border-[#FCD34D] bg-[#FCD34D] px-3 py-1 text-black">
            Kacem Mathlouthi
          </span>{' '}
          with 💗
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/KacemMathlouthi"
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-brutal-pink hover:shadow-brutal-pink-lg transform border-2 border-white bg-white px-5 py-2 text-sm font-black text-black transition-all hover:translate-x-1 hover:-translate-y-1"
          >
            <Github className="inline h-4 w-4" /> GITHUB
          </a>
          <a
            href="https://linkedin.com/in/kacem-mathlouthi"
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-brutal-yellow hover:shadow-brutal-yellow-lg transform border-2 border-white bg-white px-5 py-2 text-sm font-black text-black transition-all hover:translate-x-1 hover:-translate-y-1"
          >
            LINKEDIN
          </a>
        </div>
      </div>
      <div className="relative">
        <h2 className="bg-gradient-to-b from-[#FCD34D] via-[#ffc400] to-[#F472B6] bg-clip-text pb-0 text-[10rem] leading-none font-black text-transparent md:text-[16rem] lg:text-[20rem] xl:text-[26rem]">
          METIS
        </h2>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
      </div>
    </footer>
  );
};

import React from 'react';
import { CheckCircle } from 'lucide-react';

export const CodeTerminal: React.FC = () => {
  return (
    <section className="border-b-4 border-black bg-black px-4 py-20 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row">
        <div className="md:w-1/2">
          <h2 className="landing-display mb-6 text-5xl font-black text-white">
            IT WORKS WHERE YOU WORK
          </h2>
          <p className="mb-8 border-l-8 border-[var(--metis-orange-dark)] pl-6 text-xl font-semibold text-white/90">
            Seamless integration with GitHub. No complex configuration. Just install the bot and
            watch your productivity skyrocket.
          </p>
          <ul className="space-y-4 text-lg font-semibold">
            <li className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 fill-[var(--metis-orange-dark)]" /> Zero-config setup
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 fill-[var(--metis-orange-dark)]" /> Custom instruction
              support
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 fill-[var(--metis-orange-dark)]" /> Secure & Private
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden rounded-xl border-4 border-white bg-[#0b0b0b] shadow-[12px_12px_0px_0px_var(--metis-orange-dark)]">
            {/* Window Header */}
            <div className="flex items-center gap-2 border-b-4 border-white/20 bg-black px-4 py-3">
              <div className="h-3 w-3 rounded-full border border-white/20 bg-[var(--metis-red)]"></div>
              <div className="h-3 w-3 rounded-full border border-white/20 bg-[var(--metis-orange-dark)]"></div>
              <div className="h-3 w-3 rounded-full border border-white/20 bg-white"></div>
              <div className="ml-4 text-xs font-semibold text-white/70">metis-bot — bash</div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 text-sm leading-relaxed md:text-base">
              <div className="group">
                <p className="mb-2">
                  <span className="font-bold text-[var(--metis-orange-dark)]">➜</span>{' '}
                  <span className="font-bold text-white">~/project</span>{' '}
                  <span className="text-white">git push origin feature/new-api</span>
                </p>
                <div className="mb-4 ml-1 border-l-2 border-white/20 pl-4">
                  <p className="text-white/70">Enumerating objects: 5, done.</p>
                  <p className="text-white/70">Writing objects: 100% (3/3), 320 bytes, done.</p>
                  <p className="text-white/70">To github.com:user/repo.git</p>
                </div>
              </div>

              <div className="animate-pulse">
                <p className="mb-2 font-bold text-white">
                  <span className="text-[var(--metis-red)]">@metis-bot</span> is analyzing
                  changes...
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[var(--metis-orange-dark)]">
                  <span className="text-xl">✔</span>
                  <span>Found 2 Critical Issues!</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--metis-orange-dark)]">
                  <span className="text-xl">✔</span>
                  <span>Documenting the PR...</span>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded border border-white/20 bg-white/5 p-2 font-bold text-white">
                  <span>PR Reviewed & Summary Generated!</span>
                </div>
              </div>

              <p className="mt-4">
                <span className="font-bold text-[var(--metis-orange-dark)]">➜</span>{' '}
                <span className="font-bold text-white">~/project</span>{' '}
                <span className="inline-block h-4 w-2 animate-pulse bg-white align-middle"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

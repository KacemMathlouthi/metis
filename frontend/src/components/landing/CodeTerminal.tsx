import React from 'react';
import { CheckCircle } from 'lucide-react';

export const CodeTerminal: React.FC = () => {
  return (
    <section className="border-b-4 border-black bg-[#F472B6] px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row">
        <div className="md:w-1/2">
          <h2 className="mb-6 text-5xl font-black text-white drop-shadow-[4px_4px_0_#000]">
            IT WORKS WHERE YOU WORK
          </h2>
          <p className="mb-8 border-l-8 border-black pl-6 text-xl font-bold">
            Seamless integration with GitHub. No complex configuration. Just install the bot and
            watch your productivity skyrocket.
          </p>
          <ul className="space-y-4 text-lg font-bold">
            <li className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 fill-white" /> Zero-config setup
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 fill-white" /> Custom instruction support
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 fill-white" /> Secure & Private
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden rounded-xl border-4 border-black bg-[#0f172a] shadow-[12px_12px_0px_0px_#000]">
            {/* Window Header */}
            <div className="flex items-center gap-2 border-b-4 border-black bg-[#1e293b] px-4 py-3">
              <div className="h-3 w-3 rounded-full border border-black/20 bg-[#FF5F56]"></div>
              <div className="h-3 w-3 rounded-full border border-black/20 bg-[#FFBD2E]"></div>
              <div className="h-3 w-3 rounded-full border border-black/20 bg-[#27C93F]"></div>
              <div className="ml-4 font-mono text-xs font-bold text-gray-400">
                metis-bot — bash
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm leading-relaxed md:text-base">
              <div className="group">
                <p className="mb-2">
                  <span className="font-bold text-[#F472B6]">➜</span>{' '}
                  <span className="font-bold text-[#4ADE80]">~/project</span>{' '}
                  <span className="text-white">git push origin feature/new-api</span>
                </p>
                <div className="mb-4 ml-1 border-l-2 border-gray-700/50 pl-4">
                  <p className="text-gray-400">Enumerating objects: 5, done.</p>
                  <p className="text-gray-400">Writing objects: 100% (3/3), 320 bytes, done.</p>
                  <p className="text-gray-400">To github.com:user/repo.git</p>
                </div>
              </div>

              <div className="animate-pulse">
                <p className="mb-2 font-bold text-white">
                  <span className="text-[#F472B6]">@metis-bot</span> is analyzing changes...
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <span className="text-xl">✔</span>
                  <span>Found 2 Critical Issues!</span>
                </div>
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <span className="text-xl">✔</span>
                  <span>Documenting the PR...</span>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded border border-[#F472B6]/20 bg-[#F472B6]/10 p-2 font-bold text-[#F472B6]">
                  <span>PR Reviewed & Summary Generated!</span>
                </div>
              </div>

              <p className="mt-4">
                <span className="font-bold text-[#F472B6]">➜</span>{' '}
                <span className="font-bold text-[#4ADE80]">~/project</span>{' '}
                <span className="inline-block h-4 w-2 align-middle bg-white animate-pulse"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

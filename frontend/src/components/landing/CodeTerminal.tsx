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
          <div className="rounded-none bg-black p-2 shadow-[12px_12px_0px_0px_#fff]">
            <div className="h-80 overflow-y-auto border-2 border-gray-700 bg-[#1e1e1e] p-6 font-mono text-sm text-green-400 md:text-base">
              <p className="mb-2">
                <span className="text-blue-400">➜</span>{' '}
                <span className="text-yellow-400">~</span> git push origin feature/new-api
              </p>
              <p className="mb-2 opacity-50">Enumerating objects: 5, done.</p>
              <p className="mb-2 opacity-50">
                Writing objects: 100% (3/3), 320 bytes | 320.00 KiB/s, done.
              </p>
              <p className="mb-6 opacity-50">To github.com:user/repo.git</p>

              <p className="mb-2 text-white">@metis-bot is analyzing changes...</p>
              <p className="mb-2 text-white">Found 2 optimizations.</p>
              <p className="mb-2 text-white">Applying suggestions...</p>
              <p className="font-bold text-[#F472B6]">✔ PR Commented.</p>
              <p className="font-bold text-[#F472B6]">✔ Documentation Updated.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

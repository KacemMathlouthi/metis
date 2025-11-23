import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, CheckCircle, Code, FileText, Github } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCD34D]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b-4 border-black bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#F472B6] text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            M
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic">METIS</h1>
        </div>
        <div className="hidden gap-4 md:flex">
          <a href="#features" className="font-bold decoration-4 underline-offset-4 hover:underline">
            FEATURES
          </a>
          <a href="#docs" className="font-bold decoration-4 underline-offset-4 hover:underline">
            DOCS
          </a>
          <a href="#pricing" className="font-bold decoration-4 underline-offset-4 hover:underline">
            PRICING
          </a>
        </div>
        <Button variant="noShadow" className="bg-[#4ADE80]">
          LAUNCH APP <ArrowRight className="h-5 w-5" />
        </Button>
      </nav>

      {/* Hero Section */}
      <header className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        {/* Decorative Grid Background */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-10">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="h-full w-full border border-black"></div>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl">
          <Badge className="mb-6 rotate-[-2deg] border-2 border-white bg-black text-white shadow-[4px_4px_0px_0px_#F472B6]">
            V2.0 IS NOW LIVE
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
            shine. Stop doing the boring stuff.
          </p>
          <div className="flex flex-col justify-center gap-6 md:flex-row">
            <Button size="xl" className="bg-[#F472B6]">
              INSTALL ON GITHUB <Github className="h-6 w-6" />
            </Button>
            <Button size="xl" variant="noShadow" className="bg-white">
              VIEW DEMO
            </Button>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div className="overflow-hidden border-y-4 border-black bg-black py-4 whitespace-nowrap text-[#FCD34D]">
        <div className="animate-marquee inline-block font-mono text-2xl font-bold">
          PR REVIEWS • DOC UPDATES • TITLE GENERATION • BUG FIXES • SECURITY AUDITS • PR REVIEWS •
          DOC UPDATES • TITLE GENERATION • BUG FIXES • SECURITY AUDITS •
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="border-b-4 border-black bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-5xl font-black uppercase underline decoration-[#F472B6] decoration-8">
            What Metis Does
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="bg-[#E0F2FE]">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Code className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-2xl font-black">PR REVIEWS</h3>
                <p className="font-medium">
                  Metis scans every line of code. It catches bugs, suggests optimizations, and
                  enforces style guides before you even wake up.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#FCE7F3]">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-2xl font-black">DOCUMENTATION</h3>
                <p className="font-medium">
                  Did you forget to update the README? Metis didn't. It automatically generates
                  documentation based on code changes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#DCFCE7]">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-2xl font-black">AUTONOMOUS FIXES</h3>
                <p className="font-medium">
                  Give Metis an issue, and it will create a branch, fix the bug, and open a PR with
                  a perfect summary.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Terminal Section */}
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

      {/* Footer */}
      <footer className="bg-black px-4 py-12 text-center text-white">
        <h2 className="mb-4 bg-gradient-to-r from-[#FCD34D] via-[#F472B6] to-[#4ADE80] bg-clip-text text-8xl font-black text-transparent">
          METIS
        </h2>
        <p className="mb-8 font-mono">BUILT FOR DEVS WHO HATE BUSY WORK.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-[#FCD34D]">
            TWITTER
          </a>
          <a href="#" className="hover:text-[#FCD34D]">
            GITHUB
          </a>
          <a href="#" className="hover:text-[#FCD34D]">
            DISCORD
          </a>
        </div>
      </footer>
    </div>
  );
};

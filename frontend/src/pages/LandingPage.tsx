import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, CheckCircle, Code, FileText, Github } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCD34D]">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#F472B6] border-4 border-black flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            M
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic">METIS</h1>
        </div>
        <div className="hidden md:flex gap-4">
          <a href="#features" className="font-bold hover:underline decoration-4 underline-offset-4">FEATURES</a>
          <a href="#docs" className="font-bold hover:underline decoration-4 underline-offset-4">DOCS</a>
          <a href="#pricing" className="font-bold hover:underline decoration-4 underline-offset-4">PRICING</a>
        </div>
        <Button variant="noShadow" className="bg-[#4ADE80]">
          LAUNCH APP <ArrowRight className="w-5 h-5" />
        </Button>
      </nav>

      {/* Hero Section */}
      <header className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-10 pointer-events-none">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-black h-full w-full"></div>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl">
          <Badge className="mb-6 rotate-[-2deg] bg-black text-white border-2 border-white shadow-[4px_4px_0px_0px_#F472B6]">
            V2.0 IS NOW LIVE
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black leading-none mb-8 tracking-tight">
            YOUR AI <br/>
            <span className="bg-[#4ADE80] px-4 border-4 border-black inline-block transform -rotate-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">CODE</span> COMPANION
          </h1>
          <p className="text-xl md:text-2xl font-bold mb-10 max-w-2xl mx-auto bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            Metis doesn't just chat. It reviews PRs, writes docs, fixes bugs, and makes your repo shine.
            Stop doing the boring stuff.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Button size="xl" className="bg-[#F472B6]">
              INSTALL ON GITHUB <Github className="w-6 h-6" />
            </Button>
            <Button size="xl" variant="noShadow" className="bg-white">
              VIEW DEMO
            </Button>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div className="bg-black text-[#FCD34D] py-4 border-y-4 border-black overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee font-mono text-2xl font-bold">
          PR REVIEWS • DOC UPDATES • TITLE GENERATION • BUG FIXES • SECURITY AUDITS • PR REVIEWS • DOC UPDATES • TITLE GENERATION • BUG FIXES • SECURITY AUDITS •
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black mb-16 text-center uppercase decoration-8 underline decoration-[#F472B6]">What Metis Does</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#E0F2FE]">
              <CardContent className="pt-6">
                <div className="mb-4 bg-white border-2 border-black p-3 w-16 h-16 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Code className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-2">PR REVIEWS</h3>
                <p className="font-medium">Metis scans every line of code. It catches bugs, suggests optimizations, and enforces style guides before you even wake up.</p>
              </CardContent>
            </Card>

            <Card className="bg-[#FCE7F3]">
              <CardContent className="pt-6">
                <div className="mb-4 bg-white border-2 border-black p-3 w-16 h-16 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-2">DOCUMENTATION</h3>
                <p className="font-medium">Did you forget to update the README? Metis didn't. It automatically generates documentation based on code changes.</p>
              </CardContent>
            </Card>

            <Card className="bg-[#DCFCE7]">
              <CardContent className="pt-6">
                <div className="mb-4 bg-white border-2 border-black p-3 w-16 h-16 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-2">AUTONOMOUS FIXES</h3>
                <p className="font-medium">Give Metis an issue, and it will create a branch, fix the bug, and open a PR with a perfect summary.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Terminal Section */}
      <section className="py-20 px-4 bg-[#F472B6] border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-5xl font-black mb-6 text-white drop-shadow-[4px_4px_0_#000]">IT WORKS WHERE YOU WORK</h2>
            <p className="text-xl font-bold border-l-8 border-black pl-6 mb-8">
              Seamless integration with GitHub. No complex configuration. Just install the bot and watch your productivity skyrocket.
            </p>
            <ul className="space-y-4 font-bold text-lg">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 fill-white" /> Zero-config setup
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 fill-white" /> Custom instruction support
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 fill-white" /> Secure & Private
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="bg-black p-2 rounded-none shadow-[12px_12px_0px_0px_#fff]">
              <div className="bg-[#1e1e1e] p-6 font-mono text-sm md:text-base text-green-400 h-80 overflow-y-auto border-2 border-gray-700">
                <p className="mb-2"><span className="text-blue-400">➜</span> <span className="text-yellow-400">~</span> git push origin feature/new-api</p>
                <p className="mb-2 opacity-50">Enumerating objects: 5, done.</p>
                <p className="mb-2 opacity-50">Writing objects: 100% (3/3), 320 bytes | 320.00 KiB/s, done.</p>
                <p className="mb-6 opacity-50">To github.com:user/repo.git</p>

                <p className="mb-2 text-white">@metis-bot is analyzing changes...</p>
                <p className="mb-2 text-white">Found 2 optimizations.</p>
                <p className="mb-2 text-white">Applying suggestions...</p>
                <p className="text-[#F472B6] font-bold">✔ PR Commented.</p>
                <p className="text-[#F472B6] font-bold">✔ Documentation Updated.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 text-center">
        <h2 className="text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FCD34D] via-[#F472B6] to-[#4ADE80]">METIS</h2>
        <p className="font-mono mb-8">BUILT FOR DEVS WHO HATE BUSY WORK.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-[#FCD34D]">TWITTER</a>
          <a href="#" className="hover:text-[#FCD34D]">GITHUB</a>
          <a href="#" className="hover:text-[#FCD34D]">DISCORD</a>
        </div>
      </footer>
    </div>
  );
};

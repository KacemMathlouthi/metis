import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Marquee } from '@/components/landing/Marquee';
import { Features } from '@/components/landing/Features';
import { CodeTerminal } from '@/components/landing/CodeTerminal';
import { Footer } from '@/components/landing/Footer';

export const LandingPage: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Metis AI';
  }, []);

  return (
    <div className="landing flex min-h-screen flex-col bg-[var(--metis-cream)] text-black">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <CodeTerminal />
      <Footer />
    </div>
  );
};

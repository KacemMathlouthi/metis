import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b-4 border-black bg-white/90 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[var(--metis-orange-dark)] text-2xl font-black text-white shadow-[4px_4px_0px_0px_#000]">
          M
        </div>
        <h1 className="landing-display text-4xl font-black tracking-tighter">METIS</h1>
      </div>
      <div className="hidden gap-4 md:flex">
        <a href="#features" className="font-bold decoration-4 underline-offset-4 hover:underline">
          FEATURES
        </a>
        <a href="#contact" className="font-bold decoration-4 underline-offset-4 hover:underline">
          CONTACT
        </a>
      </div>
      <a href="/login">
        <Button className="bg-[var(--metis-orange)] text-white">
          LOGIN <ArrowRight className="h-5 w-5" />
        </Button>
      </a>
    </nav>
  );
};

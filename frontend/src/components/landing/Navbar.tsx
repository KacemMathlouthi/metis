import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b-4 border-black bg-white p-4">
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
        <a href="#contact" className="font-bold decoration-4 underline-offset-4 hover:underline">
          CONTACT
        </a>
      </div>
      <a href="/login">
        <Button className="bg-[#4ADE80]">
          LOGIN <ArrowRight className="h-5 w-5" />
        </Button>
      </a>
    </nav>
  );
};

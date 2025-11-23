import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Code, FileText } from 'lucide-react';

export const Features: React.FC = () => {
  return (
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
  );
};

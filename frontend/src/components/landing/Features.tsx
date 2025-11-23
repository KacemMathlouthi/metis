import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Code, FileText, Shield, Zap, GitPullRequest } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'PR REVIEWS',
      description:
        'Metis scans every line of code. It catches bugs, suggests optimizations, and enforces style guides before you even wake up.',
      color: 'bg-[#E0F2FE]', // Light Blue
      shadow: 'shadow-[8px_8px_0px_0px_#0ea5e9]',
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'DOCUMENTATION',
      description:
        "Did you forget to update the README? Metis didn't. It automatically generates documentation based on code changes.",
      color: 'bg-[#FCE7F3]', // Light Pink
      shadow: 'shadow-[8px_8px_0px_0px_#ec4899]',
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'AUTONOMOUS FIXES',
      description:
        'Give Metis an issue, and it will create a branch, fix the bug, and open a PR with a perfect summary.',
      color: 'bg-[#DCFCE7]', // Light Green
      shadow: 'shadow-[8px_8px_0px_0px_#22c55e]',
    },
    {
      icon: <GitPullRequest className="h-8 w-8" />,
      title: 'CONTEXT AWARE',
      description:
        'Metis understands your entire codebase, not just the changed files, ensuring changes fit the bigger picture.',
      color: 'bg-[#FFEDD5]', // Light Orange
      shadow: 'shadow-[8px_8px_0px_0px_#f97316]',
    },
  ];

  return (
    <section id="features" className="border-b-4 border-black bg-white px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-16 text-center text-5xl font-black uppercase underline decoration-[#F472B6] decoration-8">
          What Metis Does
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`${feature.color} border-4 border-black transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]`}
            >
              <CardContent className="flex flex-col items-start pt-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 hover:rotate-6">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-2xl font-black uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-lg font-bold leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

import type React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Text color for a dark section background. */
  inverted?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, inverted, className }: SectionHeadingProps) {
  return (
    <div className={cn('mx-auto mb-12 max-w-3xl text-center md:mb-16', className)}>
      <h2 className="type-title">{title}</h2>
      {subtitle && (
        <p
          className={cn(
            'type-lede mx-auto mt-5 max-w-[60ch] text-pretty',
            inverted ? 'text-white/75' : 'text-ink/70'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

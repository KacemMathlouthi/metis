import type React from 'react';
import { Link } from 'react-router-dom';
import { cn, isExternalHref } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-accent text-ink',
  outline: 'bg-transparent text-ink',
  dark: 'bg-ink text-white',
} as const;

const SIZES = {
  sm: 'h-9 px-3 text-sm [&_svg]:size-4 shadow-[3px_3px_0px_0px_#000]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base md:h-14 md:px-8 md:text-lg',
} as const;

interface ButtonLinkProps {
  /** Internal paths ("/docs") use client-side routing; absolute URLs open in a new tab. */
  href: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: ButtonLinkProps) {
  const classes = cn(
    'border-ink inline-flex items-center justify-center gap-2 border-2 font-bold whitespace-nowrap shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none [&_svg]:size-5 [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={classes}>
      {children}
    </Link>
  );
}

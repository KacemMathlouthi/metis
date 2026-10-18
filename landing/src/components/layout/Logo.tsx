import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/layout/LogoMark';
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from '@/components/layout/wordmark';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** White wordmark for dark backgrounds. */
  inverted?: boolean;
}

export function Logo({ inverted = false }: LogoProps) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Metis home">
      <LogoMark
        className={cn(
          'size-8',
          inverted
            ? 'shadow-[2px_2px_0px_0px_var(--color-accent)]'
            : 'shadow-[2px_2px_0px_0px_#000]'
        )}
      />
      <svg
        viewBox={WORDMARK_VIEWBOX}
        aria-hidden="true"
        focusable="false"
        className={cn('h-[1.05rem] w-auto', inverted ? 'text-white' : 'text-ink')}
      >
        <path d={WORDMARK_PATH} fill="currentColor" />
      </svg>
    </Link>
  );
}

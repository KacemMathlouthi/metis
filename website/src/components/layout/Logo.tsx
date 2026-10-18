import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/layout/LogoMark';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** White wordmark for dark backgrounds. */
  inverted?: boolean;
}

export function Logo({ inverted = false }: LogoProps) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Metis home">
      <LogoMark
        className={cn(
          'size-8 motion-safe:transition-transform motion-safe:group-hover:-rotate-6',
          inverted
            ? 'shadow-[2px_2px_0px_0px_var(--color-accent)]'
            : 'shadow-[2px_2px_0px_0px_#000]'
        )}
      />
      <span
        className={cn(
          'font-display text-2xl font-black tracking-tighter',
          inverted ? 'text-white' : 'text-ink'
        )}
      >
        METIS
      </span>
    </Link>
  );
}

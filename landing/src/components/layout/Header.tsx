import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Logo } from '@/components/layout/Logo';
import { MobileNav } from '@/components/layout/MobileNav';
import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import { NAV_LINKS, REPO_URL } from '@/site';

/**
 * Compact sticky header (adapted from @efferd/header-1): transparent over the page top,
 * then a solid bar with a hard bottom border once the visitor scrolls.
 */
export function Header() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b-2 transition-colors',
        scrolled ? 'border-ink bg-surface/90 backdrop-blur-sm' : 'border-transparent'
      )}
    >
      <nav className="site-container flex h-14 items-center justify-between gap-6">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="decoration-accent px-3 py-2 text-sm font-medium decoration-2 underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href={REPO_URL} variant="outline" size="sm">
            <Github /> GitHub
          </ButtonLink>
          <ButtonLink href="/docs/quickstart" size="sm">
            Self-host
          </ButtonLink>
        </div>

        <MobileNav />
      </nav>
    </header>
  );
}

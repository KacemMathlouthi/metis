import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Github, Menu, X } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';
import { REPO_URL } from '@/site';

const NAV_LINKS = [
  { to: '/#features', label: 'FEATURES' },
  { to: '/#how-it-works', label: 'HOW IT WORKS' },
  { to: '/docs', label: 'DOCS' },
  { to: '/docs/quickstart', label: 'SELF-HOST' },
] as const;

const linkClasses = 'font-bold decoration-4 underline-offset-4 hover:underline';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b-4 border-black bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:p-4">
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) =>
            link.to.includes('#') ? (
              <Link key={link.to} to={link.to} className={linkClasses}>
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  cn(linkClasses, isActive && 'underline decoration-[var(--metis-orange)]')
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <ButtonLink href={REPO_URL} variant="dark" className="hidden sm:inline-flex">
            <Github /> GITHUB
          </ButtonLink>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000] md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t-4 border-black bg-white px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={linkClasses} onClick={closeMenu}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(linkClasses, 'inline-flex items-center gap-2')}
              >
                <Github className="h-4 w-4" /> GITHUB
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

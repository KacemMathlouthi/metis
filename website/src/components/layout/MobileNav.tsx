import { useEffect, useState } from 'react';
import { Github, MenuIcon, XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Portal, PortalBackdrop } from '@/components/portal';
import { NAV_LINKS, REPO_URL } from '@/site';

/** Full-screen menu below the header for small screens (adapted from @efferd/header-1). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="border-ink flex size-9 items-center justify-center border-2 shadow-[3px_3px_0px_0px_#000]"
      >
        {open ? <XIcon className="size-4.5" /> : <MenuIcon className="size-4.5" />}
      </button>

      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <div className="site-container flex flex-col gap-8 py-8">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display block py-2 text-2xl font-black uppercase"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <ButtonLink href="/docs/quickstart">Self-host Metis</ButtonLink>
              <ButtonLink href={REPO_URL} variant="outline">
                <Github /> GitHub
              </ButtonLink>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

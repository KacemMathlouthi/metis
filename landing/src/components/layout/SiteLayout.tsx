import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { findPage } from '@/site';

/**
 * Keeps the document title in sync on client-side navigation and restores scroll position:
 * jump to the anchored element when the URL has a hash, otherwise to the top of the page.
 * Prerendered HTML already carries the correct <head> for the first load.
 */
function useRouteEffects() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = findPage(pathname).title;
  }, [pathname]);

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
}

export function SiteLayout() {
  useRouteEffects();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[60] border-2 border-black bg-white px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOC_PAGES, REPO_URL } from '@/site';

function DocsNav() {
  return (
    <nav aria-label="Documentation">
      <p className="mb-3 text-xs font-black tracking-widest text-black/60 uppercase">
        Self-hosting
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {DOC_PAGES.map((page) => (
          <li key={page.path} className="shrink-0">
            <NavLink
              to={page.path}
              end
              className={({ isActive }) =>
                cn(
                  'block border-2 border-black px-3 py-2 text-sm font-bold transition-all',
                  isActive
                    ? 'bg-[var(--metis-orange)] text-white shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-white hover:translate-x-0.5 hover:bg-[var(--metis-pastel-2)]'
                )
              }
            >
              {page.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function PrevNext({ currentIndex }: { currentIndex: number }) {
  const previous = currentIndex > 0 ? DOC_PAGES[currentIndex - 1] : undefined;
  const next = currentIndex < DOC_PAGES.length - 1 ? DOC_PAGES[currentIndex + 1] : undefined;
  const cardClasses =
    'flex flex-1 flex-col gap-1 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none';

  return (
    <div className="mt-16 flex flex-col gap-4 sm:flex-row">
      {previous ? (
        <Link to={previous.path} className={cardClasses}>
          <span className="flex items-center gap-1 text-xs font-black text-black/60 uppercase">
            <ArrowLeft className="h-4 w-4" /> Previous
          </span>
          <span className="font-display text-lg font-black">{previous.label}</span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
      {next && (
        <Link to={next.path} className={cn(cardClasses, 'sm:items-end sm:text-right')}>
          <span className="flex items-center gap-1 text-xs font-black text-black/60 uppercase">
            Next <ArrowRight className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-black">{next.label}</span>
        </Link>
      )}
    </div>
  );
}

export function DocsLayout() {
  const { pathname } = useLocation();
  const currentIndex = DOC_PAGES.findIndex((page) => page.path === pathname.replace(/\/+$/, ''));

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-16">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <DocsNav />
      </aside>

      <article className="min-w-0 text-base md:text-[1.0625rem]">
        <Outlet />

        <div className="mt-16 border-t-4 border-black pt-6">
          <a
            href={`${REPO_URL}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
          >
            <Pencil className="h-4 w-4" /> Something unclear or out of date? Open an issue.
          </a>
        </div>

        {currentIndex >= 0 && <PrevNext currentIndex={currentIndex} />}
      </article>
    </div>
  );
}

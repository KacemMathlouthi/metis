import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOC_PAGES, REPO_URL } from '@/site';

function DocsNav() {
  return (
    <nav aria-label="Documentation">
      <p className="type-label text-ink/60 mb-3">Self-hosting</p>
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {DOC_PAGES.map((page) => (
          <li key={page.path} className="shrink-0">
            <NavLink
              to={page.path}
              end
              className={({ isActive }) =>
                cn(
                  'block border-2 border-black px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent shadow-[3px_3px_0px_0px_#000]'
                    : 'hover:bg-surface-alt hover:translate-x-0.5'
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
    'flex flex-1 flex-col gap-1 border-4 border-ink p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none';

  return (
    <div className="mt-16 flex flex-col gap-4 sm:flex-row">
      {previous ? (
        <Link to={previous.path} className={cardClasses}>
          <span className="type-label text-ink/60 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Previous
          </span>
          <span className="type-heading-20">{previous.label}</span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
      {next && (
        <Link to={next.path} className={cn(cardClasses, 'sm:items-end sm:text-right')}>
          <span className="type-label text-ink/60 flex items-center gap-1">
            Next <ArrowRight className="h-4 w-4" />
          </span>
          <span className="type-heading-20">{next.label}</span>
        </Link>
      )}
    </div>
  );
}

export function DocsLayout() {
  const { pathname } = useLocation();
  const currentIndex = DOC_PAGES.findIndex((page) => page.path === pathname.replace(/\/+$/, ''));

  return (
    <div className="site-container grid grid-cols-[minmax(0,1fr)] gap-10 py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:py-16">
      <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <DocsNav />
      </aside>

      <article className="min-w-0 text-base md:text-[1.0625rem]">
        <Outlet />

        <div className="mt-16 border-t-4 border-black pt-6">
          <a
            href={`${REPO_URL}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <Pencil className="h-4 w-4" /> Something unclear or out of date? Open an issue.
          </a>
        </div>

        {currentIndex >= 0 && <PrevNext currentIndex={currentIndex} />}
      </article>
    </div>
  );
}

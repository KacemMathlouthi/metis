import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import { AuroraFooter } from '@/components/aurora-footer';
import { Logo } from '@/components/layout/Logo';
import { isExternalHref } from '@/lib/utils';
import { AUTHOR_GITHUB_URL, AUTHOR_LINKEDIN_URL, REPO_BLOB_URL, REPO_URL } from '@/site';

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/docs/architecture', label: 'Architecture' },
    ],
  },
  {
    title: 'Self-host',
    links: [
      { href: '/docs/quickstart', label: 'Quickstart' },
      { href: '/docs/github-app', label: 'GitHub App' },
      { href: '/docs/configuration', label: 'Configuration' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: REPO_URL, label: 'Source code' },
      { href: `${REPO_URL}/issues`, label: 'Issues' },
      { href: `${REPO_BLOB_URL}/CONTRIBUTING.md`, label: 'Contributing' },
      { href: `${REPO_BLOB_URL}/LICENSE`, label: 'MIT License' },
    ],
  },
] as const;

const SOCIAL_LINK_CLASSES =
  'inline-flex items-center gap-2 border-2 border-white bg-black px-4 py-2 text-xs font-semibold text-white transition-all hover:translate-x-0.5 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-none';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black pt-20 text-white">
      <div className="site-container relative z-10 grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-6">
          <Logo inverted />
          <p className="text-sm font-semibold">
            Made by{' '}
            <span className="bg-surface-alt text-ink inline-block -rotate-2 border-2 border-white px-2 py-0.5 shadow-[2px_2px_0px_0px_var(--color-accent)]">
              Kacem Mathlouthi
            </span>{' '}
            with 💗
          </p>
          <p className="max-w-xs text-sm text-white/70">
            Metis is free and open source under the MIT license. Run it on your own infrastructure.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={AUTHOR_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SOCIAL_LINK_CLASSES} shadow-[2px_2px_0px_0px_var(--color-accent)]`}
            >
              <Github className="h-4 w-4" /> GITHUB
            </a>
            <a
              href={AUTHOR_LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SOCIAL_LINK_CLASSES} shadow-[2px_2px_0px_0px_var(--color-accent)]`}
            >
              <Linkedin className="h-4 w-4" /> LINKEDIN
            </a>
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="type-label text-accent mb-4">{column.title}</h2>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  {isExternalHref(link.href) ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none relative mt-16 flex w-full justify-center overflow-hidden select-none"
      >
        <span
          className="font-display translate-y-4 bg-clip-text pb-4 text-[9rem] leading-[0.82] text-transparent opacity-90 sm:text-[13rem] md:text-[18rem] lg:text-[24rem] xl:text-[30rem]"
          style={{
            backgroundImage:
              'linear-gradient(180deg, var(--metis-yellow) 0%, var(--metis-orange-light) 28%, var(--metis-orange) 52%, var(--metis-orange-dark) 72%, var(--metis-red) 100%)',
            letterSpacing: '0.02em',
          }}
        >
          METIS
        </span>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <AuroraFooter />
    </footer>
  );
}

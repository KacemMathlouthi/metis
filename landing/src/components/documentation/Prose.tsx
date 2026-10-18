import type React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, Link as LinkIcon } from 'lucide-react';
import { DocCover } from '@/components/documentation/DocCover';
import { cn, isExternalHref } from '@/lib/utils';

interface ChildrenProps {
  children: React.ReactNode;
}

export function DocTitle({ eyebrow, children }: ChildrenProps & { eyebrow: string }) {
  return (
    <>
      <header className="mb-10 border-b-4 border-black pb-8">
        <p className="type-label bg-highlight border-ink mb-4 inline-block border-2 px-2 py-0.5">
          {eyebrow}
        </p>
        <h1 className="type-title">{children}</h1>
      </header>
      <DocCover />
    </>
  );
}

export function Lead({ children }: ChildrenProps) {
  return <p className="type-lede text-ink/80 mb-8 max-w-[65ch]">{children}</p>;
}

/** Section heading with a hover anchor link so sections can be shared. */
export function H2({ id, children }: ChildrenProps & { id: string }) {
  return (
    <h2 id={id} className="type-heading-32 group mt-14 mb-4 flex items-center gap-2">
      {children}
      <a
        href={`#${id}`}
        className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label="Link to this section"
      >
        <LinkIcon className="h-5 w-5" />
      </a>
    </h2>
  );
}

export function H3({ id, children }: ChildrenProps & { id?: string }) {
  return (
    <h3 id={id} className="type-heading-20 mt-8 mb-3">
      {children}
    </h3>
  );
}

export function P({ children }: ChildrenProps) {
  return <p className="type-body my-4 max-w-[68ch]">{children}</p>;
}

export function UL({ children }: ChildrenProps) {
  return (
    <ul className="my-4 list-disc space-y-2 pl-6 marker:text-[var(--metis-orange)]">{children}</ul>
  );
}

export function OL({ children }: ChildrenProps) {
  return <ol className="my-4 list-decimal space-y-2 pl-6 marker:font-medium">{children}</ol>;
}

export function Code({ children }: ChildrenProps) {
  return (
    <code className="border border-black/20 bg-[var(--metis-pastel-2)] px-1.5 py-0.5 font-mono text-[0.9em] break-words">
      {children}
    </code>
  );
}

export function A({ href, children }: ChildrenProps & { href: string }) {
  const classes =
    'font-semibold underline decoration-[var(--metis-orange)] decoration-2 underline-offset-2 hover:decoration-black';
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

const CALLOUT_STYLES = {
  info: { icon: Info, classes: 'bg-[var(--metis-pastel-1)]', label: 'Note' },
  warning: { icon: AlertTriangle, classes: 'bg-[var(--metis-pastel-red)]', label: 'Heads up' },
} as const;

export function Callout({
  type = 'info',
  children,
}: ChildrenProps & { type?: keyof typeof CALLOUT_STYLES }) {
  const { icon: Icon, classes, label } = CALLOUT_STYLES[type];
  return (
    <aside
      className={cn(
        'my-6 flex gap-3 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]',
        classes
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        <span className="sr-only">{label}: </span>
        {children}
      </div>
    </aside>
  );
}

/** Numbered, visually connected steps for multi-stage procedures. */
export function Steps({ children }: ChildrenProps) {
  return <ol className="doc-steps my-8 space-y-10 border-l-4 border-black pl-8">{children}</ol>;
}

export function Step({ title, id, children }: ChildrenProps & { title: string; id?: string }) {
  return (
    <li className="doc-step relative">
      <span
        aria-hidden="true"
        className="font-display doc-step-badge absolute top-0 -left-[3.15rem] flex h-9 w-9 items-center justify-center border-4 border-black bg-[var(--metis-yellow)] text-lg"
      />
      <h3 id={id} className="type-heading-20 mb-2">
        {title}
      </h3>
      <div className="[&>*:first-child]:mt-0">{children}</div>
    </li>
  );
}

export function Table({
  head,
  rows,
}: {
  head: readonly string[];
  rows: readonly React.ReactNode[][];
}) {
  return (
    <div className="my-6 overflow-x-auto border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-black text-white">
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col" className="type-label px-4 py-3">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t-2 border-black/10 align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

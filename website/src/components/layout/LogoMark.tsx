import type React from 'react';

/**
 * The Metis mark: orange tile, black frame, and a heavy M whose valley is an asymmetric
 * check mark. Drawn on a 32-unit grid; the same geometry generates the favicons, README
 * logos, and social preview, so keep them in sync if it changes.
 */
const GLYPH_POINTS =
  '6,24 6,8 11,8 14.2,14.6 21,8 26,8 26,24 21,24 21,12.6 13.22,20.15 11,15.56 11,24';

export function LogoMark(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...props}>
      <rect width="32" height="32" fill="var(--color-ink)" />
      <rect x="2" y="2" width="28" height="28" fill="var(--color-accent)" />
      <polygon points={GLYPH_POINTS} fill="var(--color-ink)" />
    </svg>
  );
}

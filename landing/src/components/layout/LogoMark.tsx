import type React from 'react';
import { useId } from 'react';

/**
 * The Metis mark: yellow-to-red gradient tile, black frame, and a white Space Grotesk Bold "M"
 * drawn as an outline on a 32-unit grid. landing/scripts/build_brand_assets.py generates the
 * favicons, README logos, and social preview from the same geometry; keep them in sync.
 */
const GLYPH_POINTS =
  '9.25,22.3 9.25,9.7 13.66,9.7 15.84,20.68 16.16,20.68 18.34,9.7 22.75,9.7 22.75,22.3 20.45,22.3 20.45,11.45 20.12,11.45 17.96,22.3 14.04,22.3 11.88,11.45 11.55,11.45 11.55,22.3';

export function LogoMark(props: React.ComponentProps<'svg'>) {
  // Several marks can share a page (header and footer), so each needs its own gradient id.
  const gradientId = `metis-tile-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--metis-yellow)" />
          <stop offset="0.55" stopColor="var(--metis-orange-light)" />
          <stop offset="1" stopColor="var(--metis-red)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="var(--color-ink)" />
      <rect x="2" y="2" width="28" height="28" fill={`url(#${gradientId})`} />
      <polygon points={GLYPH_POINTS} fill="#fff" />
    </svg>
  );
}

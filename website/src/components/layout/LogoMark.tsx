import type React from 'react';

/**
 * The Metis mark: orange tile, black frame, and a black Space Grotesk Bold "M", drawn as an
 * outline on a 32-unit grid. website/scripts/build_brand_assets.py generates the favicons,
 * README logos, and social preview from the same outline; keep them in sync if it changes.
 */
const GLYPH_POINTS =
  '9.25,22.3 9.25,9.7 13.66,9.7 15.84,20.68 16.16,20.68 18.34,9.7 22.75,9.7 22.75,22.3 20.45,22.3 20.45,11.45 20.12,11.45 17.96,22.3 14.04,22.3 11.88,11.45 11.55,11.45 11.55,22.3';

export function LogoMark(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...props}>
      <rect width="32" height="32" fill="var(--color-ink)" />
      <rect x="2" y="2" width="28" height="28" fill="var(--color-accent)" />
      <polygon points={GLYPH_POINTS} fill="var(--color-ink)" />
    </svg>
  );
}

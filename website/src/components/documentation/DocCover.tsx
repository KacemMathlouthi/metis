import { useLocation } from 'react-router-dom';
import { DOC_PAGES } from '@/site';

/**
 * Cover images, picked up from src/assets/doc-covers/<slug>-{800,1600}.webp
 * (generate them with scripts/optimize_doc_cover.py).
 */
const COVER_IMAGES = import.meta.glob<string>('/src/assets/doc-covers/*.webp', {
  eager: true,
  import: 'default',
});

/** The current docs page's cover banner; renders nothing until its images exist. */
export function DocCover() {
  const { pathname } = useLocation();
  const page = DOC_PAGES.find((docPage) => docPage.path === pathname.replace(/\/+$/, ''));
  const small = page && COVER_IMAGES[`/src/assets/doc-covers/${page.slug}-800.webp`];
  const large = page && COVER_IMAGES[`/src/assets/doc-covers/${page.slug}-1600.webp`];
  if (!small || !large) return null;

  return (
    <figure className="border-ink mt-8 overflow-hidden border-4 shadow-[6px_6px_0px_0px_#000]">
      <img
        src={large}
        srcSet={`${small} 800w, ${large} 1600w`}
        sizes="(min-width: 1024px) 60rem, 100vw"
        width={1600}
        height={900}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="aspect-[2/1] w-full object-cover"
      />
    </figure>
  );
}

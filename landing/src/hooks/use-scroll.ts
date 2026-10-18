import { useEffect, useState } from 'react';

/**
 * Whether the page has scrolled past `downThreshold` pixels (from @efferd/header-1).
 * Uses hysteresis: once scrolled, it only resets below `upThreshold` (half by default),
 * which prevents flicker around the threshold.
 */
export function useScroll(downThreshold: number, upThreshold?: number): boolean {
  const [scrolled, setScrolled] = useState(false);
  const scrollUpThreshold = upThreshold ?? downThreshold / 2;

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled((previous) => (previous ? y > scrollUpThreshold : y > downThreshold));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [downThreshold, scrollUpThreshold]);

  return scrolled;
}

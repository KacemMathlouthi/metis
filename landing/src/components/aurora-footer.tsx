/**
 * Blurred, gradient "aurora" bars that rise from the bottom of the viewport as the page
 * scrolls into a spacer at the end of the footer. On desktop the page eases back up once
 * scrolling stops, so the aurora reads as an over-scroll flourish rather than more content.
 */
import { useCallback, useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export interface AuroraFooterProps {
  /** Eight gradient stops, from the base of the bars upward (the last one fades out). */
  colors?: readonly string[];
  autoScrollBack?: boolean;
  desktopBreakpoint?: number;
  scrollContainer?: RefObject<HTMLElement | null>;
  children?: ReactNode;
}

const DEFAULT_COLORS = [
  '#000000',
  '#E10500',
  '#FA500F',
  '#FF8205',
  '#FFAF00',
  '#FFD800',
  '#FFD800',
  '#FFD800',
] as const;

const BAR_PATHS = [
  'M1219 584H1393V184H1219V584Z',
  'M1045 584H1219V104H1045V584Z',
  'M348 584H174L174 184H348L348 584Z',
  'M522 584H348L348 104H522L522 584Z',
  'M697 584H522L522 54H697L697 584Z',
  'M870 584H1045V54H870V584Z',
  'M870 584H697L697 0H870L870 584Z',
  'M174 585H0.000183105L-3.75875e-06 295H174L174 585Z',
  'M1393 584H1567V294H1393V584Z',
];

const GRADIENT_COORDS = [
  { x1: 1306, y1: 584, x2: 1306, y2: 184 },
  { x1: 1132, y1: 584, x2: 1132, y2: 104 },
  { x1: 261, y1: 584, x2: 261, y2: 184 },
  { x1: 435, y1: 584, x2: 435, y2: 104 },
  { x1: 609.501, y1: 584, x2: 609.501, y2: 54 },
  { x1: 957.5, y1: 584, x2: 957.5, y2: 54 },
  { x1: 783.501, y1: 584, x2: 783.501, y2: 0 },
  { x1: 87.0003, y1: 585, x2: 87.0003, y2: 295 },
  { x1: 1480, y1: 584, x2: 1480, y2: 294 },
];

const STOP_OFFSETS = [0, 0.182709, 0.283673, 0.413484, 0.586565, 0.682722, 0.802892, 1];

export function AuroraFooter({
  colors = DEFAULT_COLORS,
  autoScrollBack = true,
  desktopBreakpoint = 1000,
  scrollContainer,
  children,
}: AuroraFooterProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);
  const isDesktopRef = useRef(false);
  const reactId = useId().replace(/:/g, '');
  const blurId = `aurora-blur-${reactId}`;
  const clipId = `aurora-clip-${reactId}`;
  const gradId = (i: number) => `aurora-grad-${reactId}-${i}`;
  const contained = !!scrollContainer;

  const stops = Array.from({ length: 8 }, (_, i) => colors[i] ?? DEFAULT_COLORS[i]);

  const { scrollYProgress } = useScroll({
    container: scrollContainer,
    target: spacerRef,
    offset: ['start end', 'end end'],
  });
  const scaleY = useTransform(scrollYProgress, [0, 0.995], [0, 1]);

  const scrollBackUp = useCallback(() => {
    if (inFlightRef.current) return;
    if (!isDesktopRef.current) return;
    if (scrollYProgress.get() <= 0.05) return;
    const spacer = spacerRef.current;
    if (!spacer) return;
    inFlightRef.current = true;

    if (contained && scrollContainer?.current) {
      const container = scrollContainer.current;
      const containerRect = container.getBoundingClientRect();
      const spacerRect = spacer.getBoundingClientRect();
      const targetY = container.scrollTop + (spacerRect.top - containerRect.bottom) - 50;
      container.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    } else {
      const targetY = window.scrollY + spacer.getBoundingClientRect().top - window.innerHeight - 50;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }

    setTimeout(() => {
      inFlightRef.current = false;
    }, 1000);
  }, [scrollYProgress, contained, scrollContainer]);

  // Auto scroll-back only on desktop, and never for visitors who asked for reduced motion.
  useEffect(() => {
    if (!autoScrollBack) {
      isDesktopRef.current = false;
      return;
    }
    const desktop = window.matchMedia(`(min-width: ${desktopBreakpoint}px)`);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      isDesktopRef.current = desktop.matches && !reducedMotion.matches;
    };
    update();
    desktop.addEventListener('change', update);
    reducedMotion.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      reducedMotion.removeEventListener('change', update);
    };
  }, [autoScrollBack, desktopBreakpoint]);

  useEffect(() => {
    if (!autoScrollBack) return;
    let prevValue = 0;
    let prevTime = Date.now();
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let slowSettled = false;
    let sampleCount = 0;

    const unsubscribe = scrollYProgress.on('change', (value) => {
      const now = Date.now();
      const dt = now - prevTime;
      const dv = Math.abs(value - prevValue);
      const velocity = dt > 0 ? (dv / dt) * 1000 : 0;

      sampleCount += 1;
      if (sampleCount > 10) {
        slowSettled = velocity < 5 && dt < 50;
        sampleCount = 0;
      }

      if (inFlightRef.current && velocity > 0.1) {
        inFlightRef.current = false;
      }

      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(
        () => {
          if (scrollYProgress.get() > 0.05 && !inFlightRef.current) {
            scrollBackUp();
          }
        },
        slowSettled ? 150 : 350
      );

      prevValue = value;
      prevTime = now;
    });

    return () => {
      unsubscribe();
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [autoScrollBack, scrollYProgress, scrollBackUp]);

  useEffect(() => {
    if (!autoScrollBack) return;
    const target: EventTarget | null = contained ? (scrollContainer?.current ?? null) : window;
    if (!target) return;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (inFlightRef.current) inFlightRef.current = false;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (scrollYProgress.get() > 0.05 && !inFlightRef.current) {
          scrollBackUp();
        }
      }, 400);
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', onScroll);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [autoScrollBack, scrollYProgress, scrollBackUp, contained, scrollContainer]);

  const overlayPositionClass = contained ? 'absolute' : 'fixed';
  const spacerClass = contained ? 'h-full' : 'h-[175px] sm:mt-[50px] sm:h-[300px] lg:h-[65vh]';
  const overlayHeightClass = contained ? 'h-full' : 'h-[175px] -mb-[2vh] sm:h-[300px] lg:h-[65vh]';

  return (
    <div className={`relative ${contained ? 'h-full' : ''}`}>
      <div ref={spacerRef} className={spacerClass} />

      <motion.div
        aria-hidden
        style={{ scaleY }}
        className={`pointer-events-none ${overlayPositionClass} right-0 bottom-0 left-0 z-[2] flex origin-bottom items-end ${overlayHeightClass}`}
      >
        <svg
          viewBox="0 0 1567 584"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <g clipPath={`url(#${clipId})`} filter={`url(#${blurId})`}>
            {BAR_PATHS.map((d, i) => (
              <path key={i} d={d} fill={`url(#${gradId(i)})`} />
            ))}
          </g>
          <defs>
            <filter
              id={blurId}
              x="-30"
              y="-30"
              width="1627"
              height="644"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur" />
            </filter>
            {GRADIENT_COORDS.map((c, i) => (
              <linearGradient
                key={i}
                id={gradId(i)}
                x1={c.x1}
                y1={c.y1}
                x2={c.x2}
                y2={c.y2}
                gradientUnits="userSpaceOnUse"
              >
                {stops.map((color, idx) => (
                  <stop
                    key={idx}
                    offset={STOP_OFFSETS[idx]}
                    stopColor={color}
                    stopOpacity={idx === stops.length - 1 ? 0 : 1}
                  />
                ))}
              </linearGradient>
            ))}
            <clipPath id={clipId}>
              <rect width="1567" height="584" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </motion.div>

      {children && (
        <div
          className={`pointer-events-none ${overlayPositionClass} right-0 bottom-0 left-0 z-[3] [&>*]:pointer-events-auto`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

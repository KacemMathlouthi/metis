/**
 * Bento card with scrolling rows of tags and a draggable magnifying lens that reveals
 * an emphasized copy of the tags underneath it.
 * Adapted from @uselayouts/magnified-bento: configurable rows, lucide icons, and the
 * Metis design system.
 */
import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BentoTag {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MagnifiedBentoProps {
  rows: readonly (readonly BentoTag[])[];
  title: string;
  description: string;
  className?: string;
}

const LENS_SIZE = 92;
/** Radius of the lens glass; must match the clip/mask circles below. */
const GLASS_RADIUS = 30;
const ROW_LOOP_SECONDS = 25;

function rowAnimation(rowIndex: number) {
  return {
    x: rowIndex % 2 === 0 ? ['0%', '-33.333%'] : ['-33.333%', '0%'],
  };
}

const ROW_TRANSITION = { duration: ROW_LOOP_SECONDS, ease: 'linear', repeat: Infinity } as const;

export function MagnifiedBento({ rows, title, description, className }: MagnifiedBentoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensX = useMotionValue(0);
  const lensY = useMotionValue(0);

  // The glass sits slightly up-left of the lens SVG's center (the handle points down-right).
  const clipPath = useMotionTemplate`circle(${GLASS_RADIUS}px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px))`;
  const inverseMask = useMotionTemplate`radial-gradient(circle ${GLASS_RADIUS}px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px), transparent 100%, black 100%)`;

  return (
    <div
      className={cn(
        'border-ink bg-surface flex h-full flex-col border-4 shadow-[6px_6px_0px_0px_#000]',
        className
      )}
    >
      <div
        ref={containerRef}
        aria-hidden="true"
        className="border-ink bg-surface relative h-[200px] w-full overflow-hidden border-b-4 sm:h-[240px]"
      >
        <motion.div
          style={{ WebkitMaskImage: inverseMask, maskImage: inverseMask }}
          className="flex h-full w-full flex-col justify-center gap-4"
        >
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex w-max gap-4"
              animate={rowAnimation(rowIndex)}
              transition={ROW_TRANSITION}
            >
              {[...row, ...row, ...row].map((tag, tagIndex) => (
                <div
                  key={`${tag.id}-${tagIndex}`}
                  className="border-ink/30 text-ink/60 flex w-fit items-center gap-2 border-2 px-3 py-1.5 font-mono text-xs whitespace-nowrap"
                >
                  <tag.icon className="h-3.5 w-3.5" />
                  <span>{tag.label}</span>
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center gap-4 select-none"
          style={{ clipPath }}
        >
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex w-max gap-4"
              animate={rowAnimation(rowIndex)}
              transition={ROW_TRANSITION}
            >
              {[...row, ...row, ...row].map((tag, tagIndex) => (
                <div
                  key={`${tag.id}-${tagIndex}`}
                  className="border-ink bg-accent ml-6 flex w-fit scale-125 items-center gap-2 border-2 px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap"
                >
                  <tag.icon className="h-3.5 w-3.5" />
                  <span>{tag.label}</span>
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 cursor-grab drop-shadow-[4px_4px_0_rgba(0,0,0,0.35)] active:cursor-grabbing"
          drag
          dragMomentum={false}
          dragConstraints={containerRef}
          style={{ x: lensX, y: lensY }}
        >
          <MagnifyingLens size={LENS_SIZE} />
        </motion.div>

        <div className="from-surface pointer-events-none absolute inset-y-0 left-0 z-20 w-1/5 bg-gradient-to-r to-transparent" />
        <div className="from-surface pointer-events-none absolute inset-y-0 right-0 z-20 w-1/5 bg-gradient-to-l to-transparent" />
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="type-heading-24">{title}</h3>
        <p className="type-body text-ink/70 mt-2 text-pretty">{description}</p>
        <ul className="sr-only">
          {rows.flat().map((tag) => (
            <li key={tag.id}>{tag.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MagnifyingLens({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <path
        d="M365.424 335.392L342.24 312.192L311.68 342.736L334.88 365.936L365.424 335.392Z"
        fill="#000"
      />
      <path
        d="M332 332C260 404 142.4 404 69.6001 332C-2.3999 260 -2.3999 142.4 69.6001 69.6C141.6 -3.20003 259.2 -2.40002 332 69.6C404.8 142.4 404.8 260 332 332ZM315.2 87.2C252 24 150.4 24 88.0001 87.2C24.8001 150.4 24.8001 252 88.0001 314.4C151.2 377.6 252.8 377.6 315.2 314.4C377.6 252 377.6 150.4 315.2 87.2Z"
        fill="#000"
      />
      <path
        d="M484.104 428.784L373.8 318.472L318.36 373.912L428.672 484.216L484.104 428.784Z"
        fill="var(--color-ink)"
      />
      <path
        d="M471.664 441.224L361.344 330.928L330.8 361.48L441.12 471.76L471.664 441.224Z"
        fill="var(--color-accent)"
      />
      <path
        d="M495.2 423.2C504 432 432.8 504 423.2 495.2L417.6 489.6C408.8 480.8 480 408.8 489.6 417.6L495.2 423.2Z"
        fill="#000"
      />
    </svg>
  );
}

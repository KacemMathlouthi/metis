/**
 * Scroll-driven deck of cards that stack on top of each other as the page scrolls.
 * Adapted from @uselayouts/scroll-stack-deck: restyled for the Metis design system,
 * cards take an arbitrary visual instead of an image, and native scrolling is kept
 * (no smooth-scroll library hijacking the page).
 */
import type React from 'react';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

export interface DeckItem {
  id: string;
  tabTitle: string;
  title: string;
  description: string;
  /** Illustration shown on the right of the card (below the text on small screens). */
  visual: React.ReactNode;
  /** Any CSS color, including `var(--token)`. */
  color: string;
}

/** Vertical distance (px) between a card and the one stacked directly above it. */
const STACK_OFFSET = 26;
/** How much each card shrinks per card stacked in front of it. */
const STACK_SCALE_STEP = 0.035;
/** Card starts this far below its resting place before it slides in. */
const ENTRY_OFFSET = 900;
/** Scroll distance allotted to each card, in viewport heights. */
const SCROLL_PER_CARD_VH = 85;
/** Height of the sticky site header plus breathing room, in px. */
const STAGE_TOP_INSET = 76;

interface Keyframes {
  steps: number[];
  y: number[];
  scale: number[];
}

/**
 * Card `index` waits off-screen until the previous card has settled, slides into place,
 * then gets pushed up and scaled down as later cards stack in front of it.
 */
function buildCardKeyframes(index: number, totalCards: number): Keyframes {
  const transitions = Math.max(totalCards - 1, 1);
  const steps: number[] = [];
  const y: number[] = [];
  const scale: number[] = [];

  for (let step = 0; step <= transitions; step++) {
    const depth = step - index;
    steps.push(step / transitions);
    y.push(depth < 0 ? ENTRY_OFFSET : -depth * STACK_OFFSET);
    scale.push(depth <= 0 ? 1 : 1 - depth * STACK_SCALE_STEP);
  }

  if (index === 0) {
    return { steps, y, scale };
  }

  // Hold the card off-screen until its entry window starts, then animate it in.
  const entryStart = (index - 1) / transitions;
  const keyframes: Keyframes = { steps: [], y: [], scale: [] };
  steps.forEach((step) => {
    if (step < entryStart) {
      keyframes.steps.push(step);
      keyframes.y.push(ENTRY_OFFSET);
      keyframes.scale.push(1);
    }
  });
  keyframes.steps.push(entryStart);
  keyframes.y.push(ENTRY_OFFSET);
  keyframes.scale.push(1);
  steps.forEach((step, i) => {
    if (step >= index / transitions) {
      keyframes.steps.push(step);
      keyframes.y.push(y[i]);
      keyframes.scale.push(scale[i]);
    }
  });
  return keyframes;
}

interface DeckCardProps {
  item: DeckItem;
  index: number;
  totalCards: number;
  progress: MotionValue<number>;
}

function DeckCard({ item, index, totalCards, progress }: DeckCardProps) {
  const keyframes = buildCardKeyframes(index, totalCards);
  const y = useTransform(progress, keyframes.steps, keyframes.y);
  const scale = useTransform(progress, keyframes.steps, keyframes.scale);

  return (
    <motion.article
      style={{ y, scale, zIndex: 10 + index, transformOrigin: 'center top' }}
      className="flex w-full flex-col will-change-transform [grid-area:1/1]"
      aria-labelledby={`deck-card-${item.id}`}
    >
      <div
        style={{
          backgroundColor: item.color,
          // Stagger tabs across the card width, like index dividers, so stacked labels stay readable.
          marginLeft: `calc((100% - var(--deck-tab-width)) * ${totalCards > 1 ? index / (totalCards - 1) : 0})`,
        }}
        className="type-label relative z-10 -mb-1 flex h-12 w-[var(--deck-tab-width)] shrink-0 items-center border-4 border-b-0 border-black px-3 font-mono whitespace-nowrap [--deck-tab-width:10.5rem] sm:h-14 sm:px-5 sm:[--deck-tab-width:14rem]"
      >
        {item.tabTitle}
      </div>
      <div
        style={{ backgroundColor: item.color }}
        className="grid flex-1 grid-cols-1 content-center items-center gap-4 border-4 border-black p-4 pt-8 shadow-[8px_8px_0px_0px_#000] sm:p-8 md:min-h-[28rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10"
      >
        <div className="flex flex-col items-start gap-4">
          <h3 id={`deck-card-${item.id}`} className="type-heading-32">
            {item.title}
          </h3>
          <p className="type-lede text-ink/75 text-pretty">{item.description}</p>
        </div>
        {/* Hidden on short phone screens so the whole card fits in the sticky stage. */}
        <div aria-hidden="true" className="min-w-0 max-md:[@media(max-height:700px)]:hidden">
          {item.visual}
        </div>
      </div>
    </motion.article>
  );
}

interface ScrollStackDeckProps {
  items: readonly DeckItem[];
  className?: string;
}

export function ScrollStackDeck({ items, className }: ScrollStackDeckProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.15,
    restDelta: 0.0001,
  });

  return (
    <div
      ref={trackRef}
      className={cn('relative w-full', className)}
      style={{ height: `${items.length * SCROLL_PER_CARD_VH}vh` }}
    >
      {/* Sticky stage: leaves room under the navbar for every tab pushed up by the stack. */}
      <div
        className="site-container sticky top-0 flex h-screen items-start justify-center"
        style={{ paddingTop: STAGE_TOP_INSET + (items.length - 1) * STACK_OFFSET }}
      >
        {/* All cards share one grid cell, so every card stretches to the tallest one. */}
        <div className="grid w-full max-w-6xl">
          {items.map((item, index) => (
            <DeckCard
              key={item.id}
              item={item}
              index={index}
              totalCards={items.length}
              progress={progress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

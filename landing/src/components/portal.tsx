import type React from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const subscribeNoop = () => () => {};

/** `true` in the browser, `false` while prerendering (where `document` does not exist). */
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

/**
 * Fixed overlay rendered into <body> that locks page scrolling while mounted
 * (from @efferd/header-1). Renders nothing during prerendering.
 */
function Portal({ className, ...props }: React.ComponentProps<'div'>) {
  const isClient = useIsClient();

  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return createPortal(
    <div className={cn('fixed inset-0 isolate z-40 flex flex-col', className)} {...props} />,
    document.body
  );
}

function PortalBackdrop({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('bg-surface/95 fixed inset-0 -z-1 backdrop-blur-sm', className)}
      {...props}
    />
  );
}

export { Portal, PortalBackdrop };

'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';

import * as React from 'react';

import { cn } from '@/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer border-border bg-secondary-background focus-visible:ring-ring data-[state=checked]:bg-main data-[state=unchecked]:bg-secondary-background inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'border-border pointer-events-none block h-4 w-4 rounded-full border-2 bg-white ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

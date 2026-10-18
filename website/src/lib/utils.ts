import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Absolute http(s) URLs leave the site; everything else is a client-side route. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

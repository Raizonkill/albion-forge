import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge conditional class names, de-duplicating conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a silver amount the way the prototype did: rounded, es-ES grouping. */
export function formatSilver(value: number): string {
  return Math.round(value).toLocaleString('es-ES')
}

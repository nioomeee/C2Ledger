import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with consistent locale to prevent hydration mismatches
 * Always uses 'en-US' locale for consistent server/client rendering
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

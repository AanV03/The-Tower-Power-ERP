import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const headerPrimaryActionClass =
  "bg-[var(--brand-orange)] text-black font-bold shadow-lg shadow-black/10 transition-all hover:bg-[var(--brand-orange)] hover:brightness-110 hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-offset-2";

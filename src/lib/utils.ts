import { clsx, type ClassValue } from "clsx";

/** Tiny className combiner (clsx only — no tailwind-merge dependency). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

"use client";

import { useSyncExternalStore } from "react";

// Media query for reduced motion
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Get current value from media query
function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// SSR fallback - default to false (animations enabled)
function getServerSnapshot(): boolean {
  return false;
}

// Subscribe to media query changes
function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

/**
 * Custom hook to detect if the user prefers reduced motion.
 * Respects the `prefers-reduced-motion: reduce` media query.
 *
 * Use this hook to conditionally disable:
 * - Canvas-based animations (confetti)
 * - JavaScript-driven animations
 * - Complex transitions
 *
 * @returns boolean - true if user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * useEffect(() => {
 *   if (!prefersReducedMotion) {
 *     // Fire confetti
 *     confetti({ particleCount: 100 });
 *   }
 * }, [open, prefersReducedMotion]);
 * ```
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Static check for reduced motion preference.
 * Use in components where hooks can't be used (e.g., event handlers).
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

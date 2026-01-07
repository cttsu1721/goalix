"use client";

import { useState, useEffect } from "react";

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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") return;

    // Create media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes (user might change settings while app is open)
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
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

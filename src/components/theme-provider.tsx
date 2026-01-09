"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * Theme provider for Goalzenix
 *
 * Themes:
 * - "light" (default) - Zen Light: Pure white with sage accents and serif typography
 * - "dark" - Yoru Zen: Deep midnight blue with golden lantern accents
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      themes={["dark", "light"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Theme names for UI display
 */
export const THEME_NAMES = {
  dark: "Yoru Zen",
  light: "Zen Light",
} as const;

/**
 * Theme descriptions for settings page
 */
export const THEME_DESCRIPTIONS = {
  dark: "Deep midnight blue with golden lantern accents. Inspired by Japanese night gardens.",
  light: "Pure white with sage accents. Contemplative, minimalist, maximum whitespace.",
} as const;

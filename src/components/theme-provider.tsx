"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * Theme provider for Goalix
 *
 * Themes:
 * - "dark" (default) - Yoru Zen: Deep midnight blue with golden lantern accents
 * - "light" - Sakura: Cherry blossom pink with warm cream backgrounds
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
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
  light: "Sakura",
} as const;

/**
 * Theme descriptions for settings page
 */
export const THEME_DESCRIPTIONS = {
  dark: "Deep midnight blue with golden lantern accents. Inspired by Japanese night gardens.",
  light: "Soft cherry blossom pink with warm cream backgrounds. Inspired by spring in Kyoto.",
} as const;

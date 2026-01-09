"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const STORAGE_KEY = "goalzenix_view_preference";

type ViewMode = "day" | "week";

interface ViewPreference {
  desktop: ViewMode;
  mobile: ViewMode;
}

const DEFAULT_PREFERENCE: ViewPreference = {
  desktop: "week",
  mobile: "day", // Day view default on mobile (5.5)
};

// Get current mobile state
function getIsMobileSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

// SSR fallback - default to mobile for mobile-first approach
function getServerSnapshot(): boolean {
  return false;
}

// Subscribe to resize events
function subscribeToResize(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

/**
 * Hook for managing mobile vs desktop view preferences
 * Defaults to day view on mobile for reduced cognitive load (5.5)
 */
export function useMobileView() {
  const isMobile = useSyncExternalStore(
    subscribeToResize,
    getIsMobileSnapshot,
    getServerSnapshot
  );

  // isReady is true on client side
  const isReady = typeof window !== "undefined";

  return { isMobile, isReady };
}

// Get view preference from localStorage
function getViewPreference(): ViewPreference {
  if (typeof window === "undefined") return DEFAULT_PREFERENCE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ViewPreference;
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_PREFERENCE;
}

/**
 * Hook for managing view mode (day/week) with mobile-first defaults
 */
export function useViewMode() {
  const { isMobile, isReady } = useMobileView();

  // Initialize from localStorage using lazy initial state
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const pref = getViewPreference();
    // On SSR, default to day view
    if (typeof window === "undefined") return "day";
    return window.innerWidth < MOBILE_BREAKPOINT ? pref.mobile : pref.desktop;
  });

  const [hasUserPreference, setHasUserPreference] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) !== null;
  });

  // Update view mode and save preference
  const setView = useCallback(
    (mode: ViewMode) => {
      setViewModeState(mode);
      setHasUserPreference(true);

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const pref: ViewPreference = stored
          ? JSON.parse(stored)
          : { ...DEFAULT_PREFERENCE };

        if (isMobile) {
          pref.mobile = mode;
        } else {
          pref.desktop = mode;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
      } catch {
        // Ignore localStorage errors
      }
    },
    [isMobile]
  );

  // Toggle between day and week
  const toggleView = useCallback(() => {
    setView(viewMode === "day" ? "week" : "day");
  }, [viewMode, setView]);

  return {
    viewMode,
    setViewMode: setView,
    toggleView,
    isMobile,
    isReady,
    hasUserPreference,
  };
}

/**
 * Hook for swipe navigation between days
 */
export function useDaySwipeNavigation(
  currentDate: Date,
  onDateChange: (date: Date) => void
) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = next day
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      onDateChange(nextDay);
    }

    if (isRightSwipe) {
      // Swipe right = previous day
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      onDateChange(prevDay);
    }
  }, [touchStart, touchEnd, currentDate, onDateChange]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

/**
 * View mode toggle component helper type
 */
export interface ViewToggleProps {
  viewMode: ViewMode;
  onToggle: () => void;
  isMobile: boolean;
}

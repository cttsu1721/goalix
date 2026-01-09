"use client";

import { useState, useEffect, useCallback } from "react";

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

/**
 * Hook for managing mobile vs desktop view preferences
 * Defaults to day view on mobile for reduced cognitive load (5.5)
 */
export function useMobileView() {
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    setIsReady(true);

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return { isMobile, isReady };
}

/**
 * Hook for managing view mode (day/week) with mobile-first defaults
 */
export function useViewMode() {
  const { isMobile, isReady } = useMobileView();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [hasUserPreference, setHasUserPreference] = useState(false);

  // Load preference from localStorage
  useEffect(() => {
    if (!isReady) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const pref = JSON.parse(stored) as ViewPreference;
        setViewMode(isMobile ? pref.mobile : pref.desktop);
        setHasUserPreference(true);
      } else {
        // Use defaults
        setViewMode(isMobile ? DEFAULT_PREFERENCE.mobile : DEFAULT_PREFERENCE.desktop);
      }
    } catch {
      setViewMode(isMobile ? DEFAULT_PREFERENCE.mobile : DEFAULT_PREFERENCE.desktop);
    }
  }, [isMobile, isReady]);

  // Update view mode and save preference
  const setView = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
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

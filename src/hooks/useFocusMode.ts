"use client";

import { useState, useEffect, useCallback } from "react";

const FOCUS_MODE_KEY = "goalzenix_focus_mode";

/**
 * Hook for managing Focus Mode state.
 * Focus Mode hides overdue tasks and other distractions to reduce cognitive load.
 * State is persisted to localStorage.
 */
export function useFocusMode() {
  const [isFocusMode, setIsFocusModeState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load initial state from localStorage (client-side only)
  // Using requestAnimationFrame to defer setState and avoid cascading renders
  useEffect(() => {
    requestAnimationFrame(() => {
      const stored = localStorage.getItem(FOCUS_MODE_KEY);
      if (stored === "true") {
        setIsFocusModeState(true);
      }
      setIsHydrated(true);
    });
  }, []);

  // Update localStorage when state changes
  const setIsFocusMode = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsFocusModeState((prev) => {
      const newValue = typeof value === "function" ? value(prev) : value;
      localStorage.setItem(FOCUS_MODE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Toggle function for convenience
  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, [setIsFocusMode]);

  return {
    isFocusMode: isHydrated ? isFocusMode : false,
    setIsFocusMode,
    toggleFocusMode,
    isHydrated,
  };
}

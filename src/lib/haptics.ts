/**
 * Haptic feedback utilities for mobile devices
 * Uses the Vibration API where supported
 */

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "warning";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10], // Quick double tap
  error: [50, 100, 50, 100, 50], // Triple warning
  warning: [30, 50, 30], // Double tap
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Trigger haptic feedback
 * @param pattern - The haptic pattern to use
 * @returns true if haptic was triggered, false if not supported
 */
export function haptic(pattern: HapticPattern = "light"): boolean {
  if (!isHapticSupported()) {
    return false;
  }

  try {
    navigator.vibrate(PATTERNS[pattern]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Haptic feedback for specific actions
 */
export const haptics = {
  /** Task completed - satisfying success tap */
  taskComplete: () => haptic("success"),

  /** Task uncompleted - light feedback */
  taskUncomplete: () => haptic("light"),

  /** Drag started - medium feedback */
  dragStart: () => haptic("medium"),

  /** Drag ended/dropped - heavy feedback */
  dragEnd: () => haptic("heavy"),

  /** Error occurred - warning pattern */
  error: () => haptic("error"),

  /** Warning/attention needed */
  warning: () => haptic("warning"),

  /** Button press - light tap */
  tap: () => haptic("light"),

  /** Selection changed */
  selection: () => haptic("light"),
};

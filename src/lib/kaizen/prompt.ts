/**
 * Kaizen Evening Prompt Utilities
 *
 * Handles the evening prompt for Kaizen daily check-in.
 * Shows a gentle reminder in the evening if user hasn't reflected today.
 */

const KAIZEN_PROMPT_DISMISSED_KEY = "kaizen_prompt_dismissed";

/**
 * Check if user should see the Kaizen evening prompt
 * Conditions:
 * 1. It's evening (6pm - 11pm)
 * 2. User hasn't dismissed the prompt today
 */
export function shouldShowKaizenPrompt(): boolean {
  if (typeof window === "undefined") return false;

  // Check if it's evening (6pm - 11pm)
  const hour = new Date().getHours();
  if (hour < 18 || hour > 23) return false;

  // Check if already dismissed today
  const dismissed = localStorage.getItem(KAIZEN_PROMPT_DISMISSED_KEY);
  if (dismissed) {
    const dismissedDate = new Date(dismissed);
    const today = new Date();
    // Same day = already dismissed
    if (
      dismissedDate.getDate() === today.getDate() &&
      dismissedDate.getMonth() === today.getMonth() &&
      dismissedDate.getFullYear() === today.getFullYear()
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Mark Kaizen prompt as dismissed for today
 */
export function markKaizenPromptDismissed(): void {
  localStorage.setItem(KAIZEN_PROMPT_DISMISSED_KEY, new Date().toISOString());
}

/**
 * Reset Kaizen prompt dismissal (for testing)
 */
export function resetKaizenPromptDismissal(): void {
  localStorage.removeItem(KAIZEN_PROMPT_DISMISSED_KEY);
}

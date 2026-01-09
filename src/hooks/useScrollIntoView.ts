"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to scroll focused inputs into view when the virtual keyboard opens on mobile.
 * Handles the issue where the keyboard can obscure form inputs.
 *
 * Usage:
 * const { inputRef, handleFocus } = useScrollIntoView<HTMLInputElement>();
 * <input ref={inputRef} onFocus={handleFocus} />
 */
export function useScrollIntoView<T extends HTMLElement>() {
  const inputRef = useRef<T>(null);

  const handleFocus = useCallback(() => {
    const element = inputRef.current;
    if (!element) return;

    // Wait for the keyboard to animate in on mobile
    // The visual viewport resize event fires but timing varies by device
    const scrollWithDelay = () => {
      // Check if element is still in DOM and focused
      if (!element || document.activeElement !== element) return;

      // Use scrollIntoView with behavior smooth for a nice effect
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    };

    // Initial scroll after a short delay for keyboard animation
    const timeoutId = setTimeout(scrollWithDelay, 300);

    // Also listen for visual viewport changes (more accurate on modern browsers)
    if (typeof window !== "undefined" && window.visualViewport) {
      const handleResize = () => {
        scrollWithDelay();
      };

      window.visualViewport.addEventListener("resize", handleResize, { once: true });

      // Cleanup
      return () => {
        clearTimeout(timeoutId);
        window.visualViewport?.removeEventListener("resize", handleResize);
      };
    }

    return () => clearTimeout(timeoutId);
  }, []);

  return { inputRef, handleFocus };
}

/**
 * Simpler version that just scrolls any element into view on focus.
 * Can be attached to any element's onFocus handler.
 */
export function scrollInputIntoView(event: React.FocusEvent<HTMLElement>) {
  const element = event.currentTarget;

  // Wait for keyboard animation
  setTimeout(() => {
    if (document.activeElement === element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, 300);
}

/**
 * Hook to auto-apply scroll behavior to all inputs in a container.
 * Useful for forms where you want all inputs to scroll into view.
 */
export function useAutoScrollForm<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      // Check if the focused element is an input-like element
      const isInputLike =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (!isInputLike) return;

      setTimeout(() => {
        if (document.activeElement === target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 300);
    };

    container.addEventListener("focusin", handleFocusIn);
    return () => container.removeEventListener("focusin", handleFocusIn);
  }, []);

  return containerRef;
}

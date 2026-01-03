"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SwipeGestureOptions {
  threshold?: number;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  disabled?: boolean;
}

interface SwipeState {
  offset: number;
  isSwiping: boolean;
  direction: "left" | "right" | null;
}

export function useSwipeGesture<T extends HTMLElement = HTMLDivElement>({
  threshold = 80,
  onSwipeRight,
  onSwipeLeft,
  disabled = false,
}: SwipeGestureOptions = {}) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<SwipeState>({
    offset: 0,
    isSwiping: false,
    direction: null,
  });

  // Track gesture state
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    isTracking: false,
    isHorizontal: null as boolean | null,
  });

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (disabled) return;
      // Only track touch/pen, not mouse (mouse uses click)
      if (e.pointerType === "mouse") return;

      gestureRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        isTracking: true,
        isHorizontal: null,
      };

      // Capture pointer for smooth tracking
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!gestureRef.current.isTracking || disabled) return;

      const deltaX = e.clientX - gestureRef.current.startX;
      const deltaY = e.clientY - gestureRef.current.startY;

      // Determine direction on first significant move
      if (gestureRef.current.isHorizontal === null) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Need at least 10px movement to determine direction
        if (absX > 10 || absY > 10) {
          gestureRef.current.isHorizontal = absX > absY;

          // If vertical scroll, stop tracking
          if (!gestureRef.current.isHorizontal) {
            gestureRef.current.isTracking = false;
            return;
          }
        } else {
          return; // Wait for more movement
        }
      }

      // Only handle horizontal swipes
      if (!gestureRef.current.isHorizontal) return;

      // Prevent scrolling while swiping horizontally
      e.preventDefault();

      // Apply resistance at edges (reduce movement by 50% past threshold)
      let offset = deltaX;
      if (Math.abs(offset) > threshold) {
        const excess = Math.abs(offset) - threshold;
        offset = (threshold + excess * 0.5) * Math.sign(offset);
      }

      setState({
        offset,
        isSwiping: true,
        direction: offset > 0 ? "right" : "left",
      });
    },
    [disabled, threshold]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!gestureRef.current.isTracking) return;

      const { offset } = state;
      const absOffset = Math.abs(offset);

      // Trigger action if threshold met
      if (absOffset >= threshold) {
        if (offset > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (offset < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      // Reset state
      gestureRef.current.isTracking = false;
      gestureRef.current.isHorizontal = null;

      // Animate back to zero
      setState({
        offset: 0,
        isSwiping: false,
        direction: null,
      });

      // Release pointer capture
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if already released
      }
    },
    [state, threshold, onSwipeRight, onSwipeLeft]
  );

  const handlePointerCancel = useCallback(() => {
    gestureRef.current.isTracking = false;
    gestureRef.current.isHorizontal = null;
    setState({
      offset: 0,
      isSwiping: false,
      direction: null,
    });
  }, []);

  // Attach event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel]);

  return {
    ref,
    offset: state.offset,
    isSwiping: state.isSwiping,
    direction: state.direction,
    progress: Math.min(Math.abs(state.offset) / threshold, 1),
  };
}

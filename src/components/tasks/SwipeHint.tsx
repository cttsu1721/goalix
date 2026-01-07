"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Hand, ChevronRight } from "lucide-react";

const SWIPE_HINT_SHOWN_KEY = "goalzenix_swipe_hint_shown";

/**
 * Check if swipe hint has been shown before
 */
export function hasSeenSwipeHint(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SWIPE_HINT_SHOWN_KEY) === "true";
}

/**
 * Mark swipe hint as shown
 */
export function markSwipeHintShown(): void {
  localStorage.setItem(SWIPE_HINT_SHOWN_KEY, "true");
}

interface SwipeHintProps {
  show: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function SwipeHint({ show, onDismiss, className }: SwipeHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsAnimating(false);
    markSwipeHintShown();

    // Fade out then hide
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (show && !hasSeenSwipeHint()) {
      // Delay showing hint so tasks load first
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1500);

      // Auto-dismiss after 6 seconds
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 7500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [show, handleDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute inset-x-0 top-0 z-10 pointer-events-none",
        "transition-opacity duration-300",
        isAnimating ? "opacity-100" : "opacity-0",
        className
      )}
      onClick={handleDismiss}
    >
      {/* Overlay hint */}
      <div className="relative h-full flex items-center">
        {/* Animated swipe indicator */}
        <div
          className={cn(
            "absolute left-4 flex items-center gap-2",
            "text-moon-soft text-sm",
            isAnimating && "animate-swipe-hint"
          )}
        >
          <div className="flex items-center gap-1.5 px-3 py-2 bg-zen-green/20 rounded-full border border-zen-green/30 backdrop-blur-sm">
            <Hand className="w-4 h-4 text-zen-green" />
            <span className="text-zen-green font-medium">Swipe right to complete</span>
            <ChevronRight className="w-4 h-4 text-zen-green animate-pulse" />
          </div>
        </div>
      </div>

      {/* Add the animation keyframes via style tag */}
      <style jsx>{`
        @keyframes swipe-hint {
          0%, 100% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(40px);
            opacity: 0.8;
          }
        }
        .animate-swipe-hint {
          animation: swipe-hint 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

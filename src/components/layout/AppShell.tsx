"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { QuickAddFab } from "./QuickAddFab";
import { Loader2, ArrowDown } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  className?: string;
  onRefresh?: () => Promise<void>;
}

export function AppShell({ children, rightPanel, className, onRefresh }: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const threshold = 80;
  const maxPull = 120;

  // Check if device is touch-enabled
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!onRefresh || isRefreshing) return;
      const main = mainRef.current;
      if (!main) return;

      // Only enable pull-to-refresh when at the very top
      if (main.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      } else {
        // Explicitly disable when not at top
        setIsPulling(false);
      }
    },
    [onRefresh, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      // Early exit if not in pull-to-refresh mode
      if (!isPulling || !onRefresh || isRefreshing) return;

      const main = mainRef.current;
      if (!main) return;

      // If user scrolled away from top, cancel pull-to-refresh
      if (main.scrollTop > 0) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only handle downward pulls (positive diff = finger moving down = pull to refresh gesture)
      if (diff > 0) {
        const resistance = 0.5;
        const distance = Math.min(diff * resistance, maxPull);
        setPullDistance(distance);
        // Only prevent default when actually pulling down for refresh
        if (distance > 10) {
          e.preventDefault();
        }
      } else {
        // User is trying to scroll down, cancel pull mode
        if (pullDistance > 0) {
          setPullDistance(0);
        }
      }
    },
    [isPulling, onRefresh, isRefreshing, pullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    // Always reset isPulling on touch end
    setIsPulling(false);

    if (!onRefresh) {
      setPullDistance(0);
      return;
    }

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [onRefresh, pullDistance, isRefreshing]);

  // Also handle touchcancel to reset state
  const handleTouchCancel = useCallback(() => {
    setIsPulling(false);
    setPullDistance(0);
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || !onRefresh || !isTouchDevice) return;

    main.addEventListener("touchstart", handleTouchStart, { passive: true });
    main.addEventListener("touchmove", handleTouchMove, { passive: false });
    main.addEventListener("touchend", handleTouchEnd);
    main.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      main.removeEventListener("touchstart", handleTouchStart);
      main.removeEventListener("touchmove", handleTouchMove);
      main.removeEventListener("touchend", handleTouchEnd);
      main.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, onRefresh, isTouchDevice]);

  const showIndicator = (pullDistance > 0 || isRefreshing) && onRefresh;
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div
      className={cn(
        "min-h-screen grid w-full max-w-full overflow-x-hidden",
        // Desktop: 3 columns
        "xl:grid-cols-[260px_1fr_320px]",
        // Tablet: 2 columns (no stats panel)
        "lg:grid-cols-[240px_1fr]",
        // Mobile: 1 column
        "grid-cols-1",
        className
      )}
    >
      {/* Sidebar - Hidden on mobile */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content */}
      <main
        ref={mainRef}
        className="bg-void overflow-y-auto overflow-x-hidden min-h-screen min-w-0 relative"
        style={{
          // Ensure smooth scrolling and proper touch handling on iOS
          WebkitOverflowScrolling: "touch",
          // Prevent overscroll on the main element to avoid scroll lock
          overscrollBehavior: "contain",
        }}
      >
        {/* Pull-to-refresh indicator */}
        {showIndicator && (
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center",
              "transition-opacity duration-200 opacity-100"
            )}
            style={{
              top: Math.max(pullDistance - 32, 16),
              transition: isPulling ? "none" : "top 0.2s ease-out, opacity 0.2s ease-out",
            }}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full bg-night-soft border border-night-mist",
                "flex items-center justify-center shadow-lg"
              )}
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 text-lantern animate-spin" />
              ) : (
                <ArrowDown
                  className={cn(
                    "w-5 h-5 transition-transform duration-100",
                    progress >= 1 ? "text-lantern" : "text-moon-dim"
                  )}
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              )}
            </div>
          </div>
        )}

        <div
          className={cn(
            // Desktop padding
            "xl:px-14 xl:py-12",
            // Tablet padding
            "lg:px-12 lg:py-10",
            // Mobile padding - tighter horizontal for more content
            "px-4 sm:px-6 py-6 sm:py-7",
            // Bottom padding for mobile nav + safe area
            "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-10",
            // Prevent content from overflowing
            "w-full max-w-full overflow-x-hidden"
          )}
          style={{
            paddingTop: showIndicator ? `calc(1.5rem + ${pullDistance}px)` : undefined,
            transition: isPulling ? "none" : "padding-top 0.2s ease-out",
          }}
        >
          <div className="w-full max-w-full min-w-0">
            {children}
          </div>
        </div>
      </main>

      {/* Stats Panel - Only visible on desktop */}
      {rightPanel && (
        <aside className="hidden xl:block bg-night border-l border-night-mist overflow-y-auto">
          <div className="p-7">{rightPanel}</div>
        </aside>
      )}

      {/* Quick Add FAB - Mobile only */}
      <QuickAddFab />

      {/* Mobile Navigation */}
      <MobileNav className="lg:hidden" />
    </div>
  );
}

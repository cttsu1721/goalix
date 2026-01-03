"use client";

import { ReactNode } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const { containerRef, pullDistance, isRefreshing, isPulling } =
    usePullToRefresh({
      onRefresh,
      disabled,
    });

  const showIndicator = pullDistance > 0 || isRefreshing;
  const progress = Math.min(pullDistance / 80, 1); // 80 is threshold
  const rotation = progress * 180;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{
        // Add padding to accommodate the indicator
        paddingTop: showIndicator ? pullDistance : 0,
        transition: isPulling ? "none" : "padding-top 0.2s ease-out",
      }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center",
          "transition-opacity duration-200",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(pullDistance - 40, 8),
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
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            />
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

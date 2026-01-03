"use client";

import { cn } from "@/lib/utils";
import { Flame, TrendingUp, Target, ChevronRight } from "lucide-react";
import Link from "next/link";

interface MobileStatsBarProps {
  streak: number;
  todayPoints: number;
  goalAlignment: number;
  levelName: string;
  className?: string;
}

export function MobileStatsBar({
  streak,
  todayPoints,
  goalAlignment,
  levelName,
  className,
}: MobileStatsBarProps) {
  return (
    <Link
      href="/progress"
      className={cn(
        // Only show on mobile/tablet, hide on desktop where right panel shows
        "xl:hidden",
        "block mb-6",
        className
      )}
    >
      <div
        className={cn(
          "bg-night border border-night-mist rounded-xl p-3",
          "flex items-center justify-between gap-2",
          "active:bg-night-soft transition-colors"
        )}
      >
        {/* Stats row */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {/* Streak */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Flame
              className={cn(
                "w-4 h-4",
                streak > 0 ? "text-zen-red" : "text-moon-dim"
              )}
            />
            <span className="text-sm font-medium text-moon tabular-nums">
              {streak}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-night-mist flex-shrink-0" />

          {/* Today's Points */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-zen-green" />
            <span className="text-sm font-medium text-moon tabular-nums">
              +{todayPoints}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-night-mist flex-shrink-0" />

          {/* Goal Alignment */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Target className="w-4 h-4 text-lantern" />
            <span className="text-sm font-medium text-moon tabular-nums">
              {goalAlignment}%
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-night-mist flex-shrink-0" />

          {/* Level */}
          <span className="text-xs font-medium text-moon-dim flex-shrink-0">
            {levelName}
          </span>
        </div>

        {/* Arrow indicating tap for more */}
        <ChevronRight className="w-4 h-4 text-moon-faint flex-shrink-0" />
      </div>
    </Link>
  );
}

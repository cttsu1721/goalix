"use client";

import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  days: number;
  className?: string;
}

export function StreakDisplay({ days, className }: StreakDisplayProps) {
  return (
    <div className={cn("mb-9", className)}>
      <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-4">
        Streak
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-light text-lantern leading-none">
          {days}
        </span>
        <span className="text-sm text-moon-faint font-light">days</span>
        <span className="text-2xl ml-2 animate-gentle-pulse">🔥</span>
      </div>
    </div>
  );
}

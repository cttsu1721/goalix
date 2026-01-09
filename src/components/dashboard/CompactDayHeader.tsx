"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight, Flame, TrendingUp, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CompactDayHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  streak?: number;
  todayPoints?: number;
  goalAlignment?: number;
  className?: string;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  const diffTime = compareDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * CompactDayHeader - Unified mobile header combining date navigation + stats
 * Reduces vertical space by ~40% compared to separate MobileStatsBar + DayNavigation
 */
export function CompactDayHeader({
  currentDate,
  onDateChange,
  streak = 0,
  todayPoints = 0,
  goalAlignment = 0,
  className,
}: CompactDayHeaderProps) {
  const goToPrevDay = useCallback(() => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    onDateChange(prevDay);
  }, [currentDate, onDateChange]);

  const goToNextDay = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  }, [currentDate, onDateChange]);

  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  const dateLabel = formatDateLabel(currentDate);
  const isTodaySelected = isToday(currentDate);

  return (
    <div className={cn("flex items-center justify-between gap-2 mb-4", className)}>
      {/* Left: Date navigation - compact */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevDay}
          className="h-7 w-7 p-0 text-moon-dim hover:text-moon hover:bg-night-soft"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <button
          onClick={goToToday}
          className={cn(
            "px-2 py-0.5 text-sm font-medium rounded transition-colors min-w-[70px] text-center",
            isTodaySelected
              ? "text-lantern"
              : "text-moon hover:text-lantern"
          )}
        >
          {dateLabel}
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextDay}
          className="h-7 w-7 p-0 text-moon-dim hover:text-moon hover:bg-night-soft"
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Right: Compact stats + Week link */}
      <div className="flex items-center gap-1.5">
        {/* Micro stats - tap for full stats */}
        <Link
          href="/progress"
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-night-soft transition-colors"
        >
          {/* Streak pill */}
          <div className="flex items-center gap-1">
            <Flame className={cn("w-3 h-3", streak > 0 ? "text-zen-red" : "text-moon-faint")} />
            <span className="text-xs tabular-nums text-moon-dim">{streak}</span>
          </div>

          {/* Points pill */}
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-zen-green" />
            <span className="text-xs tabular-nums text-moon-dim">+{todayPoints}</span>
          </div>

          {/* Alignment - only show if > 0 */}
          {goalAlignment > 0 && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-lantern" />
              <span className="text-xs tabular-nums text-moon-dim">{goalAlignment}%</span>
            </div>
          )}
        </Link>

        {/* Week view link */}
        <Link href="/week">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-moon-dim hover:text-moon hover:bg-night-soft"
            aria-label="Week view"
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

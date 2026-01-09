"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DayNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
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
 * Day navigation component for mobile day view
 * Shows current date with prev/next buttons and week view link
 */
export function DayNavigation({ currentDate, onDateChange, className }: DayNavigationProps) {
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
  const showTodayButton = !isToday(currentDate);

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {/* Left: Date navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevDay}
          className="h-8 w-8 p-0 text-moon-soft hover:text-moon hover:bg-night-soft"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <button
          onClick={goToToday}
          className={cn(
            "px-3 py-1 text-sm font-medium rounded-md transition-colors",
            isToday(currentDate)
              ? "text-lantern"
              : "text-moon hover:text-lantern hover:bg-lantern/5"
          )}
        >
          {dateLabel}
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextDay}
          className="h-8 w-8 p-0 text-moon-soft hover:text-moon hover:bg-night-soft"
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {showTodayButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="h-7 px-2 text-xs text-lantern hover:bg-lantern/10"
          >
            Today
          </Button>
        )}

        <Link href="/week">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs border-night-mist text-moon-soft hover:text-moon hover:bg-night-soft"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Week
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Swipe container for day navigation on mobile
 */
interface SwipeContainerProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SwipeContainer({
  onSwipeLeft,
  onSwipeRight,
  children,
  className
}: SwipeContainerProps) {
  const minSwipeDistance = 50;
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.targetTouches[0].clientX;
    touchEndX = touchStartX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={className}
    >
      {children}
    </div>
  );
}

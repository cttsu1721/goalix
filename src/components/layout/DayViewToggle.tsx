"use client";

import { Calendar, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DayViewToggleProps {
  viewMode: "day" | "week";
  onToggle: () => void;
  className?: string;
}

/**
 * Toggle between day and week view modes
 */
export function DayViewToggle({
  viewMode,
  onToggle,
  className,
}: DayViewToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
        "bg-night-soft border border-night-mist hover:bg-night hover:border-night-glow",
        className
      )}
    >
      {viewMode === "day" ? (
        <>
          <Calendar className="w-4 h-4 text-moon-dim" />
          <span className="text-moon">Day</span>
        </>
      ) : (
        <>
          <CalendarDays className="w-4 h-4 text-moon-dim" />
          <span className="text-moon">Week</span>
        </>
      )}
    </button>
  );
}

interface DayNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

/**
 * Day navigation with swipe hint for mobile
 */
export function DayNavigator({
  currentDate,
  onDateChange,
  className,
}: DayNavigatorProps) {
  const goToPrevious = () => {
    onDateChange(subDays(currentDate, 1));
  };

  const goToNext = () => {
    onDateChange(addDays(currentDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEE, MMM d");
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="w-8 h-8 text-moon-dim hover:text-moon"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <button
        onClick={goToToday}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[120px]",
          isToday(currentDate)
            ? "bg-lantern/10 text-lantern"
            : "bg-night-soft text-moon hover:bg-night"
        )}
      >
        {getDateLabel(currentDate)}
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="w-8 h-8 text-moon-dim hover:text-moon"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * Mobile-friendly view mode selector
 */
export function MobileViewSelector({
  viewMode,
  onViewChange,
  currentDate,
  onDateChange,
  className,
}: {
  viewMode: "day" | "week";
  onViewChange: (mode: "day" | "week") => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* View mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewChange("day")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors",
            viewMode === "day"
              ? "bg-lantern text-void"
              : "bg-night-soft text-moon-dim hover:bg-night"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Day</span>
        </button>
        <button
          onClick={() => onViewChange("week")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors",
            viewMode === "week"
              ? "bg-lantern text-void"
              : "bg-night-soft text-moon-dim hover:bg-night"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-sm">Week</span>
        </button>
      </div>

      {/* Day navigator (only when in day view) */}
      {viewMode === "day" && (
        <DayNavigator currentDate={currentDate} onDateChange={onDateChange} />
      )}
    </div>
  );
}

/**
 * Swipe hint for mobile users
 */
export function SwipeHint({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-xs text-moon-faint py-2",
        className
      )}
    >
      <ChevronLeft className="w-3 h-3" />
      <span>Swipe to navigate days</span>
      <ChevronRight className="w-3 h-3" />
    </div>
  );
}

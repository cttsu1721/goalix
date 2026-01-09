"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles, Target, Plus } from "lucide-react";
import { GoalCategoryBadge } from "./GoalCategoryBadge";
import type { GoalCategory, GoalStatus } from "@prisma/client";

interface VisionCardProps {
  id: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  status?: GoalStatus;
  progress?: number;
  childrenCount?: number;
  completedChildren?: number;
  targetDate?: Date | string | null;
  onClick?: () => void;
  onCreateChild?: () => void;
  className?: string;
}

export function VisionCard({
  title,
  description,
  category,
  status = "ACTIVE",
  progress = 0,
  childrenCount = 0,
  completedChildren = 0,
  targetDate,
  onClick,
  onCreateChild,
  className,
}: VisionCardProps) {
  const isCompleted = status === "COMPLETED";
  const isPaused = status === "PAUSED";

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateChild?.();
  };

  // Calculate years remaining - memoized to avoid hydration mismatch
  // Uses current year comparison instead of Date.now() for stable SSR
  const yearsRemaining = useMemo(() => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    const years = target.getFullYear() - now.getFullYear();
    return Math.max(0, years);
  }, [targetDate]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left group relative",
        "bg-night border border-night-mist rounded-xl sm:rounded-2xl p-4 sm:p-6",
        "transition-all duration-300",
        "hover:border-lantern/40 hover:bg-night-soft",
        "focus:outline-none focus:ring-2 focus:ring-lantern/50 focus:ring-offset-2 focus:ring-offset-void",
        "ring-1 ring-lantern/10",
        isCompleted && "opacity-80",
        isPaused && "opacity-60",
        className
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-b from-lantern/[0.04] to-transparent pointer-events-none" />

      {/* Top right icons */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1">
        {onCreateChild && (
          <button
            onClick={handleCreateChild}
            className={cn(
              "w-9 h-9 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center",
              "text-moon-faint hover:text-lantern hover:bg-lantern/10",
              "sm:opacity-0 group-hover:opacity-100 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-lantern/50 focus:opacity-100"
            )}
            title="Add 3-year goal"
            aria-label={`Add 3-year goal to ${title}`}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-lantern/40" />
      </div>

      {/* Category badge */}
      <div className="mb-3 sm:mb-4">
        <GoalCategoryBadge category={category} size="md" />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "text-base sm:text-lg font-medium mb-1.5 sm:mb-2 text-moon pr-8",
          isCompleted && "line-through text-moon-dim"
        )}
      >
        {title}
      </h3>

      {/* Description - hidden on mobile */}
      {description && (
        <p className="hidden sm:block text-sm text-moon-dim mb-5 line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Progress section */}
      <div className="space-y-2 sm:space-y-3">
        {/* Progress bar */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-[0.625rem] sm:text-xs">
            <span className="text-moon-faint">Progress</span>
            <span className="text-lantern font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-night-mist rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isCompleted
                  ? "bg-zen-green"
                  : "bg-gradient-to-r from-lantern via-lantern to-zen-green"
              )}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Stats row - pr-16 to avoid overlap with View button */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-night-mist pr-12 sm:pr-16">
          {/* Children count */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[0.625rem] sm:text-xs">
            <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-moon-faint" />
            <span className="text-moon-faint">
              {completedChildren}/{childrenCount} <span className="hidden sm:inline">3-year goals</span><span className="sm:hidden">goals</span>
            </span>
          </div>

          {/* Years remaining */}
          {yearsRemaining !== null && (
            <div className="text-[0.625rem] sm:text-xs text-moon-soft">
              <span className="text-lantern font-medium">{yearsRemaining}</span>
              <span className="text-moon-faint"> <span className="hidden sm:inline">years</span><span className="sm:hidden">yr</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Status badge */}
      {(isPaused || status === "ABANDONED") && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <span
            className={cn(
              "text-[0.5625rem] sm:text-[0.625rem] font-medium uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full",
              isPaused && "bg-moon-dim/20 text-moon-dim",
              status === "ABANDONED" && "bg-zen-red/20 text-zen-red"
            )}
          >
            {status.toLowerCase()}
          </span>
        </div>
      )}

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <span className="text-[0.5625rem] sm:text-[0.625rem] font-medium uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-zen-green/20 text-zen-green">
            achieved
          </span>
        </div>
      )}

      {/* View arrow */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
        <div className="flex items-center gap-1 text-[0.625rem] sm:text-xs text-moon-faint group-hover:text-lantern transition-colors">
          <span>View</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
    </button>
  );
}

// Backward compatibility alias
export const DreamCard = VisionCard;

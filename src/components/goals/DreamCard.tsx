"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles, Target } from "lucide-react";
import { GoalCategoryBadge } from "./GoalCategoryBadge";
import type { GoalCategory, GoalStatus } from "@prisma/client";

interface DreamCardProps {
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
  className?: string;
}

export function DreamCard({
  title,
  description,
  category,
  status = "ACTIVE",
  progress = 0,
  childrenCount = 0,
  completedChildren = 0,
  targetDate,
  onClick,
  className,
}: DreamCardProps) {
  const isCompleted = status === "COMPLETED";
  const isPaused = status === "PAUSED";

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
        "bg-night border border-night-mist rounded-2xl p-6",
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
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-lantern/[0.04] to-transparent pointer-events-none" />

      {/* Sparkle icon */}
      <div className="absolute top-4 right-4">
        <Sparkles className="w-5 h-5 text-lantern/40" />
      </div>

      {/* Category badge */}
      <div className="mb-4">
        <GoalCategoryBadge category={category} size="md" />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "text-lg font-medium mb-2 text-moon pr-8",
          isCompleted && "line-through text-moon-dim"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-moon-dim mb-5 line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Progress section */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-moon-faint">Overall Progress</span>
            <span className="text-lantern font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-night-mist rounded-full overflow-hidden">
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

        {/* Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-night-mist">
          {/* Children count */}
          <div className="flex items-center gap-2 text-xs">
            <Target className="w-3.5 h-3.5 text-moon-faint" />
            <span className="text-moon-faint">
              {completedChildren}/{childrenCount} 5-year goals
            </span>
          </div>

          {/* Years remaining */}
          {yearsRemaining !== null && (
            <div className="text-xs text-moon-soft">
              <span className="text-lantern font-medium">{yearsRemaining}</span>
              <span className="text-moon-faint"> years left</span>
            </div>
          )}
        </div>
      </div>

      {/* Status badge */}
      {(isPaused || status === "ABANDONED") && (
        <div className="absolute top-4 left-4">
          <span
            className={cn(
              "text-[0.625rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
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
        <div className="absolute top-4 left-4">
          <span className="text-[0.625rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-zen-green/20 text-zen-green">
            achieved
          </span>
        </div>
      )}

      {/* View arrow */}
      <div className="absolute bottom-6 right-6">
        <div className="flex items-center gap-1 text-xs text-moon-faint group-hover:text-lantern transition-colors">
          <span>View</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}

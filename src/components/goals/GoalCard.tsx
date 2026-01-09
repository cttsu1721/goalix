"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Plus } from "lucide-react";
import { GoalCategoryBadge } from "./GoalCategoryBadge";
import type { GoalCategory, GoalStatus } from "@prisma/client";

interface GoalCardProps {
  id: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  status?: GoalStatus;
  progress?: number;
  childrenCount?: number;
  completedChildren?: number;
  parentTitle?: string;
  onClick?: () => void;
  onCreateChild?: () => void;
  childLabel?: string;
  className?: string;
}

export function GoalCard({
  title,
  description,
  category,
  status = "ACTIVE",
  progress = 0,
  childrenCount = 0,
  completedChildren = 0,
  parentTitle,
  onClick,
  onCreateChild,
  childLabel = "sub-goal",
  className,
}: GoalCardProps) {
  const isCompleted = status === "COMPLETED";
  const isPaused = status === "PAUSED";
  const isArchived = status === "ARCHIVED";

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateChild?.();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full max-w-full text-left group relative overflow-hidden",
        "bg-night border border-night-mist rounded-2xl p-5",
        "transition-all duration-200",
        "hover:border-lantern/30 hover:bg-night-soft",
        "focus:outline-none focus:ring-2 focus:ring-lantern/50 focus:ring-offset-2 focus:ring-offset-void",
        isCompleted && "opacity-70",
        isPaused && "opacity-50",
        isArchived && "opacity-40 grayscale",
        className
      )}
    >
      {/* Parent reference */}
      {parentTitle && (
        <div className="text-[0.625rem] text-moon-faint mb-2 truncate max-w-full overflow-hidden">
          From: {parentTitle}
        </div>
      )}

      {/* Category indicator */}
      <div className="flex items-center justify-between mb-3">
        <GoalCategoryBadge category={category} />
        <div className="flex items-center gap-1">
          {onCreateChild && (
            <button
              onClick={handleCreateChild}
              className={cn(
                "w-11 h-11 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center",
                "text-moon-faint hover:text-lantern hover:bg-lantern/10",
                "sm:opacity-0 group-hover:opacity-100 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-lantern/50 focus:opacity-100"
              )}
              title={`Add ${childLabel}`}
              aria-label={`Add ${childLabel} to ${title}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-moon-faint group-hover:text-lantern transition-colors" />
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-medium mb-2 text-moon line-clamp-2",
          isCompleted && "line-through text-moon-dim"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-moon-dim mb-4 line-clamp-2">{description}</p>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-moon-faint">Progress</span>
          <span className="text-moon-soft font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-night-mist rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCompleted
                ? "bg-zen-green"
                : "bg-gradient-to-r from-lantern to-zen-green"
            )}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Children count */}
      {childrenCount > 0 && (
        <div className="mt-3 pt-3 border-t border-night-mist flex items-center justify-between text-xs">
          <span className="text-moon-faint">Sub-goals</span>
          <span className="text-moon-soft">
            {completedChildren}/{childrenCount} completed
          </span>
        </div>
      )}

      {/* Status badge */}
      {(isPaused || status === "ABANDONED" || isArchived) && (
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "text-[0.625rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
              isPaused && "bg-moon-dim/20 text-moon-dim",
              status === "ABANDONED" && "bg-zen-red/20 text-zen-red",
              isArchived && "bg-moon-faint/20 text-moon-faint"
            )}
          >
            {status.toLowerCase()}
          </span>
        </div>
      )}
    </button>
  );
}

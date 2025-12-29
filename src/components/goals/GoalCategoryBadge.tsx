"use client";

import { cn } from "@/lib/utils";
import type { GoalCategory } from "@prisma/client";
import { GOAL_CATEGORY_LABELS } from "@/types/goals";

interface GoalCategoryBadgeProps {
  category: GoalCategory;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<GoalCategory, { bg: string; dot: string }> = {
  HEALTH: { bg: "bg-zen-green/10", dot: "bg-zen-green" },
  WEALTH: { bg: "bg-lantern/10", dot: "bg-lantern" },
  RELATIONSHIPS: { bg: "bg-zen-purple/10", dot: "bg-zen-purple" },
  CAREER: { bg: "bg-zen-blue/10", dot: "bg-zen-blue" },
  PERSONAL_GROWTH: { bg: "bg-zen-purple/10", dot: "bg-zen-purple" },
  LIFESTYLE: { bg: "bg-lantern/10", dot: "bg-lantern" },
  OTHER: { bg: "bg-moon-dim/10", dot: "bg-moon-dim" },
};

export function GoalCategoryBadge({
  category,
  size = "sm",
  showLabel = true,
  className,
}: GoalCategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
  const label = GOAL_CATEGORY_LABELS[category] || category;

  if (!showLabel) {
    return (
      <div
        className={cn(
          "rounded-full",
          size === "sm" ? "w-2 h-2" : "w-3 h-3",
          colors.dot,
          className
        )}
        title={label}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        size === "sm" ? "px-2 py-0.5" : "px-3 py-1",
        colors.bg,
        className
      )}
    >
      <div
        className={cn(
          "rounded-full",
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
          colors.dot
        )}
      />
      <span
        className={cn(
          "font-medium uppercase tracking-[0.15em] text-moon-soft",
          size === "sm" ? "text-[0.625rem]" : "text-[0.6875rem]"
        )}
      >
        {label}
      </span>
    </div>
  );
}

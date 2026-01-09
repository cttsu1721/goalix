"use client";

import { cn } from "@/lib/utils";
import type { GoalCategory } from "@prisma/client";
import { GOAL_CATEGORY_LABELS } from "@/types/goals";
import {
  Heart,
  Wallet,
  Users,
  Briefcase,
  Brain,
  Palmtree,
  Wrench,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface GoalCategoryBadgeProps {
  category: GoalCategory;
  size?: "sm" | "md";
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<GoalCategory, { bg: string; dot: string; icon: string }> = {
  HEALTH: { bg: "bg-zen-green/10", dot: "bg-zen-green", icon: "text-zen-green" },
  WEALTH: { bg: "bg-lantern/10", dot: "bg-lantern", icon: "text-lantern" },
  RELATIONSHIPS: { bg: "bg-zen-purple/10", dot: "bg-zen-purple", icon: "text-zen-purple" },
  CAREER: { bg: "bg-zen-blue/10", dot: "bg-zen-blue", icon: "text-zen-blue" },
  PERSONAL_GROWTH: { bg: "bg-zen-purple/10", dot: "bg-zen-purple", icon: "text-zen-purple" },
  LIFESTYLE: { bg: "bg-lantern/10", dot: "bg-lantern", icon: "text-lantern" },
  LIFE_MAINTENANCE: { bg: "bg-moon-faint/10", dot: "bg-moon-faint", icon: "text-moon-faint" },
  OTHER: { bg: "bg-moon-dim/10", dot: "bg-moon-dim", icon: "text-moon-dim" },
};

const CATEGORY_ICONS: Record<GoalCategory, LucideIcon> = {
  HEALTH: Heart,
  WEALTH: Wallet,
  RELATIONSHIPS: Users,
  CAREER: Briefcase,
  PERSONAL_GROWTH: Brain,
  LIFESTYLE: Palmtree,
  LIFE_MAINTENANCE: Wrench,
  OTHER: MoreHorizontal,
};

export function GoalCategoryBadge({
  category,
  size = "sm",
  showLabel = true,
  showIcon = true,
  className,
}: GoalCategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
  const label = GOAL_CATEGORY_LABELS[category] || category;
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.OTHER;

  // Icon-only mode (for compact displays)
  if (!showLabel) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          className
        )}
        title={label}
        aria-label={label}
      >
        {showIcon ? (
          <Icon
            className={cn(
              size === "sm" ? "w-3 h-3" : "w-4 h-4",
              colors.icon
            )}
          />
        ) : (
          <div
            className={cn(
              "rounded-full",
              size === "sm" ? "w-2 h-2" : "w-3 h-3",
              colors.dot
            )}
          />
        )}
      </div>
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
      {showIcon ? (
        <Icon
          className={cn(
            size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
            colors.icon
          )}
          aria-hidden="true"
        />
      ) : (
        <div
          className={cn(
            "rounded-full",
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
            colors.dot
          )}
        />
      )}
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

// Export icons and colors for use in other components
export { CATEGORY_ICONS, CATEGORY_COLORS };

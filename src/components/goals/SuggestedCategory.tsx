"use client";

import { useMemo } from "react";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GoalCategory } from "@prisma/client";

interface Goal {
  category: GoalCategory;
}

interface SuggestedCategoryProps {
  existingGoals: Goal[];
  value: GoalCategory | null;
  onChange: (category: GoalCategory) => void;
  className?: string;
}

const CATEGORY_INFO: Record<
  GoalCategory,
  { label: string; color: string; description: string }
> = {
  HEALTH: {
    label: "Health",
    color: "bg-zen-green/10 text-zen-green border-zen-green/30",
    description: "Physical and mental wellbeing",
  },
  WEALTH: {
    label: "Wealth",
    color: "bg-lantern/10 text-lantern border-lantern/30",
    description: "Financial growth and security",
  },
  RELATIONSHIPS: {
    label: "Relationships",
    color: "bg-zen-pink/10 text-zen-pink border-zen-pink/30",
    description: "Family, friends, community",
  },
  CAREER: {
    label: "Career",
    color: "bg-zen-blue/10 text-zen-blue border-zen-blue/30",
    description: "Professional development",
  },
  PERSONAL_GROWTH: {
    label: "Personal Growth",
    color: "bg-zen-purple/10 text-zen-purple border-zen-purple/30",
    description: "Learning and self-improvement",
  },
  LIFESTYLE: {
    label: "Lifestyle",
    color: "bg-moon/10 text-moon border-moon/30",
    description: "Quality of life, hobbies",
  },
  LIFE_MAINTENANCE: {
    label: "Life Maintenance",
    color: "bg-night-glow/10 text-night-glow border-night-glow/30",
    description: "Essential daily routines",
  },
  OTHER: {
    label: "Other",
    color: "bg-moon-dim/10 text-moon-dim border-moon-dim/30",
    description: "Miscellaneous goals",
  },
};

const ALL_CATEGORIES: GoalCategory[] = [
  "HEALTH",
  "WEALTH",
  "RELATIONSHIPS",
  "CAREER",
  "PERSONAL_GROWTH",
  "LIFESTYLE",
  "LIFE_MAINTENANCE",
  "OTHER",
];

/**
 * Suggests categories based on existing goals (6.3)
 * Shows most-used categories first, highlights gaps
 */
export function SuggestedCategory({
  existingGoals,
  value,
  onChange,
  className,
}: SuggestedCategoryProps) {
  // Analyze category distribution
  const categoryAnalysis = useMemo(() => {
    const counts: Record<GoalCategory, number> = {
      HEALTH: 0,
      WEALTH: 0,
      RELATIONSHIPS: 0,
      CAREER: 0,
      PERSONAL_GROWTH: 0,
      LIFESTYLE: 0,
      LIFE_MAINTENANCE: 0,
      OTHER: 0,
    };

    existingGoals.forEach((goal) => {
      counts[goal.category]++;
    });

    // Sort by usage (most used first)
    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => cat as GoalCategory);

    // Find unused categories (gaps)
    const gaps = sorted.filter((cat) => counts[cat] === 0);

    // Find most used
    const mostUsed = sorted.filter((cat) => counts[cat] > 0).slice(0, 3);

    return { counts, sorted, gaps, mostUsed };
  }, [existingGoals]);

  // Determine suggested category
  const suggestedCategory = useMemo(() => {
    // If user has goals, suggest a gap category
    if (categoryAnalysis.gaps.length > 0 && existingGoals.length >= 3) {
      // Prioritize important categories for balanced life
      const priorityGaps = categoryAnalysis.gaps.filter((cat) =>
        ["HEALTH", "WEALTH", "RELATIONSHIPS", "CAREER"].includes(cat)
      );
      return priorityGaps[0] || categoryAnalysis.gaps[0];
    }
    // Default to most popular category
    return categoryAnalysis.mostUsed[0] || "CAREER";
  }, [categoryAnalysis, existingGoals.length]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Suggestion hint */}
      {existingGoals.length >= 3 && categoryAnalysis.gaps.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-lantern/5 rounded-lg border border-lantern/20">
          <Sparkles className="w-4 h-4 text-lantern flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-moon">
              <span className="font-medium">Suggested: </span>
              You haven&apos;t set any{" "}
              <span className="text-lantern">
                {CATEGORY_INFO[suggestedCategory].label}
              </span>{" "}
              goals yet. A balanced approach leads to a fulfilling life.
            </p>
          </div>
        </div>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ALL_CATEGORIES.map((category) => {
          const info = CATEGORY_INFO[category];
          const count = categoryAnalysis.counts[category];
          const isSelected = value === category;
          const isSuggested =
            category === suggestedCategory && !value && existingGoals.length >= 3;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={cn(
                "relative p-3 rounded-lg border-2 text-left transition-all",
                isSelected
                  ? "border-lantern bg-lantern/10"
                  : "border-night-mist bg-night-soft hover:bg-night hover:border-night-glow",
                isSuggested && !isSelected && "ring-2 ring-lantern/30 ring-offset-2 ring-offset-void"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-lantern flex items-center justify-center">
                    <Check className="w-3 h-3 text-void" />
                  </div>
                </div>
              )}

              {/* Suggested badge */}
              {isSuggested && !isSelected && (
                <div className="absolute -top-2 -right-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-lantern text-void rounded-full font-medium">
                    Suggested
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      info.color
                    )}
                  >
                    {info.label}
                  </span>
                </div>
                <p className="text-xs text-moon-dim line-clamp-1">
                  {info.description}
                </p>
                {count > 0 && (
                  <p className="text-xs text-moon-faint">
                    {count} goal{count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact category selector for forms
 */
export function CategorySelector({
  value,
  onChange,
  className,
}: {
  value: GoalCategory | null;
  onChange: (category: GoalCategory) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {ALL_CATEGORIES.map((category) => {
        const info = CATEGORY_INFO[category];
        const isSelected = value === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              isSelected
                ? "border-lantern bg-lantern/10 text-lantern"
                : "border-night-mist bg-night-soft text-moon-dim hover:bg-night hover:border-night-glow hover:text-moon"
            )}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
}

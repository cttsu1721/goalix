"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronUp, Link2, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUnlinkedGoals } from "@/hooks";

// API level types
type GoalLevel = "threeYear" | "oneYear" | "monthly" | "weekly";

interface UnlinkedGoal {
  id: string;
  title: string;
  level: GoalLevel;
  category: string;
  status: string;
}

interface UnlinkedGoalsWarningProps {
  className?: string;
}

const LEVEL_LABELS: Record<GoalLevel, string> = {
  threeYear: "3-Year Goal",
  oneYear: "1-Year Goal",
  monthly: "Monthly Goal",
  weekly: "Weekly Goal",
};

const LEVEL_COLORS: Record<GoalLevel, string> = {
  threeYear: "text-zen-purple",
  oneYear: "text-lantern",
  monthly: "text-zen-green",
  weekly: "text-zen-blue",
};

const LEVEL_BG_COLORS: Record<GoalLevel, string> = {
  threeYear: "bg-zen-purple/10",
  oneYear: "bg-lantern/10",
  monthly: "bg-zen-green/10",
  weekly: "bg-zen-blue/10",
};

export function UnlinkedGoalsWarning({ className }: UnlinkedGoalsWarningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading, error } = useUnlinkedGoals();

  // Don't show loading state or error - just don't render
  if (isLoading || error) return null;

  const goals = data?.unlinkedGoals || [];

  // Don't show if no unlinked goals
  if (goals.length === 0) return null;

  const displayedGoals = isExpanded ? goals : goals.slice(0, 3);
  const hasMore = goals.length > 3;

  return (
    <div
      className={cn(
        "bg-lantern/5 border border-lantern/20 rounded-xl p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-lantern/10 rounded-lg flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-lantern" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-moon">
            {goals.length} Unlinked {goals.length === 1 ? "Goal" : "Goals"}
          </h3>
          <p className="text-xs text-moon-dim mt-0.5">
            These goals aren&apos;t connected to the hierarchy above them. Link them to cascade progress properly.
          </p>
        </div>
      </div>

      {/* Breakdown badges */}
      {data?.breakdown && (
        <div className="flex flex-wrap gap-2 mt-3">
          {data.breakdown.threeYear > 0 && (
            <span className={cn("px-2 py-0.5 text-xs rounded-full", LEVEL_BG_COLORS.threeYear, LEVEL_COLORS.threeYear)}>
              {data.breakdown.threeYear} 3-Year
            </span>
          )}
          {data.breakdown.oneYear > 0 && (
            <span className={cn("px-2 py-0.5 text-xs rounded-full", LEVEL_BG_COLORS.oneYear, LEVEL_COLORS.oneYear)}>
              {data.breakdown.oneYear} 1-Year
            </span>
          )}
          {data.breakdown.monthly > 0 && (
            <span className={cn("px-2 py-0.5 text-xs rounded-full", LEVEL_BG_COLORS.monthly, LEVEL_COLORS.monthly)}>
              {data.breakdown.monthly} Monthly
            </span>
          )}
          {data.breakdown.weekly > 0 && (
            <span className={cn("px-2 py-0.5 text-xs rounded-full", LEVEL_BG_COLORS.weekly, LEVEL_COLORS.weekly)}>
              {data.breakdown.weekly} Weekly
            </span>
          )}
        </div>
      )}

      {/* Goal List */}
      <div className="mt-4 space-y-2">
        {displayedGoals.map((goal) => (
          <Link
            key={goal.id}
            href={`/goals/${goal.id}`}
            className="flex items-center gap-3 p-3 bg-night rounded-lg hover:bg-night-soft transition-colors group"
          >
            <Link2 className={cn("w-4 h-4 flex-shrink-0", LEVEL_COLORS[goal.level])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-moon truncate">{goal.title}</p>
              <p className={cn("text-xs", LEVEL_COLORS[goal.level])}>
                {LEVEL_LABELS[goal.level]}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-moon-faint group-hover:text-moon transition-colors" />
          </Link>
        ))}
      </div>

      {/* Expand/Collapse */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 mt-3 text-xs text-moon-dim hover:text-moon transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show {goals.length - 3} more
            </>
          )}
        </button>
      )}

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-night-mist">
        <p className="text-xs text-moon-faint mb-2">
          Click on a goal to edit and link it to a parent goal.
        </p>
        <Link href="/goals">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-lantern/30 text-lantern hover:bg-lantern/10"
          >
            Review Goal Hierarchy
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Skeleton for loading state (optional use)
export function UnlinkedGoalsWarningSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-lantern/5 border border-lantern/20 rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-lantern animate-spin" />
      </div>
    </div>
  );
}

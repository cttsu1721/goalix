"use client";

import Link from "next/link";
import { Target, ChevronRight, Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useSiblingGoals } from "@/hooks";

interface SiblingGoal {
  id: string;
  title: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  progress: number;
}

interface SiblingGoalsProps {
  goals: SiblingGoal[];
  currentGoalId: string;
  parentTitle?: string;
  className?: string;
}

const STATUS_CONFIG = {
  ACTIVE: {
    icon: Clock,
    color: "text-lantern",
    bg: "bg-lantern/10",
  },
  COMPLETED: {
    icon: Check,
    color: "text-zen-green",
    bg: "bg-zen-green/10",
  },
  PAUSED: {
    icon: Clock,
    color: "text-moon-faint",
    bg: "bg-night-mist",
  },
};

export function SiblingGoals({
  goals,
  currentGoalId,
  parentTitle,
  className,
}: SiblingGoalsProps) {
  // Filter out current goal and only show siblings
  const siblings = goals.filter((g) => g.id !== currentGoalId);

  if (siblings.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-moon-faint" />
        <h4 className="text-sm font-medium text-moon-dim">
          {parentTitle ? `Other goals under "${parentTitle}"` : "Related Goals"}
        </h4>
        <span className="text-xs text-moon-faint">({siblings.length})</span>
      </div>

      <div className="space-y-2">
        {siblings.map((goal) => {
          const config = STATUS_CONFIG[goal.status];
          const StatusIcon = config.icon;

          return (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "bg-night-soft border border-night-mist",
                "hover:bg-night hover:border-night-glow transition-colors",
                "group"
              )}
            >
              <div className={cn("p-1.5 rounded-md", config.bg)}>
                <StatusIcon className={cn("w-3.5 h-3.5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-moon truncate">{goal.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={goal.progress} className="h-1 flex-1" />
                  <span className="text-xs text-moon-faint">{goal.progress}%</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-moon-faint group-hover:text-moon transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact sibling list for sidebar
 */
export function SiblingGoalsList({
  goals,
  currentGoalId,
  className,
}: {
  goals: SiblingGoal[];
  currentGoalId: string;
  className?: string;
}) {
  const siblings = goals.filter((g) => g.id !== currentGoalId);

  if (siblings.length === 0) return null;

  return (
    <div className={cn("space-y-1", className)}>
      {siblings.slice(0, 5).map((goal) => (
        <Link
          key={goal.id}
          href={`/goals/${goal.id}`}
          className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-night-soft text-sm text-moon-dim hover:text-moon transition-colors"
        >
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              goal.status === "COMPLETED"
                ? "bg-zen-green"
                : goal.status === "ACTIVE"
                ? "bg-lantern"
                : "bg-moon-faint"
            )}
          />
          <span className="truncate flex-1">{goal.title}</span>
        </Link>
      ))}
      {siblings.length > 5 && (
        <p className="text-xs text-moon-faint pl-4">
          +{siblings.length - 5} more
        </p>
      )}
    </div>
  );
}

/**
 * Auto-fetching sibling goals component (3.8)
 * Fetches siblings via API and displays them for navigation context
 */
export function SiblingGoalsSection({
  goalId,
  parentTitle,
  className,
}: {
  goalId: string;
  parentTitle?: string;
  className?: string;
}) {
  const { data, isLoading } = useSiblingGoals(goalId);

  // Don't render anything if loading or no siblings
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 p-4 bg-night-soft/50 rounded-xl", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-moon-faint" />
        <span className="text-sm text-moon-faint">Loading related goals...</span>
      </div>
    );
  }

  if (!data?.siblings?.length) {
    return null;
  }

  return (
    <SiblingGoals
      goals={data.siblings as SiblingGoal[]}
      currentGoalId={goalId}
      parentTitle={parentTitle}
      className={className}
    />
  );
}

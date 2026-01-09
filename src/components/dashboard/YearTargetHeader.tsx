"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, ChevronRight, Calendar, Sparkles, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GoalCategory } from "@prisma/client";

interface OneYearGoal {
  id: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  progress: number;
  threeYearGoal?: {
    id: string;
    title: string;
    sevenYearVision?: {
      id: string;
      title: string;
    } | null;
  } | null;
}

interface WeeklyGoal {
  id: string;
  title: string;
  category: GoalCategory;
  monthlyGoal?: {
    id: string;
    title: string;
    oneYearGoal?: {
      id: string;
      title: string;
    } | null;
  } | null;
}

interface YearTargetHeaderProps {
  oneYearGoal?: OneYearGoal | null;
  weeklyGoal?: WeeklyGoal | null;
  tasksTotal?: number;
  goalAlignedTasks?: number;
  className?: string;
}

const CATEGORY_BG: Record<GoalCategory, string> = {
  HEALTH: "bg-zen-green/10 border-zen-green/20",
  WEALTH: "bg-lantern/10 border-lantern/20",
  RELATIONSHIPS: "bg-zen-red/10 border-zen-red/20",
  CAREER: "bg-zen-blue/10 border-zen-blue/20",
  PERSONAL_GROWTH: "bg-zen-purple/10 border-zen-purple/20",
  LIFESTYLE: "bg-moon-soft/10 border-moon-soft/20",
  LIFE_MAINTENANCE: "bg-moon-faint/10 border-moon-faint/20",
  OTHER: "bg-moon-dim/10 border-moon-dim/20",
};

export function YearTargetHeader({
  oneYearGoal,
  weeklyGoal,
  tasksTotal = 0,
  goalAlignedTasks = 0,
  className,
}: YearTargetHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // No 1-year goal set - show prompt to create one
  if (!oneYearGoal) {
    return (
      <div className={cn("mb-5 sm:mb-6", className)}>
        <Link
          href="/goals?view=1-year"
          className="block p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-dashed border-night-glow bg-night-soft/50 hover:border-lantern/30 hover:bg-night-soft transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-lantern/10 border border-lantern/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-lantern" />
            </div>
            <div className="flex-1">
              <h3 className="text-moon font-medium mb-1">Set Your 1-Year Target</h3>
              <p className="text-sm text-moon-dim">
                The 1-Year Target is your decision filter. Every task should move you toward it.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-moon-faint group-hover:text-lantern transition-colors" />
          </div>
        </Link>
      </div>
    );
  }

  const categoryBg = CATEGORY_BG[oneYearGoal.category];
  const progress = oneYearGoal.progress || 0;
  const alignmentPercent = tasksTotal > 0 ? Math.round((goalAlignedTasks / tasksTotal) * 100) : 0;

  return (
    <div className={cn("mb-5 sm:mb-6", className)}>
      {/* Main 1-Year Target Card */}
      <div className={cn("rounded-xl sm:rounded-2xl border overflow-hidden", categoryBg)}>
        {/* Header */}
        <div className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
              "bg-gradient-to-br from-lantern/20 to-lantern/5 border border-lantern/30"
            )}>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-lantern" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-lantern">
                  1-Year Target
                </span>
                {oneYearGoal.threeYearGoal?.sevenYearVision && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-moon-faint hover:text-moon-soft transition-colors p-0.5"
                    title="Show goal hierarchy"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <Link
                href={`/goals/${oneYearGoal.id}`}
                className="block group"
              >
                <h2 className="text-lg sm:text-xl font-medium text-moon group-hover:text-lantern transition-colors line-clamp-2">
                  {oneYearGoal.title}
                </h2>
              </Link>

              {/* Progress Bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-void/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lantern to-lantern-soft rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-moon-soft tabular-nums">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Hierarchy */}
          {isExpanded && oneYearGoal.threeYearGoal && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              {oneYearGoal.threeYearGoal.sevenYearVision && (
                <Link
                  href={`/goals/${oneYearGoal.threeYearGoal.sevenYearVision.id}`}
                  className="flex items-center gap-2 text-sm text-moon-dim hover:text-moon-soft transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zen-purple" />
                  <span className="text-[0.625rem] uppercase tracking-wider text-moon-faint">7-Year Vision:</span>
                  <span className="truncate">{oneYearGoal.threeYearGoal.sevenYearVision.title}</span>
                </Link>
              )}
              <Link
                href={`/goals/${oneYearGoal.threeYearGoal.id}`}
                className="flex items-center gap-2 text-sm text-moon-dim hover:text-moon-soft transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-zen-blue" />
                <span className="text-[0.625rem] uppercase tracking-wider text-moon-faint">3-Year Goal:</span>
                <span className="truncate">{oneYearGoal.threeYearGoal.title}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Weekly Focus Strip */}
        {weeklyGoal && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-void/30 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-zen-green flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[0.625rem] uppercase tracking-wider text-moon-faint mr-2">
                  This Week:
                </span>
                <Link
                  href={`/goals/${weeklyGoal.id}`}
                  className="text-sm text-moon-soft hover:text-moon transition-colors"
                >
                  {weeklyGoal.title}
                </Link>
              </div>
              {tasksTotal > 0 && (
                <div className="flex items-center gap-2 text-xs text-moon-faint">
                  <span className="tabular-nums">
                    {goalAlignedTasks}/{tasksTotal} aligned
                  </span>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[0.625rem] font-medium",
                    alignmentPercent >= 75 ? "bg-zen-green/20 text-zen-green" :
                    alignmentPercent >= 50 ? "bg-lantern/20 text-lantern" :
                    "bg-moon-dim/20 text-moon-dim"
                  )}>
                    {alignmentPercent}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

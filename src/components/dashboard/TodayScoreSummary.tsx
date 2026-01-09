"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Target, Flame, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodayScoreSummaryProps {
  points: number;
  streak: number;
  alignmentPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * Collapsible stats panel with single "Today's score" summary (6.2)
 * Shows a compact score by default, expands to show full stats
 */
export function TodayScoreSummary({
  points,
  streak,
  alignmentPercentage,
  tasksCompleted,
  totalTasks,
  className,
  defaultExpanded = false,
}: TodayScoreSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Calculate composite score (weighted average)
  const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const streakBonus = Math.min(streak * 2, 20); // Max 20% bonus from streak
  const compositeScore = Math.round(
    (completionRate * 0.4) + (alignmentPercentage * 0.4) + streakBonus
  );

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Great";
    if (score >= 60) return "Good";
    if (score >= 40) return "Building";
    return "Getting started";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-zen-green";
    if (score >= 75) return "text-lantern";
    if (score >= 60) return "text-zen-blue";
    if (score >= 40) return "text-moon";
    return "text-moon-dim";
  };

  return (
    <div className={cn("bg-night-soft rounded-xl border border-night-mist", className)}>
      {/* Collapsed Summary */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
              compositeScore >= 75 ? "bg-lantern/10" : "bg-night"
            )}
          >
            <span className={getScoreColor(compositeScore)}>{compositeScore}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-moon">Today's Score</p>
            <p className={cn("text-xs", getScoreColor(compositeScore))}>
              {getScoreLabel(compositeScore)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick glance mini stats */}
          {!isExpanded && (
            <div className="hidden sm:flex items-center gap-3 text-xs text-moon-dim">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {tasksCompleted}/{totalTasks}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {streak}
              </span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-moon-dim" />
          ) : (
            <ChevronDown className="w-5 h-5 text-moon-dim" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-night-mist pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-night rounded-lg">
              <Target className="w-5 h-5 text-lantern mx-auto mb-1" />
              <p className="text-lg font-semibold text-moon">
                {tasksCompleted}/{totalTasks}
              </p>
              <p className="text-xs text-moon-dim">Tasks</p>
            </div>

            <div className="text-center p-3 bg-night rounded-lg">
              <Flame className="w-5 h-5 text-zen-red mx-auto mb-1" />
              <p className="text-lg font-semibold text-moon">{streak}</p>
              <p className="text-xs text-moon-dim">Day Streak</p>
            </div>

            <div className="text-center p-3 bg-night rounded-lg">
              <TrendingUp className="w-5 h-5 text-zen-green mx-auto mb-1" />
              <p className="text-lg font-semibold text-moon">{alignmentPercentage}%</p>
              <p className="text-xs text-moon-dim">Aligned</p>
            </div>

            <div className="text-center p-3 bg-night rounded-lg">
              <Star className="w-5 h-5 text-lantern mx-auto mb-1" />
              <p className="text-lg font-semibold text-moon">{points}</p>
              <p className="text-xs text-moon-dim">Points</p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="mt-4 pt-4 border-t border-night-mist">
            <p className="text-xs text-moon-dim mb-2">Score Breakdown</p>
            <div className="space-y-2">
              <ScoreBar
                label="Task Completion"
                value={completionRate}
                weight="40%"
              />
              <ScoreBar
                label="Goal Alignment"
                value={alignmentPercentage}
                weight="40%"
              />
              <ScoreBar
                label="Streak Bonus"
                value={streakBonus * 5}
                weight="20%"
                max={100}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  weight,
  max = 100,
}: {
  label: string;
  value: number;
  weight: string;
  max?: number;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-moon-dim w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-night rounded-full overflow-hidden">
        <div
          className="h-full bg-lantern/60 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-moon-faint w-8">{weight}</span>
    </div>
  );
}

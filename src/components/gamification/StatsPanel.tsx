"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreakDisplay } from "./StreakDisplay";
import { LevelProgress } from "./LevelProgress";
import { NextBadgeCard } from "./NextBadgeCard";
import { TodayStats } from "./TodayStats";
import { GoalAlignment } from "./GoalAlignment";
import { KaizenCheckin } from "./KaizenCheckin";
import { BadgeGrid } from "./BadgeGrid";
import { TodayScoreSummary } from "../dashboard/TodayScoreSummary";
import { ContextualTip } from "@/components/onboarding";

interface StatsPanelProps {
  streak?: number;
  streakFreezes?: number;
  level?: {
    name: string;
    currentXp: number;
    requiredXp: number;
  };
  today?: {
    tasksCompleted: number;
    tasksTotal: number;
    pointsEarned: number;
  };
  goalAlignment?: number;
  linkedTasks?: number;
  totalTasks?: number;
  kaizenComplete?: boolean;
  kaizenAreas?: Array<{
    id: string;
    name: string;
    icon: string;
    checked: boolean;
  }>;
  badges?: Array<{
    id: string;
    icon: string;
    name: string;
    earned: boolean;
  }>;
  onKaizenSave?: (areas: string[]) => void;
  className?: string;
}

export function StatsPanel({
  streak = 0,
  streakFreezes = 0,
  level = { name: "Beginner", currentXp: 0, requiredXp: 500 },
  today = { tasksCompleted: 0, tasksTotal: 0, pointsEarned: 0 },
  goalAlignment = 0,
  linkedTasks = 0,
  totalTasks = 0,
  kaizenComplete = false,
  kaizenAreas,
  badges = [],
  onKaizenSave,
  className,
}: StatsPanelProps) {
  // Collapsible state for detailed stats section (6.2)
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className={cn(className)}>
      <div className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-moon-faint mb-4">
        Your Journey
      </div>

      {/* Today's Score Summary (6.2) - Collapsed view of key stats */}
      <TodayScoreSummary
        points={today.pointsEarned}
        streak={streak}
        alignmentPercentage={goalAlignment}
        tasksCompleted={today.tasksCompleted}
        totalTasks={today.tasksTotal}
        className="mb-6"
      />

      {/* Collapsible Details Section */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-2 mb-4 text-xs text-moon-dim hover:text-moon transition-colors"
      >
        <span className="font-medium uppercase tracking-wider">
          {showDetails ? "Hide Details" : "Show Details"}
        </span>
        {showDetails ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {showDetails && (
        <div className="space-y-0">
          <StreakDisplay days={streak} freezesAvailable={streakFreezes} />

          {/* Streak building tip - show when user is just starting out */}
          {streak <= 3 && (
            <ContextualTip tipId="streak_building" variant="inline" className="mb-4 px-1" />
          )}

          <LevelProgress
            levelName={level.name}
            currentXp={level.currentXp}
            requiredXp={level.requiredXp}
          />

          <NextBadgeCard className="mb-6" />

          <TodayStats
            tasksCompleted={today.tasksCompleted}
            tasksTotal={today.tasksTotal}
            pointsEarned={today.pointsEarned}
          />

          <GoalAlignment
            percentage={goalAlignment}
            linkedCount={linkedTasks}
            totalCount={totalTasks}
          />

          <KaizenCheckin
            areas={kaizenAreas}
            isComplete={kaizenComplete}
            onSave={onKaizenSave}
          />

          {badges.length > 0 && <BadgeGrid badges={badges} />}
        </div>
      )}
    </div>
  );
}

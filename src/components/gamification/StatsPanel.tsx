"use client";

import { cn } from "@/lib/utils";
import { StreakDisplay } from "./StreakDisplay";
import { LevelProgress } from "./LevelProgress";
import { TodayStats } from "./TodayStats";
import { GoalAlignment } from "./GoalAlignment";
import { KaizenCheckin } from "./KaizenCheckin";
import { BadgeGrid } from "./BadgeGrid";

interface StatsPanelProps {
  streak?: number;
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
  level = { name: "Beginner", currentXp: 0, requiredXp: 500 },
  today = { tasksCompleted: 0, tasksTotal: 0, pointsEarned: 0 },
  goalAlignment = 0,
  kaizenComplete = false,
  kaizenAreas,
  badges = [],
  onKaizenSave,
  className,
}: StatsPanelProps) {
  return (
    <div className={cn(className)}>
      <div className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-moon-faint mb-8">
        Your Journey
      </div>

      <StreakDisplay days={streak} />

      <LevelProgress
        levelName={level.name}
        currentXp={level.currentXp}
        requiredXp={level.requiredXp}
      />

      <TodayStats
        tasksCompleted={today.tasksCompleted}
        tasksTotal={today.tasksTotal}
        pointsEarned={today.pointsEarned}
      />

      <GoalAlignment percentage={goalAlignment} />

      <KaizenCheckin
        areas={kaizenAreas}
        isComplete={kaizenComplete}
        onSave={onKaizenSave}
      />

      {badges.length > 0 && <BadgeGrid badges={badges} />}
    </div>
  );
}

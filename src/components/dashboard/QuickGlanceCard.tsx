"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Flame,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: "MIT" | "PRIMARY" | "SECONDARY";
  completed: boolean;
  estimatedMinutes?: number | null;
}

interface QuickGlanceCardProps {
  tasks: Task[];
  streak: number;
  alignmentPercentage: number;
  points: number;
  className?: string;
}

/**
 * Unified "Quick glance" dashboard summary card (6.6)
 * Single card with all critical daily info
 */
export function QuickGlanceCard({
  tasks,
  streak,
  alignmentPercentage,
  points,
  className,
}: QuickGlanceCardProps) {
  const stats = useMemo(() => {
    const mit = tasks.find((t) => t.priority === "MIT");
    const primaryTasks = tasks.filter((t) => t.priority === "PRIMARY");
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const remainingTime = tasks
      .filter((t) => !t.completed)
      .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

    return {
      mit,
      primaryTasks,
      completed,
      total,
      remainingTime,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-night via-night-soft to-night rounded-xl border border-night-mist overflow-hidden",
        className
      )}
    >
      {/* Header with greeting */}
      <div className="p-4 border-b border-night-mist">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-moon">{getGreeting()}</h2>
          <div className="flex items-center gap-3">
            <StatPill
              icon={<Flame className="w-3 h-3" />}
              value={streak}
              label="streak"
              color="text-zen-red"
            />
            <StatPill
              icon={<TrendingUp className="w-3 h-3" />}
              value={`${alignmentPercentage}%`}
              label="aligned"
              color="text-zen-green"
            />
          </div>
        </div>
      </div>

      {/* MIT Focus */}
      <div className="p-4 bg-lantern/5 border-b border-night-mist">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
              stats.mit?.completed
                ? "border-zen-green bg-zen-green"
                : "border-lantern"
            )}
          >
            {stats.mit?.completed && (
              <CheckCircle2 className="w-3 h-3 text-void" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-lantern font-medium mb-1">
              Today&apos;s MIT
            </p>
            {stats.mit ? (
              <p
                className={cn(
                  "text-sm",
                  stats.mit.completed
                    ? "text-moon-dim line-through"
                    : "text-moon font-medium"
                )}
              >
                {stats.mit.title}
              </p>
            ) : (
              <Link
                href="/dashboard"
                className="text-sm text-moon-dim hover:text-lantern transition-colors flex items-center gap-1"
              >
                Set your MIT
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-moon-dim" />
            <span className="text-sm text-moon">
              {stats.completed} of {stats.total} tasks
            </span>
          </div>
          {stats.remainingTime > 0 && (
            <span className="text-xs text-moon-faint flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{formatTime(stats.remainingTime)} left
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-night rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lantern to-zen-green rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>

        {/* Quick task preview */}
        {stats.primaryTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-night-mist">
            <p className="text-xs text-moon-dim mb-2">Up Next</p>
            <ul className="space-y-1.5">
              {stats.primaryTasks
                .filter((t) => !t.completed)
                .slice(0, 2)
                .map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 text-sm text-moon-dim"
                  >
                    <Circle className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{task.title}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* All done state */}
        {stats.completed === stats.total && stats.total > 0 && (
          <div className="mt-4 pt-3 border-t border-night-mist text-center">
            <p className="text-sm text-zen-green">
              ✓ All tasks completed! Great work!
            </p>
          </div>
        )}
      </div>

      {/* Footer with points */}
      <div className="px-4 py-3 bg-night flex items-center justify-between">
        <span className="text-xs text-moon-faint">Today&apos;s points</span>
        <span className="text-sm font-medium text-lantern">{points} pts</span>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-night rounded-full">
      <span className={color}>{icon}</span>
      <span className="text-xs font-medium text-moon">{value}</span>
      <span className="text-xs text-moon-faint hidden sm:inline">{label}</span>
    </div>
  );
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Compact version for mobile or sidebar
 */
export function QuickGlanceCompact({
  tasks,
  streak,
  className,
}: {
  tasks: Task[];
  streak: number;
  className?: string;
}) {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const mit = tasks.find((t) => t.priority === "MIT");

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 bg-night-soft rounded-lg border border-night-mist",
        className
      )}
    >
      {/* MIT status */}
      <div className="flex items-center gap-2">
        {mit?.completed ? (
          <CheckCircle2 className="w-5 h-5 text-zen-green" />
        ) : (
          <Target className="w-5 h-5 text-lantern" />
        )}
        <div>
          <p className="text-xs text-moon-dim">MIT</p>
          <p className="text-sm font-medium text-moon">
            {mit?.completed ? "Done" : "Pending"}
          </p>
        </div>
      </div>

      <div className="w-px h-8 bg-night-mist" />

      {/* Tasks */}
      <div>
        <p className="text-xs text-moon-dim">Tasks</p>
        <p className="text-sm font-medium text-moon">
          {completed}/{total}
        </p>
      </div>

      <div className="w-px h-8 bg-night-mist" />

      {/* Streak */}
      <div className="flex items-center gap-1">
        <Flame className="w-4 h-4 text-zen-red" />
        <span className="text-sm font-medium text-moon">{streak}</span>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Target,
  Zap,
  TrendingUp,
  Loader2
} from "lucide-react";

interface MonthlyStats {
  monthRange: {
    start: string;
    end: string;
    monthName: string;
  };
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    completionRate: number;
    mitCompleted: number;
    mitTotal: number;
    mitCompletionRate: number;
    goalsCompleted: number;
    goalsTotal: number;
    pointsEarned: number;
    daysInMonth: number;
  };
  goalAlignment: {
    alignmentRate: number;
  };
}

interface MonthSoFarCardProps {
  className?: string;
}

export function MonthSoFarCard({ className }: MonthSoFarCardProps) {
  const { data, isLoading } = useQuery<MonthlyStats>({
    queryKey: ["monthly-review", 0],
    queryFn: async () => {
      const res = await fetch("/api/review/monthly?monthOffset=0");
      if (!res.ok) throw new Error("Failed to fetch monthly stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate days into month
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = data?.stats.daysInMonth || 30;
  const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);

  if (isLoading) {
    return (
      <div className={cn("bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-moon-faint" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const stats = [
    {
      icon: CheckCircle2,
      label: "Tasks Done",
      value: data.stats.tasksCompleted,
      subtext: `of ${data.stats.totalTasks}`,
      color: "text-zen-green",
    },
    {
      icon: Target,
      label: "MITs Done",
      value: data.stats.mitCompleted,
      subtext: `of ${data.stats.mitTotal}`,
      color: "text-lantern",
    },
    {
      icon: Zap,
      label: "Points",
      value: data.stats.pointsEarned.toLocaleString(),
      subtext: "earned",
      color: "text-zen-purple",
    },
    {
      icon: TrendingUp,
      label: "Alignment",
      value: `${data.goalAlignment.alignmentRate}%`,
      subtext: "goal-linked",
      color: "text-zen-blue",
    },
  ];

  return (
    <div className={cn("bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zen-blue/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-zen-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            This Month So Far
          </h3>
          <p className="text-base sm:text-lg font-semibold text-moon">
            {now.toLocaleDateString("en-US", { month: "long" })}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-bold text-moon">{dayOfMonth}</span>
          <span className="text-xs text-moon-faint ml-1">/ {daysInMonth}</span>
        </div>
      </div>

      {/* Month Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-moon-dim">Month Progress</span>
          <span className="text-xs font-medium text-moon">{monthProgress}%</span>
        </div>
        <div className="h-1.5 bg-night-mist rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-zen-blue to-zen-purple rounded-full transition-all duration-500"
            style={{ width: `${monthProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-night-soft rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                <span className="text-[0.625rem] sm:text-xs text-moon-faint">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold text-moon">{stat.value}</span>
                <span className="text-[0.625rem] sm:text-xs text-moon-faint">{stat.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate Summary */}
      <div className="mt-4 pt-4 border-t border-night-mist">
        <div className="flex items-center justify-between">
          <span className="text-xs text-moon-dim">Task Completion Rate</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-night-mist rounded-full overflow-hidden">
              <div
                className="h-full bg-zen-green rounded-full"
                style={{ width: `${data.stats.completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium text-moon">{data.stats.completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Encouragement Messages */}
      {data.stats.mitCompletionRate >= 80 && (
        <div className="mt-4 p-3 bg-zen-green/10 rounded-lg">
          <p className="text-xs text-zen-green">
            Amazing consistency! You&apos;ve completed your MIT {data.stats.mitCompletionRate}% of the time this month.
          </p>
        </div>
      )}
      {data.stats.mitCompletionRate < 50 && dayOfMonth > 7 && (
        <div className="mt-4 p-3 bg-lantern/10 rounded-lg">
          <p className="text-xs text-lantern">
            Focus on your MIT to build momentum. Even completing 1 important task daily compounds over time.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUserStats } from "@/hooks";
import { cn, formatLocalDate } from "@/lib/utils";
import {
  AlertTriangle,
  Flame,
  Target,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface StreakAtRiskNudgeProps {
  onTakeAction?: (streakType: string) => void;
}

// Streak type display names and actions
const STREAK_INFO: Record<
  string,
  { name: string; action: string; icon: typeof Flame; urgent: boolean }
> = {
  MIT_COMPLETION: {
    name: "MIT Streak",
    action: "Complete your Most Important Task",
    icon: Target,
    urgent: true,
  },
  DAILY_PLANNING: {
    name: "Planning Streak",
    action: "Complete daily planning",
    icon: Calendar,
    urgent: true,
  },
  KAIZEN_CHECKIN: {
    name: "Kaizen Streak",
    action: "Do your evening reflection",
    icon: Sparkles,
    urgent: false,
  },
  WEEKLY_REVIEW: {
    name: "Weekly Review Streak",
    action: "Complete weekly review",
    icon: CheckCircle2,
    urgent: false,
  },
  MONTHLY_REVIEW: {
    name: "Monthly Review Streak",
    action: "Complete monthly review",
    icon: CheckCircle2,
    urgent: false,
  },
};

// Check if action was done today (client-side approximation)
function wasActionToday(lastActionAt: Date | string | null): boolean {
  if (!lastActionAt) return false;
  const lastAction = new Date(lastActionAt);
  const today = new Date();
  return (
    lastAction.getDate() === today.getDate() &&
    lastAction.getMonth() === today.getMonth() &&
    lastAction.getFullYear() === today.getFullYear()
  );
}

// Get storage key for today's dismissal
function getTodayDismissKey(): string {
  return `streak_risk_dismissed_${formatLocalDate()}`;
}

// Check if nudge was dismissed today
function wasDismissedToday(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getTodayDismissKey()) === "true";
}

// Mark as dismissed for today
function dismissForToday(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getTodayDismissKey(), "true");
}

export function StreakAtRiskNudge({ onTakeAction }: StreakAtRiskNudgeProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: stats } = useUserStats();

  const streaks = stats?.streaks || [];

  // Find streaks at risk (active streak but not completed today)
  const streaksAtRisk = useMemo(() => {
    return streaks
      .filter((streak) => {
        // Has an active streak (count > 1)
        if (streak.currentCount <= 1) return false;
        // Not completed today
        if (wasActionToday(streak.lastActionAt)) return false;
        // Only show daily streaks (MIT, DAILY_PLANNING, KAIZEN)
        // Weekly/Monthly reviews have different cadences
        const dailyStreaks = ["MIT_COMPLETION", "DAILY_PLANNING", "KAIZEN_CHECKIN"];
        return dailyStreaks.includes(streak.type);
      })
      .map((streak) => ({
        ...streak,
        info: STREAK_INFO[streak.type] || {
          name: streak.type,
          action: "Complete action",
          icon: Flame,
          urgent: false,
        },
      }))
      .sort((a, b) => b.currentCount - a.currentCount); // Highest streak first
  }, [streaks]);

  // Mount check for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-show logic - afternoon/evening (12pm-9pm)
  useEffect(() => {
    if (!mounted) return;

    const hour = new Date().getHours();
    const isAfternoonEvening = hour >= 12 && hour < 21;

    // Show if: afternoon/evening, has at-risk streaks, not dismissed today
    const shouldShow =
      isAfternoonEvening && streaksAtRisk.length > 0 && !wasDismissedToday();

    if (shouldShow) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [mounted, streaksAtRisk]);

  const handleDismiss = () => {
    dismissForToday();
    setOpen(false);
  };

  const handleTakeAction = (streakType: string) => {
    setOpen(false);
    onTakeAction?.(streakType);
  };

  if (!mounted || streaksAtRisk.length === 0) return null;

  const highestRiskStreak = streaksAtRisk[0];
  const totalDaysAtRisk = streaksAtRisk.reduce(
    (sum, s) => sum + s.currentCount,
    0
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleDismiss()}>
      <DialogContent className="bg-night border-night-glow max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-moon text-xl">
                Streak at Risk!
              </DialogTitle>
              <DialogDescription className="text-moon-dim">
                {streaksAtRisk.length === 1
                  ? `Your ${highestRiskStreak.currentCount}-day streak is in danger`
                  : `${streaksAtRisk.length} streaks need attention`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stats Banner */}
        <div className="flex items-center justify-center gap-6 py-3 bg-night-soft/50 rounded-xl border border-night-glow">
          <div className="text-center">
            <div className="text-3xl font-light text-amber-400">
              {totalDaysAtRisk}
            </div>
            <div className="text-xs text-moon-dim">days at risk</div>
          </div>
          <div className="h-10 w-px bg-night-glow" />
          <div className="text-center">
            <div className="text-3xl font-light text-moon">
              {streaksAtRisk.length}
            </div>
            <div className="text-xs text-moon-dim">
              streak{streaksAtRisk.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* At-Risk Streaks List */}
        <div className="space-y-2 my-4">
          {streaksAtRisk.map((streak) => {
            const Icon = streak.info.icon;
            return (
              <div
                key={streak.type}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border",
                  "bg-night-soft/50 border-night-glow",
                  "hover:border-amber-500/30 transition-colors"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      streak.info.urgent
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zen-purple/20 text-zen-purple"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-moon font-medium text-sm">
                      {streak.info.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-moon-dim">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {streak.currentCount} day
                      {streak.currentCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTakeAction(streak.type)}
                  className="text-zen-green hover:text-zen-green hover:bg-zen-green/10"
                >
                  Save it
                </Button>
              </div>
            );
          })}
        </div>

        {/* Motivation Message */}
        <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 rounded-xl p-4 border border-amber-500/20">
          <p className="text-moon text-sm">
            <Flame className="w-4 h-4 inline mr-1 text-amber-400" />
            Don&apos;t let your progress slip away. A few minutes now saves days of
            building back up.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="flex-1 text-moon-dim hover:text-moon"
          >
            Remind Later
          </Button>
          <Button
            onClick={() => handleTakeAction(highestRiskStreak.type)}
            className="flex-1 bg-amber-500 text-void hover:bg-amber-500/90"
          >
            Save My Streak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

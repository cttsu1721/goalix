"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTasks, useGoals, useUserStats } from "@/hooks";
import { formatLocalDate } from "@/lib/utils";
import { Sunrise, Sparkles, Target, Flame, Calendar, ArrowRight } from "lucide-react";

interface MorningPlanningPromptProps {
  onStartPlanning: () => void;
}

// Check if it's morning (6am - 10am)
function isMorningHours(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 10;
}

// Get storage key for today
function getTodayDismissKey(): string {
  return `morning_prompt_dismissed_${formatLocalDate()}`;
}

// Check if prompt was dismissed today
function wasDismissedToday(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getTodayDismissKey()) === "true";
}

// Mark as dismissed for today
function dismissForToday(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getTodayDismissKey(), "true");
}

export function MorningPlanningPrompt({ onStartPlanning }: MorningPlanningPromptProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const today = formatLocalDate();
  const { data: tasksData, isLoading: tasksLoading } = useTasks(today);
  const { data: weeklyGoalsData } = useGoals("weekly");
  const { data: stats } = useUserStats();

  const tasks = tasksData?.tasks || [];
  const weeklyGoals = (weeklyGoalsData?.goals || []) as Array<{ id: string; title: string }>;
  const hasMit = tasks.some((t) => t.priority === "MIT");
  const hasAnyTasks = tasks.length > 0;

  // Get best active streak from streaks array
  const streaks = stats?.streaks || [];
  const bestStreak = streaks.reduce((best, s) => (s.currentCount > best ? s.currentCount : best), 0);

  // Mount check for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-show logic
  useEffect(() => {
    if (!mounted || tasksLoading) return;

    // Check conditions:
    // 1. Is morning hours (6am-10am)
    // 2. No MIT set for today
    // 3. Not already dismissed today
    const shouldShow = isMorningHours() && !hasMit && !wasDismissedToday();

    if (shouldShow) {
      // Small delay to not be jarring on page load
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [mounted, tasksLoading, hasMit]);

  const handleDismiss = () => {
    dismissForToday();
    setOpen(false);
  };

  const handleStartPlanning = () => {
    dismissForToday();
    setOpen(false);
    onStartPlanning();
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleDismiss()}>
      <DialogContent className="bg-night border-night-glow max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Sunrise className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-moon text-xl">
                Good Morning!
              </DialogTitle>
              <DialogDescription className="text-moon-dim">
                Ready to plan a focused day?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Context Cards */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {/* Streak Card */}
          <div className="p-3 bg-night-soft rounded-xl border border-night-glow">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-medium">Streak</span>
            </div>
            <div className="text-2xl font-light text-moon">
              {bestStreak}
              <span className="text-sm text-moon-dim ml-1">days</span>
            </div>
          </div>

          {/* Weekly Goals Card */}
          <div className="p-3 bg-night-soft rounded-xl border border-night-glow">
            <div className="flex items-center gap-2 text-zen-purple mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">Weekly Goals</span>
            </div>
            <div className="text-2xl font-light text-moon">
              {weeklyGoals.length}
              <span className="text-sm text-moon-dim ml-1">active</span>
            </div>
          </div>
        </div>

        {/* Message based on state */}
        <div className="bg-night-soft/50 rounded-xl p-4 border border-night-glow">
          {!hasAnyTasks ? (
            <div className="space-y-2">
              <p className="text-moon text-sm">
                <Sparkles className="w-4 h-4 inline mr-1 text-lantern" />
                Start fresh! Set your <strong>Most Important Task</strong> to make today count.
              </p>
              <p className="text-moon-dim text-xs">
                The MIT is the one thing that, if completed, will make your day a success.
              </p>
            </div>
          ) : !hasMit ? (
            <div className="space-y-2">
              <p className="text-moon text-sm">
                <Calendar className="w-4 h-4 inline mr-1 text-zen-green" />
                You have {tasks.length} task{tasks.length !== 1 ? "s" : ""} planned, but no MIT set.
              </p>
              <p className="text-moon-dim text-xs">
                Choose your Most Important Task to stay focused on what matters most.
              </p>
            </div>
          ) : null}
        </div>

        {/* Weekly Goals Preview */}
        {weeklyGoals.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-moon-dim mb-2">This week&apos;s focus:</p>
            <div className="flex flex-wrap gap-2">
              {weeklyGoals.slice(0, 3).map((goal) => (
                <span
                  key={goal.id}
                  className="text-xs px-2 py-1 bg-zen-purple/10 text-zen-purple rounded-full"
                >
                  {goal.title.length > 30 ? `${goal.title.slice(0, 30)}...` : goal.title}
                </span>
              ))}
              {weeklyGoals.length > 3 && (
                <span className="text-xs px-2 py-1 text-moon-dim">
                  +{weeklyGoals.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="flex-1 text-moon-dim hover:text-moon"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleStartPlanning}
            className="flex-1 bg-lantern text-void hover:bg-lantern/90"
          >
            Plan My Day
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

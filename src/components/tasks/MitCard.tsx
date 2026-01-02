"use client";

import { cn } from "@/lib/utils";
import { Check, Sparkles, Trophy, Target, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoalChain {
  weeklyGoal?: {
    id: string;
    title: string;
  } | null;
  oneYearGoal?: {
    id: string;
    title: string;
  } | null;
}

interface MitCardProps {
  task?: {
    id: string;
    title: string;
    category: string;
    estimatedMinutes?: number;
    completed: boolean;
    goalChain?: GoalChain;
  };
  onToggle?: () => void;
  onAiSuggest?: () => void;
  className?: string;
}

export function MitCard({ task, onToggle, onAiSuggest, className }: MitCardProps) {
  if (!task) {
    return (
      <section className={cn("mb-8 sm:mb-12", className)}>
        <div className="bg-night border border-night-mist rounded-2xl sm:rounded-[20px] p-5 sm:p-8 relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-lantern/5 to-transparent pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-lantern" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-lantern">
                Most Important Task
              </span>
            </div>
            <div className="text-center py-6 sm:py-8">
              <p className="text-moon-dim mb-4 text-sm sm:text-base">No MIT set for today</p>
              <Button
                variant="outline"
                onClick={onAiSuggest}
                className="bg-night-soft border-night-mist text-moon-soft hover:border-lantern hover:text-lantern hover:bg-lantern/5 h-11 px-5 rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Suggest MIT
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("mb-8 sm:mb-12", className)}>
      <div className="bg-night border border-night-mist rounded-2xl sm:rounded-[20px] p-5 sm:p-8 relative overflow-hidden">
        {/* Accent bar - adjusted for mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-[3px] bg-gradient-to-b from-lantern via-lantern/50 to-transparent" />

        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-lantern/5 to-transparent pointer-events-none" />

        <div className="relative pl-4 sm:pl-6">
          {/* Label */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-lantern" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-lantern">
                Most Important Task
              </span>
            </div>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              task.completed ? "text-zen-green" : "text-lantern"
            )}>
              {task.completed ? "+100" : "100"} pts
            </span>
          </div>

          {/* Content - mobile-first layout */}
          <div className="flex items-start gap-4">
            {/* Checkbox - 44px touch target */}
            <button
              onClick={onToggle}
              className={cn(
                // Large touch target
                "w-12 h-12 flex-shrink-0",
                "flex items-center justify-center",
                "-ml-1 -mt-1",
                "rounded-xl",
                "transition-all duration-300 active:scale-90"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-xl border-2",
                  "flex items-center justify-center",
                  "transition-all duration-300",
                  task.completed
                    ? "bg-lantern border-lantern shadow-lg shadow-lantern/30"
                    : "border-night-glow"
                )}
              >
                {task.completed && (
                  <Check className="w-5 h-5 text-void" strokeWidth={2.5} />
                )}
              </div>
            </button>

            {/* Body */}
            <div className="flex-1 min-w-0 pt-1">
              <h3
                className={cn(
                  "text-lg sm:text-xl font-medium leading-snug mb-2",
                  task.completed && "line-through text-moon-faint"
                )}
              >
                {task.title}
              </h3>

              {/* Goal Chain Connection */}
              {task.goalChain?.weeklyGoal ? (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-moon-dim mb-2">
                  <Target className="w-3.5 h-3.5 text-zen-green flex-shrink-0" />
                  <span className="truncate">
                    <span className="text-moon-faint">Supports:</span>{" "}
                    <span className="text-moon-soft">{task.goalChain.weeklyGoal.title}</span>
                    {task.goalChain.oneYearGoal && (
                      <>
                        <span className="text-moon-faint"> → </span>
                        <span className="text-lantern/80">{task.goalChain.oneYearGoal.title}</span>
                      </>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-moon-faint/70 mb-2">
                  <Link2Off className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Standalone task</span>
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-moon-faint">
                {task.estimatedMinutes && (
                  <span>
                    ~{Math.floor(task.estimatedMinutes / 60) > 0
                      ? `${Math.floor(task.estimatedMinutes / 60)}h`
                      : `${task.estimatedMinutes}m`}
                  </span>
                )}
                <span>{task.category}</span>
              </div>
            </div>
          </div>

          {/* AI Suggest - subtle, bottom aligned */}
          <div className="flex justify-end mt-4 sm:mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAiSuggest}
              className="text-moon-faint hover:text-lantern hover:bg-lantern/10 text-xs h-8 px-3 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Suggest
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

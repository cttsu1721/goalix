"use client";

import { useState, useEffect } from "react";
import { X, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TipId =
  | "first_task"
  | "first_goal"
  | "decision_compass"
  | "mit_importance"
  | "weekly_review"
  | "kaizen_intro"
  | "streak_building"
  | "goal_hierarchy"
  | "ai_sharpener"
  | "swipe_hint";

interface TipConfig {
  id: TipId;
  title: string;
  content: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const TIPS: Record<TipId, TipConfig> = {
  first_task: {
    id: "first_task",
    title: "Your First Task",
    content:
      "Tasks linked to weekly goals earn more points and keep you aligned with your vision. Try linking your tasks to goals!",
    action: { label: "Create a goal first", href: "/goals" },
  },
  first_goal: {
    id: "first_goal",
    title: "Start With Your Vision",
    content:
      "The best goals cascade from a clear vision. Start by defining your 7-year dream, then work backwards.",
    action: { label: "Create your vision", href: "/vision" },
  },
  decision_compass: {
    id: "decision_compass",
    title: "Decision Compass",
    content:
      "When creating unlinked tasks, ask yourself: does this move me toward my 1-year target? Focus prevents busy work.",
  },
  mit_importance: {
    id: "mit_importance",
    title: "Most Important Task",
    content:
      "Your MIT is the ONE task that, if completed, makes the biggest impact today. Complete it first thing!",
  },
  weekly_review: {
    id: "weekly_review",
    title: "Weekly Review",
    content:
      "Reflection compounds growth. Review your week every Sunday to set up the next week for success.",
    action: { label: "Start review", href: "/review/weekly" },
  },
  kaizen_intro: {
    id: "kaizen_intro",
    title: "Kaizen Check-in",
    content:
      "Small daily improvements add up. End each day by reflecting on which life areas you improved.",
  },
  streak_building: {
    id: "streak_building",
    title: "Build Your Streak",
    content:
      "Consistency beats intensity. Complete your MIT daily to build a streak and earn bonus points!",
  },
  goal_hierarchy: {
    id: "goal_hierarchy",
    title: "Goal Hierarchy",
    content:
      "Goals cascade: Vision → 3-Year → 1-Year → Monthly → Weekly → Daily. Each level should support the one above.",
  },
  ai_sharpener: {
    id: "ai_sharpener",
    title: "AI Goal Sharpener",
    content:
      "Vague goals stay dreams. Use AI to transform fuzzy goals into specific, measurable targets.",
    action: { label: "Try it out" },
  },
  swipe_hint: {
    id: "swipe_hint",
    title: "Swipe to Complete",
    content:
      "On mobile, swipe right on a task to mark it complete. Swipe left to undo.",
  },
};

const DISMISSED_TIPS_KEY = "goalzenix_dismissed_tips";

function getDismissedTips(): TipId[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(DISMISSED_TIPS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function dismissTip(tipId: TipId): void {
  const dismissed = getDismissedTips();
  if (!dismissed.includes(tipId)) {
    localStorage.setItem(
      DISMISSED_TIPS_KEY,
      JSON.stringify([...dismissed, tipId])
    );
  }
}

export function resetAllTips(): void {
  localStorage.removeItem(DISMISSED_TIPS_KEY);
}

interface ContextualTipProps {
  tipId: TipId;
  className?: string;
  variant?: "inline" | "card" | "banner";
  onAction?: () => void;
}

export function ContextualTip({
  tipId,
  className,
  variant = "card",
  onAction,
}: ContextualTipProps) {
  const [isDismissed, setIsDismissed] = useState(true);
  const tip = TIPS[tipId];

  useEffect(() => {
    const dismissed = getDismissedTips();
    setIsDismissed(dismissed.includes(tipId));
  }, [tipId]);

  const handleDismiss = () => {
    dismissTip(tipId);
    setIsDismissed(true);
  };

  if (isDismissed || !tip) return null;

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 text-xs text-moon-dim",
          className
        )}
      >
        <Lightbulb className="w-3.5 h-3.5 text-lantern flex-shrink-0 mt-0.5" />
        <span>{tip.content}</span>
        <button
          onClick={handleDismiss}
          className="text-moon-faint hover:text-moon ml-auto"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 bg-lantern/10 rounded-lg",
          className
        )}
      >
        <Lightbulb className="w-4 h-4 text-lantern flex-shrink-0" />
        <p className="text-sm text-moon flex-1">{tip.content}</p>
        <button
          onClick={handleDismiss}
          className="p-1 text-moon-faint hover:text-moon"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Default: card variant
  return (
    <div
      className={cn(
        "bg-night-soft border border-night-mist rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-lantern/10 rounded-lg flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-lantern" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-moon">{tip.title}</h4>
            <button
              onClick={handleDismiss}
              className="p-1 text-moon-faint hover:text-moon -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-moon-dim leading-relaxed">{tip.content}</p>
          {tip.action && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 -ml-2 text-lantern hover:text-lantern/80 text-xs h-7"
              onClick={() => {
                onAction?.();
                if (tip.action?.onClick) tip.action.onClick();
              }}
              asChild={!!tip.action.href}
            >
              {tip.action.href ? (
                <a href={tip.action.href}>
                  {tip.action.label}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <>
                  {tip.action.label}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if a tip should be shown
 */
export function useShouldShowTip(tipId: TipId): boolean {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const dismissed = getDismissedTips();
    setShouldShow(!dismissed.includes(tipId));
  }, [tipId]);

  return shouldShow;
}

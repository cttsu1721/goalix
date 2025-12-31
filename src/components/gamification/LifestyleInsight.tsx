"use client";

import { Sparkles, Flame, Trophy, Rocket, Crown } from "lucide-react";

interface LifestyleInsightProps {
  streaks: Array<{
    type: string;
    currentCount: number;
    longestCount: number;
    isActive: boolean;
  }>;
}

interface MilestoneMessage {
  days: number;
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

const MILESTONES: MilestoneMessage[] = [
  {
    days: 7,
    title: "One Week Strong",
    message: "You're building momentum. Keep pushing forward.",
    icon: <Flame className="w-5 h-5" />,
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    days: 14,
    title: "Two Weeks Consistent",
    message: "This is becoming part of your routine. You're rewiring your habits.",
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    days: 30,
    title: "30 Days Strong",
    message: "This is no longer effort — it's becoming lifestyle.",
    icon: <Trophy className="w-5 h-5" />,
    color: "from-lantern/20 to-yellow-500/20",
  },
  {
    days: 60,
    title: "60 Days Locked In",
    message: "Your conveyor belt is producing results. The compound effect is real.",
    icon: <Rocket className="w-5 h-5" />,
    color: "from-zen-purple/20 to-lantern/20",
  },
  {
    days: 90,
    title: "90 Days — Lifestyle Achieved",
    message: "This habit is now instinctual. You've changed the process, not just the outcome.",
    icon: <Crown className="w-5 h-5" />,
    color: "from-zen-green/20 to-zen-purple/20",
  },
];

function getHighestMilestone(count: number): MilestoneMessage | null {
  // Find the highest milestone the user has achieved
  const achieved = MILESTONES.filter((m) => count >= m.days);
  return achieved.length > 0 ? achieved[achieved.length - 1] : null;
}

function getNextMilestone(count: number): MilestoneMessage | null {
  return MILESTONES.find((m) => m.days > count) || null;
}

export function LifestyleInsight({ streaks }: LifestyleInsightProps) {
  // Find the highest active streak
  const activeStreaks = streaks.filter((s) => s.isActive && s.currentCount > 0);
  if (activeStreaks.length === 0) return null;

  const bestStreak = activeStreaks.reduce((best, current) =>
    current.currentCount > best.currentCount ? current : best
  );

  const milestone = getHighestMilestone(bestStreak.currentCount);
  const nextMilestone = getNextMilestone(bestStreak.currentCount);

  if (!milestone) return null;

  const daysToNext = nextMilestone
    ? nextMilestone.days - bestStreak.currentCount
    : null;

  return (
    <div
      className={`bg-gradient-to-br ${milestone.color} border border-night-mist rounded-2xl p-6 relative overflow-hidden`}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-lantern/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-night/50 backdrop-blur flex items-center justify-center text-lantern">
            {milestone.icon}
          </div>
          <div className="flex-1">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint mb-1">
              Lifestyle Insight
            </p>
            <h3 className="text-lg font-semibold text-moon">{milestone.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-lantern">{bestStreak.currentCount}</p>
            <p className="text-xs text-moon-faint">days</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-moon-soft text-sm leading-relaxed mb-4">
          {milestone.message}
        </p>

        {/* Next milestone progress */}
        {nextMilestone && daysToNext && (
          <div className="pt-4 border-t border-night-mist/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-moon-faint">Next: {nextMilestone.title}</span>
              <span className="text-moon-dim">{daysToNext} days to go</span>
            </div>
            <div className="h-1.5 bg-night/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lantern to-zen-green rounded-full transition-all duration-500"
                style={{
                  width: `${((bestStreak.currentCount - (MILESTONES[MILESTONES.indexOf(milestone)]?.days || 0)) / (nextMilestone.days - (milestone?.days || 0))) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Max milestone reached */}
        {!nextMilestone && (
          <div className="pt-4 border-t border-night-mist/50">
            <p className="text-xs text-zen-green flex items-center gap-2">
              <Crown className="w-3 h-3" />
              You&apos;ve reached the highest milestone. You&apos;re a true Fastlaner.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

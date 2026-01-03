"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface StreakDisplayProps {
  days: number;
  freezesAvailable?: number;
  className?: string;
}

export function StreakDisplay({ days, freezesAvailable = 0, className }: StreakDisplayProps) {
  // Show recovery message when starting fresh (0-1 days)
  const showRecoveryMessage = days <= 1;

  return (
    <div className={cn("mb-9", className)}>
      <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-4">
        Streak
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-light text-lantern leading-none">
          {days}
        </span>
        <span className="text-sm text-moon-faint font-light">days</span>
        {days > 0 && (
          <span className="text-2xl ml-2 animate-gentle-pulse">🔥</span>
        )}
      </div>

      {/* Recovery message for broken/new streaks */}
      {showRecoveryMessage && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-zen-green/10 rounded-lg border border-zen-green/20">
          <Sparkles className="w-4 h-4 text-zen-green shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-moon-soft">
              {days === 0
                ? "Start fresh today! Every streak begins with day one."
                : "You're building momentum! Keep it going."}
            </p>
            {freezesAvailable > 0 && (
              <p className="text-xs text-moon-faint mt-1">
                🧊 {freezesAvailable} streak freeze{freezesAvailable > 1 ? 's' : ''} available
              </p>
            )}
          </div>
        </div>
      )}

      {/* Milestone messages for active streaks */}
      {days >= 7 && days < 14 && (
        <p className="mt-3 text-xs text-moon-faint italic">
          One week strong! You&apos;re building momentum.
        </p>
      )}
      {days >= 14 && days < 30 && (
        <p className="mt-3 text-xs text-moon-faint italic">
          Two weeks consistent. This is becoming routine.
        </p>
      )}
      {days >= 30 && days < 60 && (
        <p className="mt-3 text-xs text-moon-faint italic">
          30 days! This is becoming lifestyle.
        </p>
      )}
      {days >= 60 && days < 90 && (
        <p className="mt-3 text-xs text-moon-faint italic">
          60 days. Your conveyor belt is producing results.
        </p>
      )}
      {days >= 90 && (
        <p className="mt-3 text-xs text-moon-faint italic">
          90+ days. This habit is now instinctual. 🏆
        </p>
      )}
    </div>
  );
}

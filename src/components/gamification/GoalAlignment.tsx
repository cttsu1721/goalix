"use client";

import { cn } from "@/lib/utils";

interface GoalAlignmentProps {
  percentage: number;
  className?: string;
}

export function GoalAlignment({ percentage, className }: GoalAlignmentProps) {
  const degrees = (percentage / 100) * 360;

  return (
    <div className={cn("mb-9", className)}>
      <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-4">
        Goal Alignment
      </div>
      <div className="flex flex-col items-center">
        {/* Conic gradient circle */}
        <div
          className="w-[120px] h-[120px] rounded-full flex items-center justify-center mb-4"
          style={{
            background: `conic-gradient(
              var(--zen-green) 0deg ${degrees}deg,
              var(--night-mist) ${degrees}deg 360deg
            )`,
          }}
        >
          <div className="w-[100px] h-[100px] bg-night rounded-full flex flex-col items-center justify-center">
            <div className="text-[1.75rem] font-light text-zen-green">
              {percentage}%
            </div>
          </div>
        </div>
        <div className="text-xs text-moon-faint text-center leading-relaxed">
          Tasks linked to goals
          <br />
          this week
        </div>
      </div>
    </div>
  );
}

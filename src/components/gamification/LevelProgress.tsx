"use client";

import { cn } from "@/lib/utils";

interface LevelProgressProps {
  levelName: string;
  currentXp: number;
  requiredXp: number;
  className?: string;
}

export function LevelProgress({
  levelName,
  currentXp,
  requiredXp,
  className,
}: LevelProgressProps) {
  const percentage = Math.min((currentXp / requiredXp) * 100, 100);

  return (
    <div className={cn("mb-9", className)}>
      <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-4">
        Level
      </div>
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-base font-normal text-moon">{levelName}</span>
        <span className="text-xs text-moon-faint">
          {currentXp.toLocaleString()} / {requiredXp.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 bg-night-mist rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 progress-gradient"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

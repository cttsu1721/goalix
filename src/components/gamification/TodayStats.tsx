"use client";

import { cn } from "@/lib/utils";

interface TodayStatsProps {
  tasksCompleted: number;
  tasksTotal: number;
  pointsEarned: number;
  className?: string;
}

export function TodayStats({
  tasksCompleted,
  tasksTotal,
  pointsEarned,
  className,
}: TodayStatsProps) {
  return (
    <div className={cn("mb-9", className)}>
      <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-4">
        Today
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-night-soft rounded-[14px] p-5 text-center">
          <div className="text-[1.75rem] font-light text-moon mb-1">
            {tasksCompleted}/{tasksTotal}
          </div>
          <div className="text-[0.6875rem] text-moon-faint uppercase tracking-[0.1em]">
            Tasks
          </div>
        </div>
        <div className="bg-night-soft rounded-[14px] p-5 text-center">
          <div className="text-[1.75rem] font-light text-moon mb-1">
            {pointsEarned}
          </div>
          <div className="text-[0.6875rem] text-moon-faint uppercase tracking-[0.1em]">
            Points
          </div>
        </div>
      </div>
    </div>
  );
}

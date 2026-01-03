"use client";

import { cn } from "@/lib/utils";
import { Target, AlertCircle, CheckCircle2 } from "lucide-react";

interface GoalAlignmentProps {
  percentage: number;
  linkedCount?: number;
  totalCount?: number;
  className?: string;
}

function getAlignmentColor(percentage: number): string {
  if (percentage >= 75) return "var(--zen-green)";
  if (percentage >= 50) return "var(--lantern)";
  if (percentage >= 25) return "var(--lantern)";
  return "var(--moon-dim)";
}

function getAlignmentTextColor(percentage: number): string {
  if (percentage >= 75) return "text-zen-green";
  if (percentage >= 50) return "text-lantern";
  if (percentage >= 25) return "text-lantern";
  return "text-moon-dim";
}

function getAlignmentMessage(percentage: number): { text: string; icon: React.ElementType } | null {
  if (percentage >= 80) return { text: "Laser focused", icon: CheckCircle2 };
  if (percentage >= 60) return { text: "On track", icon: Target };
  if (percentage < 40 && percentage > 0) return { text: "Link more tasks", icon: AlertCircle };
  return null;
}

export function GoalAlignment({
  percentage,
  linkedCount,
  totalCount,
  className,
}: GoalAlignmentProps) {
  const degrees = (percentage / 100) * 360;
  const color = getAlignmentColor(percentage);
  const textColor = getAlignmentTextColor(percentage);
  const message = getAlignmentMessage(percentage);

  return (
    <div className={cn("mb-9", className)}>
      <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-4">
        Goal Alignment
      </div>
      <div className="flex flex-col items-center">
        {/* Conic gradient circle */}
        <div
          className="w-[120px] h-[120px] rounded-full flex items-center justify-center mb-4 transition-all duration-500"
          style={{
            background: `conic-gradient(
              ${color} 0deg ${degrees}deg,
              var(--night-mist) ${degrees}deg 360deg
            )`,
          }}
        >
          <div className="w-[100px] h-[100px] bg-night rounded-full flex flex-col items-center justify-center">
            <div className={cn("text-[1.75rem] font-light transition-colors", textColor)}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Stats line */}
        {linkedCount !== undefined && totalCount !== undefined && totalCount > 0 && (
          <div className="text-sm text-moon-dim mb-1">
            <span className={textColor}>{linkedCount}</span>
            <span className="mx-1">/</span>
            <span>{totalCount} tasks aligned</span>
          </div>
        )}

        {/* Message badge */}
        {message && (
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2",
            percentage >= 80 ? "bg-zen-green/10 text-zen-green" :
            percentage >= 60 ? "bg-lantern/10 text-lantern" :
            "bg-moon-dim/10 text-moon-dim"
          )}>
            <message.icon className="w-3 h-3" />
            {message.text}
          </div>
        )}

        <div className="text-xs text-moon-faint text-center leading-relaxed mt-2">
          Tasks linked to goals today
        </div>
      </div>
    </div>
  );
}

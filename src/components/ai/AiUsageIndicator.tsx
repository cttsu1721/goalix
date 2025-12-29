"use client";

import { useAIUsage } from "@/hooks/useAI";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiUsageIndicatorProps {
  className?: string;
  variant?: "sidebar" | "compact";
}

export function AiUsageIndicator({
  className,
  variant = "sidebar",
}: AiUsageIndicatorProps) {
  const { data: usage, isLoading } = useAIUsage();

  const remaining = usage?.remaining ?? 5;
  const limit = usage?.limit ?? 5;
  const used = limit - remaining;
  const percentage = (used / limit) * 100;

  // Determine status color
  const getStatusColor = () => {
    if (remaining === 0) return "zen-red";
    if (remaining <= 2) return "lantern";
    return "zen-purple";
  };

  const statusColor = getStatusColor();

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs",
          className
        )}
      >
        <Sparkles className={cn("w-3.5 h-3.5", `text-${statusColor}`)} />
        <span className="text-moon-dim">
          {isLoading ? "..." : `${remaining}/${limit}`}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-4 py-3 bg-night-soft rounded-xl border border-night-mist",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className={cn("w-4 h-4", `text-${statusColor}`)} />
          <span className="text-xs font-medium text-moon-soft">AI Uses</span>
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            remaining === 0 ? "text-zen-red" : `text-${statusColor}`
          )}
        >
          {isLoading ? "..." : `${remaining}/${limit}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-night-mist rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            remaining === 0 && "bg-zen-red",
            remaining > 0 && remaining <= 2 && "bg-lantern",
            remaining > 2 && "bg-zen-purple"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Helper text */}
      <p className="text-[0.625rem] text-moon-faint mt-2">
        {remaining === 0
          ? "Resets at midnight"
          : remaining === 1
          ? "1 AI use remaining today"
          : `${remaining} AI uses remaining today`}
      </p>
    </div>
  );
}

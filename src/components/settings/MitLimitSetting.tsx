"use client";

import { Target, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MitLimitSettingProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const MIT_OPTIONS = [
  {
    value: 1,
    label: "1 MIT",
    description: "Maximum focus. One critical task per day.",
    recommended: true,
  },
  {
    value: 2,
    label: "2 MITs",
    description: "Balanced approach. Two important tasks.",
    recommended: false,
  },
  {
    value: 3,
    label: "3 MITs",
    description: "More flexibility. Three high-priority tasks.",
    recommended: false,
  },
];

export function MitLimitSetting({
  value,
  onChange,
  className,
}: MitLimitSettingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-lantern" />
          <label className="text-sm font-medium text-moon">
            Daily MIT Limit
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-moon-faint" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Your MIT (Most Important Task) is the single task that, if
                  completed, makes the biggest impact on your goals. We recommend
                  keeping this at 1 for maximum focus.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-xs text-moon-faint">{value} per day</span>
      </div>

      <div className="space-y-2">
        {MIT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
              "text-left",
              value === option.value
                ? "border-lantern bg-lantern/10"
                : "border-night-mist bg-night-soft hover:bg-night hover:border-night-glow"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                value === option.value
                  ? "border-lantern bg-lantern"
                  : "border-night-glow"
              )}
            >
              {value === option.value && (
                <Check className="w-3 h-3 text-void" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-moon">
                  {option.label}
                </span>
                {option.recommended && (
                  <span className="text-xs px-1.5 py-0.5 bg-zen-green/10 text-zen-green rounded">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-moon-dim mt-0.5">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact inline version
 */
export function MitLimitSettingInline({
  value,
  onChange,
  className,
}: MitLimitSettingProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label className="text-sm text-moon-dim">MIT Limit:</label>
      <div className="flex gap-1">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={cn(
              "w-8 h-8 rounded-lg font-medium transition-all",
              value === num
                ? "bg-lantern text-void"
                : "bg-night-soft text-moon-dim hover:bg-night-mist"
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

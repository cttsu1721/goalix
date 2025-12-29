"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KaizenArea {
  id: string;
  name: string;
  icon: string;
  checked: boolean;
}

interface KaizenCheckinProps {
  areas?: KaizenArea[];
  isComplete?: boolean;
  onSave?: (checkedAreas: string[]) => void;
  className?: string;
}

const defaultAreas: KaizenArea[] = [
  { id: "health", name: "Health", icon: "💪", checked: false },
  { id: "relationships", name: "Relations", icon: "❤️", checked: false },
  { id: "wealth", name: "Wealth", icon: "💰", checked: false },
  { id: "career", name: "Career", icon: "💼", checked: false },
  { id: "growth", name: "Growth", icon: "📚", checked: false },
  { id: "lifestyle", name: "Lifestyle", icon: "🌿", checked: false },
];

export function KaizenCheckin({
  areas = defaultAreas,
  isComplete = false,
  onSave,
  className,
}: KaizenCheckinProps) {
  const [checkedAreas, setCheckedAreas] = useState<Set<string>>(
    new Set(areas.filter((a) => a.checked).map((a) => a.id))
  );

  const toggleArea = (id: string) => {
    setCheckedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave?.(Array.from(checkedAreas));
  };

  const allChecked = checkedAreas.size === areas.length;
  const points = checkedAreas.size > 0 ? 10 : 0;
  const bonusPoints = allChecked ? 25 : 0;

  return (
    <div className={cn("mb-9", className)}>
      <div className="bg-night-soft rounded-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <span className="text-sm font-medium text-moon">Daily Reflection</span>
          <span
            className={cn(
              "text-[0.6875rem] px-2.5 py-1 rounded-lg",
              isComplete
                ? "text-zen-green bg-zen-green-soft"
                : "text-moon-faint bg-night-mist"
            )}
          >
            {isComplete ? "Complete" : "Pending"}
          </span>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {areas.map((area) => {
            const isChecked = checkedAreas.has(area.id);
            return (
              <button
                key={area.id}
                onClick={() => toggleArea(area.id)}
                className={cn(
                  "aspect-square rounded-[10px] flex flex-col items-center justify-center gap-1",
                  "transition-all duration-200",
                  "border border-transparent",
                  isChecked
                    ? "bg-zen-green-soft border-zen-green"
                    : "bg-night-mist hover:bg-night-glow"
                )}
              >
                <span
                  className={cn(
                    "text-xl",
                    isChecked ? "opacity-100" : "opacity-60"
                  )}
                >
                  {area.icon}
                </span>
                <span
                  className={cn(
                    "text-[0.5625rem] uppercase tracking-[0.1em]",
                    isChecked ? "text-zen-green" : "text-moon-faint"
                  )}
                >
                  {area.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSave}
          disabled={isComplete}
          className={cn(
            "w-full",
            "bg-night-mist hover:bg-lantern-soft",
            "text-moon-soft hover:text-lantern",
            "font-medium text-[0.8125rem]"
          )}
        >
          Save Reflection
        </Button>

        {/* Hint */}
        <div className="text-center text-[0.6875rem] text-moon-faint mt-3">
          +{points} pts · All 6 = +{bonusPoints} bonus
        </div>
      </div>
    </div>
  );
}

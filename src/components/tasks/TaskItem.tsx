"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    points: number;
  };
  onToggle?: () => void;
  onEdit?: () => void;
  className?: string;
}

export const TaskItem = memo(function TaskItem({ task, onToggle, onEdit, className }: TaskItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 sm:gap-4 py-4",
        "border-b border-night-soft last:border-b-0",
        "transition-all duration-200",
        // Touch feedback
        "active:bg-night-soft/50",
        className
      )}
    >
      {/* Checkbox - larger touch target for mobile */}
      <button
        className={cn(
          // 44px minimum touch target with visual 24px checkbox
          "w-11 h-11 sm:w-10 sm:h-10 flex-shrink-0",
          "flex items-center justify-center",
          "-ml-2 sm:-ml-1", // Negative margin to maintain visual alignment
          "rounded-xl",
          "transition-all duration-200 active:scale-90"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
      >
        <div
          className={cn(
            "w-6 h-6 sm:w-[22px] sm:h-[22px] rounded-lg border-2",
            "flex items-center justify-center",
            "transition-all duration-200",
            task.completed
              ? "bg-zen-green border-zen-green"
              : "border-night-glow"
          )}
        >
          {task.completed && (
            <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-void" strokeWidth={2.5} />
          )}
        </div>
      </button>

      {/* Content - tap to edit */}
      <button
        className="flex-1 text-left min-w-0"
        onClick={onEdit}
      >
        <div
          className={cn(
            "text-[0.9375rem] font-normal mb-0.5 truncate",
            task.completed
              ? "line-through text-moon-faint"
              : "text-moon"
          )}
        >
          {task.title}
        </div>
        <div className="text-xs text-moon-faint truncate">{task.category}</div>
      </button>

      {/* Points + Edit indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            task.completed ? "text-zen-green" : "text-moon-faint"
          )}
        >
          {task.completed ? `+${task.points}` : task.points}
        </span>
        {/* Chevron hint for edit - always visible on mobile */}
        <ChevronRight
          className={cn(
            "w-4 h-4 text-moon-faint/50",
            "sm:opacity-0 sm:group-hover:opacity-100",
            "transition-opacity"
          )}
        />
      </div>
    </div>
  );
});

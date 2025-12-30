"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Check, Pencil } from "lucide-react";

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
        "group flex items-center gap-[18px] py-5",
        "border-b border-night-soft last:border-b-0",
        "transition-all duration-200",
        className
      )}
    >
      {/* Checkbox */}
      <button
        className={cn(
          "w-[22px] h-[22px] rounded-[7px] border-[1.5px] flex-shrink-0",
          "flex items-center justify-center",
          "transition-all duration-200",
          task.completed
            ? "bg-zen-green border-zen-green"
            : "border-night-glow hover:border-moon-dim"
        )}
        onClick={onToggle}
      >
        {task.completed && (
          <Check className="w-3.5 h-3.5 text-void" strokeWidth={2} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 cursor-pointer" onClick={onEdit}>
        <div
          className={cn(
            "text-[0.9375rem] font-normal mb-1",
            task.completed
              ? "line-through text-moon-faint"
              : "text-moon"
          )}
        >
          {task.title}
        </div>
        <div className="text-xs text-moon-faint">{task.category}</div>
      </div>

      {/* Edit button (visible on hover) */}
      <button
        onClick={onEdit}
        className={cn(
          "p-1.5 rounded-lg opacity-0 group-hover:opacity-100",
          "text-moon-faint hover:text-moon hover:bg-night-soft",
          "transition-all duration-200"
        )}
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      {/* Points */}
      <span
        className={cn(
          "text-[0.8125rem] font-normal text-moon-faint",
          "transition-colors duration-200",
          !task.completed && "group-hover:text-lantern"
        )}
      >
        {task.completed ? `+${task.points}` : task.points}
      </span>
    </div>
  );
});

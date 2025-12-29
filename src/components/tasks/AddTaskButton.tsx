"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface AddTaskButtonProps {
  onClick?: () => void;
  className?: string;
}

export function AddTaskButton({ onClick, className }: AddTaskButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-[18px] py-5 w-full",
        "text-moon-faint text-sm",
        "transition-colors duration-200",
        "hover:text-moon-soft",
        "[&:hover_.add-icon]:border-moon-dim",
        className
      )}
    >
      <div className="add-icon w-[22px] h-[22px] border-[1.5px] border-dashed border-night-glow rounded-[7px] flex items-center justify-center transition-colors">
        <Plus className="w-3 h-3" />
      </div>
      <span>Add task</span>
    </button>
  );
}

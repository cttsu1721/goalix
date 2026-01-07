"use client";

import { memo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { Check, ChevronRight, AlertTriangle, Target, Link2Off, X, GripVertical } from "lucide-react";
import { useSwipeGesture } from "@/hooks";

// Format overdue date to show relative time (e.g., "Dec 30" or "Yesterday")
function formatOverdueDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface GoalChain {
  weeklyGoal?: {
    id: string;
    title: string;
  } | null;
  oneYearGoal?: {
    id: string;
    title: string;
  } | null;
}

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    points: number;
    isOverdue?: boolean;
    scheduledDate?: string;
    goalChain?: GoalChain;
    priority?: "MIT" | "PRIMARY" | "SECONDARY";
  };
  onToggle?: () => void;
  onEdit?: () => void;
  onDragStart?: (taskId: string, title: string, priority: "PRIMARY" | "SECONDARY") => void;
  onDragEnd?: () => void;
  draggable?: boolean;
  className?: string;
}

export const TaskItem = memo(function TaskItem({
  task,
  onToggle,
  onEdit,
  onDragStart,
  onDragEnd,
  draggable = false,
  className
}: TaskItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const { ref, offset, isSwiping, direction, progress } = useSwipeGesture<HTMLDivElement>({
    threshold: 80,
    onSwipeRight: () => {
      if (!task.completed) {
        onToggle?.();
      }
    },
    onSwipeLeft: () => {
      if (task.completed) {
        onToggle?.(); // Uncomplete
      }
    },
  });

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Space or 'c' to toggle completion
      if (e.key === " " || e.key === "c") {
        e.preventDefault();
        onToggle?.();
      }
      // Enter or 'e' to edit
      if (e.key === "Enter" || e.key === "e") {
        e.preventDefault();
        onEdit?.();
      }
    },
    [onToggle, onEdit]
  );

  // Calculate opacity for action indicators based on progress
  const actionOpacity = Math.min(progress * 1.5, 1);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!draggable || task.completed) return;

      const priority = task.priority as "PRIMARY" | "SECONDARY";
      if (priority !== "PRIMARY" && priority !== "SECONDARY") return;

      setIsDragging(true);
      haptics.dragStart(); // Haptic feedback on drag start
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify({
        id: task.id,
        title: task.title,
        priority,
      }));

      onDragStart?.(task.id, task.title, priority);
    },
    [draggable, task, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    haptics.dragEnd(); // Haptic feedback on drag end
    onDragEnd?.();
  }, [onDragEnd]);

  // Check if task is draggable (not completed, not MIT)
  const canDrag = draggable && !task.completed && task.priority !== "MIT";

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="button"
      aria-label={`${task.completed ? "Completed" : "Incomplete"} task: ${task.title}. Press space to toggle, enter to edit.${canDrag ? " Drag to promote to MIT." : ""}`}
      onKeyDown={handleKeyDown}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "relative overflow-hidden",
        "border-b border-night-soft last:border-b-0",
        // Focus ring for keyboard navigation
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-lantern/50 focus-visible:ring-offset-2 focus-visible:ring-offset-night",
        "rounded-sm",
        // Dragging state
        isDragging && "opacity-50 scale-[0.98]",
        // Draggable cursor
        canDrag && "cursor-grab active:cursor-grabbing",
        className
      )}
      style={{ touchAction: "pan-y" }}
    >
      {/* Swipe action backgrounds */}
      <div className="absolute inset-0 flex">
        {/* Left side - Complete action (swipe right) */}
        <div
          className={cn(
            "flex items-center justify-start pl-4 w-1/2",
            "bg-zen-green/20 transition-opacity duration-100"
          )}
          style={{ opacity: direction === "right" ? actionOpacity : 0 }}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full bg-zen-green flex items-center justify-center",
              "transition-transform duration-100"
            )}
            style={{
              transform: `scale(${0.5 + progress * 0.5})`,
            }}
          >
            <Check className="w-5 h-5 text-void" strokeWidth={2.5} />
          </div>
        </div>

        {/* Right side - Uncomplete action (swipe left) */}
        <div
          className={cn(
            "flex items-center justify-end pr-4 w-1/2",
            "bg-night-mist/50 transition-opacity duration-100"
          )}
          style={{ opacity: direction === "left" ? actionOpacity : 0 }}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full bg-night-glow flex items-center justify-center",
              "transition-transform duration-100"
            )}
            style={{
              transform: `scale(${0.5 + progress * 0.5})`,
            }}
          >
            <X className="w-5 h-5 text-moon" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Task content - slides with swipe */}
      <div
        className={cn(
          "relative bg-night",
          "group flex items-center gap-3 sm:gap-4 py-4",
          "transition-transform",
          isSwiping ? "duration-0" : "duration-200 ease-out",
          // Touch feedback
          "active:bg-night-soft/50"
        )}
        style={{
          transform: `translateX(${offset}px)`,
        }}
      >
        {/* Drag handle - only visible on hover when draggable */}
        {canDrag && (
          <div className="hidden sm:flex items-center justify-center w-4 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-moon-faint/50" />
          </div>
        )}

        {/* Checkbox - larger touch target for mobile */}
        <button
          tabIndex={-1}
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
                ? "bg-zen-green border-zen-green scale-110"
                : "border-night-glow hover:border-zen-green/50"
            )}
            style={{
              animation: task.completed ? "checkbox-pop 0.3s ease-out" : undefined,
            }}
          >
            {task.completed && (
              <Check
                className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-void"
                strokeWidth={2.5}
                style={{
                  animation: "checkmark-draw 0.2s ease-out 0.1s both",
                }}
              />
            )}
          </div>
        </button>

        {/* Content - tap to edit */}
        <button
          tabIndex={-1}
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
          <div className="text-xs text-moon-faint truncate flex items-center gap-1.5">
            {task.isOverdue && !task.completed && (
              <>
                <AlertTriangle className="w-3 h-3 text-zen-red flex-shrink-0" />
                <span className="text-zen-red">
                  {task.scheduledDate ? formatOverdueDate(task.scheduledDate) : "Overdue"}
                </span>
                <span className="text-moon-faint/50">·</span>
              </>
            )}
            {/* Goal Chain or Standalone indicator */}
            {task.goalChain?.weeklyGoal ? (
              <>
                <Target className="w-3 h-3 text-zen-green flex-shrink-0" />
                <span className="text-moon-dim truncate">
                  {task.goalChain.weeklyGoal.title}
                  {task.goalChain.oneYearGoal && (
                    <span className="text-lantern/60"> → {task.goalChain.oneYearGoal.title}</span>
                  )}
                </span>
              </>
            ) : (
              <>
                <Link2Off className="w-3 h-3 text-moon-faint/50 flex-shrink-0" />
                <span className="text-moon-faint/70">Standalone</span>
                <span className="text-moon-faint/30">·</span>
                <span>{task.category}</span>
              </>
            )}
          </div>
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
    </div>
  );
});

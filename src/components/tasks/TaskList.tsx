"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { TaskItem } from "./TaskItem";
import { AddTaskButton } from "./AddTaskButton";
import { SwipeHint, hasSeenSwipeHint } from "./SwipeHint";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  points: number;
  isOverdue?: boolean;
  scheduledDate?: string;
  priority?: "MIT" | "PRIMARY" | "SECONDARY";
  goalChain?: {
    weeklyGoal?: { id: string; title: string } | null;
    oneYearGoal?: { id: string; title: string } | null;
  };
}

interface TaskListProps {
  title: string;
  tasks: Task[];
  completedCount?: number;
  totalCount?: number;
  onTaskToggle?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onAddTask?: () => void;
  draggable?: boolean;
  onDragStart?: (taskId: string, title: string, priority: "PRIMARY" | "SECONDARY") => void;
  onDragEnd?: () => void;
  onPromoteToMit?: (task: { id: string; title: string; priority: "PRIMARY" | "SECONDARY" }) => void;
  className?: string;
}

export function TaskList({
  title,
  tasks,
  completedCount,
  totalCount,
  onTaskToggle,
  onTaskEdit,
  onAddTask,
  draggable = false,
  onDragStart,
  onDragEnd,
  onPromoteToMit,
  className,
}: TaskListProps) {
  const completed = completedCount ?? tasks.filter((t) => t.completed).length;
  const total = totalCount ?? tasks.length;

  // Track swipe hint dismissal within this session
  const [hintDismissed, setHintDismissed] = useState(false);

  // Show swipe hint on touch devices with incomplete tasks (if not seen before)
  const showSwipeHint = useMemo(() => {
    if (hintDismissed) return false;
    if (typeof window === "undefined") return false;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hasIncompleteTasks = tasks.some((t) => !t.completed);

    return isTouchDevice && hasIncompleteTasks && !hasSeenSwipeHint();
  }, [tasks, hintDismissed]);

  return (
    <section className={cn("mb-12", className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-night-soft">
        <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-moon-faint">
          {title}
        </h2>
        <span className="text-xs text-moon-faint">
          {completed} of {total} complete
        </span>
      </div>

      {/* Tasks */}
      <div className="flex flex-col relative">
        {/* Swipe hint for mobile users */}
        <SwipeHint
          show={showSwipeHint}
          onDismiss={() => setHintDismissed(true)}
        />
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onTaskToggle?.(task.id)}
            onEdit={() => onTaskEdit?.(task.id)}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onPromoteToMit={onPromoteToMit}
          />
        ))}
      </div>

      {/* Add Button */}
      <AddTaskButton onClick={onAddTask} />
    </section>
  );
}

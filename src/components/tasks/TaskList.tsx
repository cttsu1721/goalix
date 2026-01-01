"use client";

import { cn } from "@/lib/utils";
import { TaskItem } from "./TaskItem";
import { AddTaskButton } from "./AddTaskButton";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  points: number;
  isOverdue?: boolean;
  scheduledDate?: string;
}

interface TaskListProps {
  title: string;
  tasks: Task[];
  completedCount?: number;
  totalCount?: number;
  onTaskToggle?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onAddTask?: () => void;
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
  className,
}: TaskListProps) {
  const completed = completedCount ?? tasks.filter((t) => t.completed).length;
  const total = totalCount ?? tasks.length;

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
      <div className="flex flex-col">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onTaskToggle?.(task.id)}
            onEdit={() => onTaskEdit?.(task.id)}
          />
        ))}
      </div>

      {/* Add Button */}
      <AddTaskButton onClick={onAddTask} />
    </section>
  );
}

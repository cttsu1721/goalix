"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Check,
  Plus,
  Sparkles,
  Target,
  Circle,
  Loader2,
  Star,
  CircleDot,
} from "lucide-react";
import type { TaskPriority, TaskStatus } from "@prisma/client";

interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: Date;
  weeklyGoal: { id: string; title: string; category: string } | null;
}

interface DayTasksPopoverProps {
  date: Date;
  tasks: TaskItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleteTask: (task: TaskItem) => void;
  onAddTask: (date: Date) => void;
  onEditTask?: (task: TaskItem) => void;
  completingTaskId: string | null;
}

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// Format date for display
function formatDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// Task item component with completion animation
function TaskRow({
  task,
  onComplete,
  onEdit,
  isCompleting,
  index,
}: {
  task: TaskItem;
  onComplete: () => void;
  onEdit?: () => void;
  isCompleting: boolean;
  index: number;
}) {
  const completed = task.status === "COMPLETED";
  const isMit = task.priority === "MIT";
  const isPrimary = task.priority === "PRIMARY";

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-xl transition-all duration-300",
        "animate-fade-in",
        // MIT special treatment - subtle glow
        isMit && !completed && "bg-gradient-to-r from-lantern/15 to-lantern/5 border border-lantern/30",
        // Primary tasks
        isPrimary && !completed && "bg-night-mist/30 border border-night-glow",
        // Secondary tasks
        !isMit && !isPrimary && !completed && "bg-night-mist/20",
        // Completed state
        completed && "bg-zen-green/5 border border-zen-green/20"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Completion checkbox - 44px touch target with 24px visual */}
      <button
        onClick={onComplete}
        disabled={isCompleting}
        className="flex-shrink-0 w-11 h-11 -m-2 flex items-center justify-center"
        aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
      >
        <div
          className={cn(
            "relative w-6 h-6 rounded-lg border-2 transition-all duration-300",
            "flex items-center justify-center",
            "hover:scale-110 active:scale-95",
            completed
              ? "bg-zen-green border-zen-green"
              : isMit
              ? "border-lantern hover:border-lantern-soft hover:bg-lantern/10"
              : "border-night-glow hover:border-moon-dim"
          )}
        >
          {isCompleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-moon-dim" />
          ) : completed ? (
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          ) : null}

          {/* Ripple effect on completion */}
          {completed && (
            <span className="absolute inset-0 rounded-lg animate-ping bg-zen-green/30" />
          )}
        </div>
      </button>

      {/* Task content - clickable for edit */}
      <button
        type="button"
        onClick={onEdit}
        disabled={!onEdit}
        className={cn(
          "flex-1 min-w-0 text-left",
          onEdit && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
      >
        {/* Priority badge for MIT */}
        {isMit && !completed && (
          <span className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider bg-lantern/20 text-lantern">
            <Sparkles className="w-2.5 h-2.5" />
            MIT
          </span>
        )}

        {/* Task title */}
        <p
          className={cn(
            "text-sm font-medium leading-snug transition-all duration-300",
            completed
              ? "line-through text-moon-dim/70"
              : "text-moon"
          )}
        >
          {task.title}
        </p>

        {/* Linked goal */}
        {task.weeklyGoal && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Target className="w-3 h-3 text-lantern/70" />
            <span className="text-xs text-moon-dim truncate">
              {task.weeklyGoal.title}
            </span>
          </div>
        )}
      </button>

      {/* Priority indicator with icon */}
      <div
        className={cn(
          "flex-shrink-0 mt-1.5",
          completed && "opacity-40"
        )}
        title={isMit ? "MIT" : isPrimary ? "Primary" : "Secondary"}
      >
        {isMit ? (
          <Sparkles className="w-3.5 h-3.5 text-lantern" />
        ) : isPrimary ? (
          <Star className="w-3.5 h-3.5 text-zen-green" />
        ) : (
          <CircleDot className="w-3.5 h-3.5 text-moon-dim/60" />
        )}
      </div>
    </div>
  );
}

// Main content component (shared between Popover and Sheet)
function DayTasksContent({
  date,
  tasks,
  onCompleteTask,
  onAddTask,
  onEditTask,
  completingTaskId,
  onClose,
}: {
  date: Date;
  tasks: TaskItem[];
  onCompleteTask: (task: TaskItem) => void;
  onAddTask: (date: Date) => void;
  onEditTask?: (task: TaskItem) => void;
  completingTaskId: string | null;
  onClose: () => void;
}) {
  // Group tasks by priority
  const mitTasks = tasks.filter((t) => t.priority === "MIT");
  const primaryTasks = tasks.filter((t) => t.priority === "PRIMARY");
  const secondaryTasks = tasks.filter((t) => t.priority === "SECONDARY");

  // Stats
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalCount = tasks.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div className="flex flex-col max-h-[70vh] md:max-h-[500px]">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-night-mist/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-moon">
              {formatDate(date)}
            </h3>
            {isToday && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider rounded-full bg-lantern/20 text-lantern">
                Today
              </span>
            )}
          </div>

          {/* Stats pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-night-soft/50">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-moon tabular-nums">
                {completedCount}
              </span>
              <span className="text-xs text-moon-dim">/{totalCount}</span>
            </div>
            <div className="w-px h-4 bg-night-mist/50" />
            <span
              className={cn(
                "text-xs font-medium",
                completionPercent === 100 ? "text-zen-green" : "text-moon-dim"
              )}
            >
              {completionPercent}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-night-mist/30 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              completionPercent === 100
                ? "bg-zen-green"
                : "bg-gradient-to-r from-lantern to-lantern/70"
            )}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Tasks list - scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Circle className="w-10 h-10 mx-auto mb-3 text-moon-faint/50" />
            <p className="text-sm text-moon-dim">No tasks for this day</p>
            <p className="text-xs text-moon-faint mt-1">
              Click below to add your first task
            </p>
          </div>
        ) : (
          <>
            {/* MIT Section */}
            {mitTasks.length > 0 && (
              <div className="space-y-2">
                {mitTasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onComplete={() => onCompleteTask(task)}
                    onEdit={onEditTask ? () => { onClose(); onEditTask(task); } : undefined}
                    isCompleting={completingTaskId === task.id}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Primary Section */}
            {primaryTasks.length > 0 && (
              <div className="space-y-2">
                {mitTasks.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <div className="h-px flex-1 bg-night-mist/30" />
                    <span className="text-[0.6rem] uppercase tracking-widest text-moon-faint font-medium">
                      Primary
                    </span>
                    <div className="h-px flex-1 bg-night-mist/30" />
                  </div>
                )}
                {primaryTasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onComplete={() => onCompleteTask(task)}
                    onEdit={onEditTask ? () => { onClose(); onEditTask(task); } : undefined}
                    isCompleting={completingTaskId === task.id}
                    index={mitTasks.length + index}
                  />
                ))}
              </div>
            )}

            {/* Secondary Section */}
            {secondaryTasks.length > 0 && (
              <div className="space-y-2">
                {(mitTasks.length > 0 || primaryTasks.length > 0) && (
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <div className="h-px flex-1 bg-night-mist/30" />
                    <span className="text-[0.6rem] uppercase tracking-widest text-moon-faint font-medium">
                      Secondary
                    </span>
                    <div className="h-px flex-1 bg-night-mist/30" />
                  </div>
                )}
                {secondaryTasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onComplete={() => onCompleteTask(task)}
                    onEdit={onEditTask ? () => { onClose(); onEditTask(task); } : undefined}
                    isCompleting={completingTaskId === task.id}
                    index={mitTasks.length + primaryTasks.length + index}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer - Add task button */}
      <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-night-glow">
        <Button
          variant="outline"
          className={cn(
            "w-full h-11 rounded-xl gap-2",
            "border-dashed border-night-glow hover:border-lantern/50",
            "text-moon-dim hover:text-lantern",
            "hover:bg-lantern/5 transition-all duration-200"
          )}
          onClick={() => {
            onClose();
            onAddTask(date);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}

export function DayTasksPopover({
  date,
  tasks,
  isOpen,
  onOpenChange,
  onCompleteTask,
  onAddTask,
  onEditTask,
  completingTaskId,
}: DayTasksPopoverProps) {
  const isMobile = useIsMobile();

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "rounded-t-3xl bg-night border-t border-night-glow",
            "pb-[env(safe-area-inset-bottom,1rem)]"
          )}
        >
          {/* Drag indicator */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-night-glow" />

          <DayTasksContent
            date={date}
            tasks={tasks}
            onCompleteTask={onCompleteTask}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            completingTaskId={completingTaskId}
            onClose={handleClose}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Dialog (centered modal)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          "max-w-md p-0 rounded-2xl overflow-hidden",
          "bg-night backdrop-blur-xl",
          "border border-night-glow",
          "shadow-2xl shadow-night/50"
        )}
      >
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          Tasks for {formatDate(date)}
        </DialogTitle>
        <DayTasksContent
          date={date}
          tasks={tasks}
          onCompleteTask={onCompleteTask}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          completingTaskId={completingTaskId}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

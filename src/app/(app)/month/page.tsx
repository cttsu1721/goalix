"use client";

import { useMemo, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn, formatLocalDate } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWeekTasks, useCompleteTask, useUpdateTask } from "@/hooks";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { TaskEditModal } from "@/components/tasks/TaskEditModal";
import { DayTasksPopover } from "@/components/tasks/DayTasksPopover";
import { toast } from "sonner";
import type { TaskPriority, TaskStatus } from "@prisma/client";

// Get all dates for a month including padding days
function getMonthDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get day of week for first day (0 = Sunday, adjust for Monday start)
  let startPadding = firstDay.getDay() - 1;
  if (startPadding < 0) startPadding = 6; // Sunday becomes 6

  const dates: Date[] = [];

  // Add padding days from previous month
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    dates.push(date);
  }

  // Add all days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }

  // Add padding days for next month to complete the grid (6 rows max)
  const remaining = 42 - dates.length; // 6 rows * 7 days
  for (let i = 1; i <= remaining; i++) {
    dates.push(new Date(year, month + 1, i));
  }

  return dates;
}

function formatDateKey(date: Date) {
  return formatLocalDate(date);
}

function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isCurrentMonth(date: Date, currentMonth: number) {
  return date.getMonth() === currentMonth;
}

interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: Date;
  weeklyGoal: { id: string; title: string; category: string } | null;
}

// Compact task pill for calendar cell
function TaskPill({
  task,
  onComplete,
  isCompleting,
}: {
  task: TaskItem;
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const completed = task.status === "COMPLETED";
  const isMit = task.priority === "MIT";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onComplete();
      }}
      disabled={isCompleting}
      className={cn(
        "w-full text-left px-2 py-1 rounded-md text-[0.65rem] leading-tight truncate",
        "transition-all duration-150 hover:ring-1 hover:ring-lantern/50",
        isMit && !completed && "bg-lantern/20 text-lantern font-medium",
        !isMit && !completed && "bg-night-mist/30 text-moon-dim",
        completed && "bg-zen-green/10 text-zen-green line-through opacity-60"
      )}
      title={task.title}
    >
      {isMit && !completed && <Sparkles className="w-2.5 h-2.5 inline mr-1" />}
      {completed && <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />}
      {task.title}
    </button>
  );
}

// Calendar day cell
function DayCell({
  date,
  tasks,
  isCurrentMonth: isInMonth,
  onCompleteTask,
  onAddTask,
  onShowAllTasks,
  isCompletingTask,
  isPopoverOpen,
}: {
  date: Date;
  tasks: TaskItem[];
  isCurrentMonth: boolean;
  onCompleteTask: (task: TaskItem) => void;
  onAddTask: (date: Date) => void;
  onShowAllTasks: (date: Date) => void;
  isCompletingTask: string | null;
  isPopoverOpen: boolean;
}) {
  const today = isToday(date);
  const dayNum = date.getDate();
  const maxVisible = 3;
  const visibleTasks = tasks.slice(0, maxVisible);
  const hiddenCount = tasks.length - maxVisible;

  return (
    <div
      onClick={() => onAddTask(date)}
      className={cn(
        "min-h-[100px] p-2 border-b border-r border-night-glow/30 cursor-pointer",
        "transition-colors hover:bg-night-mist/30",
        !isInMonth && "bg-night/50 opacity-50",
        today && "bg-lantern/10 ring-2 ring-inset ring-lantern/40",
        isPopoverOpen && "bg-lantern/15 ring-2 ring-lantern/50"
      )}
    >
      {/* Day number */}
      <div className={cn(
        "text-sm font-medium mb-1.5",
        today ? "text-lantern" : isInMonth ? "text-moon" : "text-moon-faint"
      )}>
        {dayNum}
        {today && (
          <span className="ml-1.5 text-[0.6rem] uppercase tracking-wider text-lantern/70">
            Today
          </span>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-1">
        {visibleTasks.map((task) => (
          <TaskPill
            key={task.id}
            task={task}
            onComplete={() => onCompleteTask(task)}
            isCompleting={isCompletingTask === task.id}
          />
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowAllTasks(date);
            }}
            className={cn(
              "w-full text-left text-[0.6rem] px-2 py-0.5 rounded",
              "text-lantern hover:text-lantern-soft",
              "hover:bg-lantern/10 transition-colors",
              "font-medium"
            )}
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
}

export default function MonthPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | null>(null);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  // Popover state - stores the date key of the day with open popover
  const [popoverDate, setPopoverDate] = useState<string | null>(null);
  const [popoverTasks, setPopoverTasks] = useState<TaskItem[]>([]);
  const [popoverDateObj, setPopoverDateObj] = useState<Date | null>(null);

  // Calculate current month/year based on offset
  const { year, month, monthDates } = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth(),
      monthDates: getMonthDates(targetDate.getFullYear(), targetDate.getMonth()),
    };
  }, [monthOffset]);

  const monthName = new Date(year, month).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  // Get date range for API call
  const startDate = formatDateKey(monthDates[0]);
  const endDate = formatDateKey(monthDates[monthDates.length - 1]);

  const { data: tasksData, isLoading: tasksLoading, refetch } = useWeekTasks(startDate, endDate);
  const completeTask = useCompleteTask();
  const updateTask = useUpdateTask();

  const tasksByDate = tasksData?.tasksByDate || {};

  const goToThisMonth = () => setMonthOffset(0);
  const goToPrevMonth = () => setMonthOffset(monthOffset - 1);
  const goToNextMonth = () => setMonthOffset(monthOffset + 1);

  const handleToggleTask = async (task: TaskItem) => {
    setCompletingTaskId(task.id);
    try {
      if (task.status === "COMPLETED") {
        await updateTask.mutateAsync({ id: task.id, status: "PENDING" });
        toast.success("Task reopened");
      } else {
        await completeTask.mutateAsync(task.id);
        toast.success("Task completed!");
      }
      refetch();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleAddTask = (date: Date) => {
    setCreateModalDate(date);
    setCreateModalOpen(true);
  };

  // Handler for showing all tasks in popover
  const handleShowAllTasks = useCallback((date: Date) => {
    const dateKey = formatDateKey(date);
    const dayTasks = (tasksByDate[dateKey] || []) as TaskItem[];
    setPopoverDate(dateKey);
    setPopoverTasks(dayTasks);
    setPopoverDateObj(date);
  }, [tasksByDate]);

  // Handler for closing popover
  const handlePopoverOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setPopoverDate(null);
      setPopoverTasks([]);
      setPopoverDateObj(null);
    }
  }, []);

  // Handler for completing task from popover
  const handlePopoverCompleteTask = useCallback(async (task: TaskItem) => {
    setCompletingTaskId(task.id);
    try {
      if (task.status === "COMPLETED") {
        await updateTask.mutateAsync({ id: task.id, status: "PENDING" });
        toast.success("Task reopened");
      } else {
        await completeTask.mutateAsync(task.id);
        toast.success("Task completed!");
      }
      // Refetch and update popover tasks
      await refetch();
      // Update popover tasks with fresh data
      if (popoverDate) {
        const freshTasksByDate = tasksData?.tasksByDate || {};
        setPopoverTasks((freshTasksByDate[popoverDate] || []) as TaskItem[]);
      }
    } catch {
      toast.error("Failed to update task");
    } finally {
      setCompletingTaskId(null);
    }
  }, [completeTask, updateTask, refetch, popoverDate, tasksData?.tasksByDate]);

  // Handler for adding task from popover
  const handlePopoverAddTask = useCallback((date: Date) => {
    setPopoverDate(null);
    setCreateModalDate(date);
    setCreateModalOpen(true);
  }, []);

  // Handler for editing task from popover
  const handleEditTask = useCallback((task: TaskItem) => {
    setEditingTask(task);
    setEditModalOpen(true);
  }, []);

  // Handle edit modal close and refresh
  const handleEditModalChange = useCallback((open: boolean) => {
    setEditModalOpen(open);
    if (!open) {
      setEditingTask(null);
      refetch();
    }
  }, [refetch]);

  // Calculate month stats from tasksByDate (same source as calendar)
  const monthStats = useMemo(() => {
    const allTasksByDate = tasksData?.tasksByDate || {};

    let total = 0;
    let completed = 0;
    let mitsTotal = 0;
    let mitsCompleted = 0;

    // Only count tasks from dates in the current month
    monthDates.forEach(date => {
      if (date.getMonth() === month && date.getFullYear() === year) {
        const dateKey = formatDateKey(date);
        const dayTasks = (allTasksByDate[dateKey] || []) as TaskItem[];

        total += dayTasks.length;
        completed += dayTasks.filter(t => t.status === "COMPLETED").length;

        const dayMits = dayTasks.filter(t => t.priority === "MIT");
        mitsTotal += dayMits.length;
        mitsCompleted += dayMits.filter(t => t.status === "COMPLETED").length;
      }
    });

    return {
      total,
      completed,
      mitsTotal,
      mitsCompleted,
    };
  }, [tasksData?.tasksByDate, monthDates, month, year]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-moon">Month View</h1>
          <p className="text-moon-dim mt-1">{monthName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevMonth}
                aria-label="Previous month"
                className="h-9 w-9 p-0 border-night-glow bg-night-soft hover:bg-night-mist"
              >
                <ChevronLeft className="w-4 h-4 text-moon-soft" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous month</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            onClick={goToThisMonth}
            disabled={monthOffset === 0}
            className="h-9 px-4 border-night-glow bg-night-soft hover:bg-night-mist text-moon-soft text-sm"
          >
            Today
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                aria-label="Next month"
                className="h-9 w-9 p-0 border-night-glow bg-night-soft hover:bg-night-mist"
              >
                <ChevronRight className="w-4 h-4 text-moon-soft" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next month</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Month Stats */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-night-soft border border-night-glow rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-semibold text-moon">
            {monthStats.completed}
            <span className="text-moon-faint text-base font-normal">/{monthStats.total}</span>
          </div>
          <span className="text-xs text-moon-dim">tasks completed</span>
        </div>
        <div className="w-px h-8 bg-night-glow" />
        <div className="flex items-center gap-2">
          <div className="text-2xl font-semibold text-lantern">
            {monthStats.mitsCompleted}
            <span className="text-moon-faint text-base font-normal">/{monthStats.mitsTotal}</span>
          </div>
          <span className="text-xs text-moon-dim">MITs completed</span>
        </div>
        <div className="flex-1" />
        <div className="text-right">
          <div className="text-lg font-semibold text-moon">
            {monthStats.total > 0
              ? Math.round((monthStats.completed / monthStats.total) * 100)
              : 0}%
          </div>
          <span className="text-xs text-moon-dim">completion rate</span>
        </div>
      </div>

      {/* Calendar Grid */}
      {tasksLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      ) : (
        <div className="bg-night-soft border border-night-glow rounded-2xl overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-night-glow/50">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-medium text-moon-dim uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {monthDates.map((date) => {
              const dateKey = formatDateKey(date);
              const dayTasks = (tasksByDate[dateKey] || []) as TaskItem[];

              return (
                <DayCell
                  key={dateKey}
                  date={date}
                  tasks={dayTasks}
                  isCurrentMonth={isCurrentMonth(date, month)}
                  onCompleteTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onShowAllTasks={handleShowAllTasks}
                  isCompletingTask={completingTaskId}
                  isPopoverOpen={popoverDate === dateKey}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Day Tasks Dialog/Sheet */}
      {popoverDateObj && (
        <DayTasksPopover
          date={popoverDateObj}
          tasks={popoverTasks}
          isOpen={popoverDate !== null}
          onOpenChange={handlePopoverOpenChange}
          onCompleteTask={handlePopoverCompleteTask}
          onAddTask={handlePopoverAddTask}
          onEditTask={handleEditTask}
          completingTaskId={completingTaskId}
        />
      )}

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        scheduledDate={createModalDate ? formatDateKey(createModalDate) : undefined}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        open={editModalOpen}
        onOpenChange={handleEditModalChange}
        task={editingTask}
      />
    </AppShell>
  );
}

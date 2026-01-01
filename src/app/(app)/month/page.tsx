"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeekTasks, useCompleteTask, useUpdateTask } from "@/hooks";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
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
  return date.toISOString().split("T")[0];
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
        "transition-all duration-150 hover:ring-1 hover:ring-sakura-300",
        isMit && !completed && "bg-sakura-100 text-sakura-700 font-medium",
        !isMit && !completed && "bg-night-soft/50 text-moon-dim",
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
  isCompletingTask,
}: {
  date: Date;
  tasks: TaskItem[];
  isCurrentMonth: boolean;
  onCompleteTask: (task: TaskItem) => void;
  onAddTask: (date: Date) => void;
  isCompletingTask: string | null;
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
        "min-h-[100px] p-2 border-b border-r border-night-mist/20 cursor-pointer",
        "transition-colors hover:bg-sakura-50/30",
        !isInMonth && "bg-night-soft/20 opacity-50",
        today && "bg-sakura-50/50 ring-2 ring-inset ring-sakura-300"
      )}
    >
      {/* Day number */}
      <div className={cn(
        "text-sm font-medium mb-1.5",
        today ? "text-sakura-600" : isInMonth ? "text-moon" : "text-moon-faint"
      )}>
        {dayNum}
        {today && (
          <span className="ml-1.5 text-[0.6rem] uppercase tracking-wider text-sakura-500">
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
          <div className="text-[0.6rem] text-moon-faint px-2">
            +{hiddenCount} more
          </div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevMonth}
            className="h-9 w-9 p-0 border-night-mist bg-white hover:bg-sakura-50"
          >
            <ChevronLeft className="w-4 h-4 text-moon-soft" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToThisMonth}
            disabled={monthOffset === 0}
            className="h-9 px-4 border-night-mist bg-white hover:bg-sakura-50 text-moon-soft text-sm"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-9 w-9 p-0 border-night-mist bg-white hover:bg-sakura-50"
          >
            <ChevronRight className="w-4 h-4 text-moon-soft" />
          </Button>
        </div>
      </div>

      {/* Month Stats */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-white/80 border border-night-mist/30 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-semibold text-moon">
            {monthStats.completed}
            <span className="text-moon-faint text-base font-normal">/{monthStats.total}</span>
          </div>
          <span className="text-xs text-moon-dim">tasks completed</span>
        </div>
        <div className="w-px h-8 bg-night-mist/30" />
        <div className="flex items-center gap-2">
          <div className="text-2xl font-semibold text-sakura-600">
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
          <Loader2 className="w-8 h-8 animate-spin text-sakura-400" />
        </div>
      ) : (
        <div className="bg-white/80 border border-night-mist/30 rounded-2xl overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-night-mist/30">
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
                  isCompletingTask={completingTaskId}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        scheduledDate={createModalDate ? formatDateKey(createModalDate) : undefined}
      />
    </AppShell>
  );
}

"use client";

import { useMemo, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Check,
  Plus,
  Target,
  Circle,
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

  // Add padding days for next month to complete the grid
  // Use 5 or 6 rows depending on how many dates we have
  const totalDays = dates.length <= 35 ? 35 : 42;
  const remaining = totalDays - dates.length;
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

// Get colored dots based on task priorities
function getTaskDots(tasks: TaskItem[]) {
  const dots: { color: string; key: string }[] = [];
  const hasMit = tasks.some((t) => t.priority === "MIT" && t.status !== "COMPLETED");
  const hasPrimary = tasks.some((t) => t.priority === "PRIMARY" && t.status !== "COMPLETED");
  const hasSecondary = tasks.some((t) => t.priority === "SECONDARY" && t.status !== "COMPLETED");
  const hasCompleted = tasks.some((t) => t.status === "COMPLETED");

  if (hasMit) dots.push({ color: "bg-lantern", key: "mit" });
  if (hasPrimary) dots.push({ color: "bg-pink-400", key: "primary" });
  if (hasSecondary) dots.push({ color: "bg-sky-400", key: "secondary" });
  if (hasCompleted && dots.length < 3) dots.push({ color: "bg-zen-green", key: "completed" });

  return dots.slice(0, 4); // Max 4 dots
}

// Compact calendar day cell with dots
function CompactDayCell({
  date,
  tasks,
  isInMonth,
  isSelected,
  onClick,
}: {
  date: Date;
  tasks: TaskItem[];
  isInMonth: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const today = isToday(date);
  const dayNum = date.getDate();
  const dots = getTaskDots(tasks);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-2 rounded-lg transition-all",
        "hover:bg-night-mist/30 focus:outline-none focus:ring-2 focus:ring-lantern/50",
        !isInMonth && "opacity-40",
        isSelected && !today && "bg-night-mist/50"
      )}
    >
      {/* Day number */}
      <div
        className={cn(
          "w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full",
          today && "bg-moon text-night font-semibold",
          !today && isInMonth && "text-moon",
          !today && !isInMonth && "text-moon-faint"
        )}
      >
        {dayNum}
      </div>

      {/* Task indicator dots */}
      <div className="flex items-center justify-center gap-0.5 mt-1 h-2">
        {dots.map((dot) => (
          <div key={dot.key} className={cn("w-1.5 h-1.5 rounded-full", dot.color)} />
        ))}
      </div>
    </button>
  );
}

// Task row component for the list below calendar
function TaskListItem({
  task,
  onComplete,
  onEdit,
  isCompleting,
}: {
  task: TaskItem;
  onComplete: () => void;
  onEdit: () => void;
  isCompleting: boolean;
}) {
  const completed = task.status === "COMPLETED";
  const isMit = task.priority === "MIT";
  const isPrimary = task.priority === "PRIMARY";

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-3 border-b border-night-glow/30 last:border-b-0",
        "transition-colors hover:bg-night-mist/20"
      )}
    >
      {/* Completion checkbox */}
      <button
        onClick={onComplete}
        disabled={isCompleting}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200",
          "flex items-center justify-center",
          "hover:scale-110 active:scale-95",
          completed
            ? "bg-zen-green border-zen-green"
            : isMit
            ? "border-lantern hover:border-lantern-soft hover:bg-lantern/10"
            : isPrimary
            ? "border-pink-400 hover:border-pink-300 hover:bg-pink-400/10"
            : "border-sky-400 hover:border-sky-300 hover:bg-sky-400/10"
        )}
      >
        {isCompleting ? (
          <Loader2 className="w-3 h-3 animate-spin text-moon-dim" />
        ) : completed ? (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        ) : null}
      </button>

      {/* Task content - clickable for edit */}
      <button
        onClick={onEdit}
        className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          {/* Priority indicator */}
          {isMit && !completed && (
            <Sparkles className="w-3.5 h-3.5 text-lantern flex-shrink-0" />
          )}

          {/* Task title */}
          <span
            className={cn(
              "text-sm font-medium truncate",
              completed ? "line-through text-moon-dim/60" : "text-moon"
            )}
          >
            {task.title}
          </span>
        </div>

        {/* Linked goal */}
        {task.weeklyGoal && !completed && (
          <div className="flex items-center gap-1 mt-0.5">
            <Target className="w-3 h-3 text-lantern/50" />
            <span className="text-xs text-moon-dim truncate">
              {task.weeklyGoal.title}
            </span>
          </div>
        )}
      </button>

      {/* Priority color dot */}
      <div
        className={cn(
          "flex-shrink-0 w-2 h-2 rounded-full",
          isMit && "bg-lantern",
          isPrimary && !isMit && "bg-pink-400",
          !isMit && !isPrimary && "bg-sky-400",
          completed && "opacity-40"
        )}
      />
    </div>
  );
}

export default function MonthPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | null>(null);
  // Selected date - defaults to today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

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
  });

  // Get date range for API call
  const startDate = formatDateKey(monthDates[0]);
  const endDate = formatDateKey(monthDates[monthDates.length - 1]);

  const { data: tasksData, isLoading: tasksLoading, refetch } = useWeekTasks(startDate, endDate);
  const completeTask = useCompleteTask();
  const updateTask = useUpdateTask();

  const tasksByDate = tasksData?.tasksByDate || {};

  const goToThisMonth = useCallback(() => {
    setMonthOffset(0);
    setSelectedDate(new Date());
  }, []);
  const goToPrevMonth = () => setMonthOffset(monthOffset - 1);
  const goToNextMonth = () => setMonthOffset(monthOffset + 1);

  // Handle day selection
  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

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

  // Handler for editing task
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

  // Handler for adding task
  const handleAddTask = useCallback(() => {
    setCreateModalDate(selectedDate);
    setCreateModalOpen(true);
  }, [selectedDate]);

  // Get tasks for selected date
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDayTasks = (tasksByDate[selectedDateKey] || []) as TaskItem[];

  // Sort tasks: MIT first, then PRIMARY, then SECONDARY, pending before completed
  const sortedSelectedTasks = useMemo(() => {
    const priorityOrder = { MIT: 0, PRIMARY: 1, SECONDARY: 2 };
    return [...selectedDayTasks].sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
      // Then sort by priority
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [selectedDayTasks]);

  // Format selected date for display
  const selectedDateDisplay = selectedDate.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const weekDays = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];

  return (
    <AppShell>
      {/* Header with year navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevMonth}
          className="h-9 px-3 text-moon-soft hover:text-moon hover:bg-night-mist/50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {year}
        </Button>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={goToThisMonth}
                disabled={monthOffset === 0}
                className="h-8 px-3 text-xs border-night-glow bg-night-soft hover:bg-night-mist text-moon-soft"
              >
                Today
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go to today</TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-9 px-3 text-moon-soft hover:text-moon hover:bg-night-mist/50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Month name */}
      <h1 className="text-3xl font-bold text-moon mb-6">{monthName}</h1>

      {/* Compact Calendar Grid */}
      {tasksLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      ) : (
        <>
          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={cn(
                  "py-2 text-center text-xs font-medium uppercase tracking-wider",
                  index >= 5 ? "text-moon-faint" : "text-moon-dim"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days - compact grid */}
          <div className="grid grid-cols-7 gap-y-1 mb-6">
            {monthDates.map((date) => {
              const dateKey = formatDateKey(date);
              const dayTasks = (tasksByDate[dateKey] || []) as TaskItem[];
              const isSelected = date.toDateString() === selectedDate.toDateString();

              return (
                <CompactDayCell
                  key={dateKey}
                  date={date}
                  tasks={dayTasks}
                  isInMonth={isCurrentMonth(date, month)}
                  isSelected={isSelected}
                  onClick={() => handleSelectDate(date)}
                />
              );
            })}
          </div>

          {/* Selected Day Tasks Section */}
          <div className="border-t border-night-glow/50 pt-4">
            {/* Selected date header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-moon">
                {selectedDateDisplay}
                {isToday(selectedDate) && (
                  <span className="ml-2 text-xs font-medium text-lantern bg-lantern/10 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTask}
                className="h-8 px-3 gap-1.5 border-night-glow bg-night-soft hover:bg-night-mist hover:border-lantern/50 text-moon-soft hover:text-lantern"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </Button>
            </div>

            {/* Tasks list */}
            <div className="bg-night-soft border border-night-glow rounded-xl px-4">
              {sortedSelectedTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <Circle className="w-10 h-10 mx-auto mb-3 text-moon-faint/30" />
                  <p className="text-sm text-moon-dim">No tasks for this day</p>
                  <p className="text-xs text-moon-faint mt-1">
                    Click &quot;Add Task&quot; to create one
                  </p>
                </div>
              ) : (
                sortedSelectedTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onComplete={() => handleToggleTask(task)}
                    onEdit={() => handleEditTask(task)}
                    isCompleting={completingTaskId === task.id}
                  />
                ))
              )}
            </div>

            {/* Task legend */}
            {sortedSelectedTasks.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-moon-faint">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-lantern" />
                  <span>MIT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-pink-400" />
                  <span>Primary</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Secondary</span>
                </div>
              </div>
            )}
          </div>
        </>
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

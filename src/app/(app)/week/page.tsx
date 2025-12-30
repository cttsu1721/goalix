"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Target,
  Plus,
  Flame,
  Trophy,
  Loader2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals, useWeekTasks, useCompleteTask, useUpdateTask } from "@/hooks";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { toast } from "sonner";
import Link from "next/link";
import type { TaskPriority, TaskStatus } from "@prisma/client";

// Get dates for the current week (Monday to Sunday)
function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay; // Start from Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatWeekRange(dates: Date[]) {
  const start = dates[0];
  const end = dates[6];
  const startMonth = start.toLocaleDateString("en-AU", { month: "short" });
  const endMonth = end.toLocaleDateString("en-AU", { month: "short" });
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${start.getDate()} - ${end.getDate()} ${startMonth} ${year}`;
  }
  return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${year}`;
}

function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isPast(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: Date;
  weeklyGoal: { id: string; title: string; category: string } | null;
}

function DayColumn({
  date,
  tasks,
  onCompleteTask,
  onAddTask,
  isCompletingTask,
}: {
  date: Date;
  tasks: TaskItem[];
  onCompleteTask: (taskId: string) => void;
  onAddTask: (date: Date) => void;
  isCompletingTask: string | null;
}) {
  const dayName = date.toLocaleDateString("en-AU", { weekday: "short" });
  const dayNum = date.getDate();
  const today = isToday(date);
  const past = isPast(date);

  const mit = tasks.find((t) => t.priority === "MIT");
  const primary = tasks.filter((t) => t.priority === "PRIMARY");
  const secondary = tasks.filter((t) => t.priority === "SECONDARY");

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border transition-all min-h-[280px]",
        today
          ? "bg-lantern/5 border-lantern/40 ring-1 ring-lantern/20"
          : past
          ? "bg-night-soft/50 border-night-mist/50"
          : "bg-night border-night-mist"
      )}
    >
      {/* Day Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5 border-b",
          today ? "border-lantern/20" : "border-night-mist/50"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium uppercase tracking-wider",
              today ? "text-lantern" : past ? "text-moon-faint" : "text-moon-dim"
            )}
          >
            {dayName}
          </span>
          <span
            className={cn(
              "text-lg font-semibold",
              today ? "text-lantern" : past ? "text-moon-dim" : "text-moon"
            )}
          >
            {dayNum}
          </span>
        </div>
        {total > 0 && (
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              completed === total
                ? "bg-zen-green/20 text-zen-green"
                : "bg-night-mist text-moon-faint"
            )}
          >
            {completed}/{total}
          </span>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        {/* MIT */}
        {mit && (
          <TaskRow
            task={mit}
            onComplete={() => onCompleteTask(mit.id)}
            isCompleting={isCompletingTask === mit.id}
            isMit
          />
        )}

        {/* Primary Tasks */}
        {primary.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={() => onCompleteTask(task.id)}
            isCompleting={isCompletingTask === task.id}
          />
        ))}

        {/* Secondary Tasks */}
        {secondary.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={() => onCompleteTask(task.id)}
            isCompleting={isCompletingTask === task.id}
            isSecondary
          />
        ))}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-4">
            <Calendar className="w-5 h-5 text-moon-faint/50 mb-2" />
            <p className="text-xs text-moon-faint">No tasks</p>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      {!past && (
        <button
          onClick={() => onAddTask(date)}
          className={cn(
            "flex items-center justify-center gap-1 py-2 mx-2 mb-2 rounded-lg",
            "text-xs text-moon-faint hover:text-moon hover:bg-night-mist/50",
            "border border-dashed border-night-mist/50 hover:border-moon-faint/30",
            "transition-all"
          )}
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onComplete,
  isCompleting,
  isMit,
  isSecondary,
}: {
  task: TaskItem;
  onComplete: () => void;
  isCompleting: boolean;
  isMit?: boolean;
  isSecondary?: boolean;
}) {
  const completed = task.status === "COMPLETED";

  return (
    <div
      className={cn(
        "group flex items-start gap-2 p-2 rounded-lg transition-all",
        isMit && !completed && "bg-lantern/10 border border-lantern/20",
        !isMit && !isSecondary && !completed && "bg-night-soft/50",
        isSecondary && !completed && "opacity-70",
        completed && "opacity-50"
      )}
    >
      <button
        onClick={onComplete}
        disabled={isCompleting || completed}
        className={cn(
          "w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center",
          "border transition-all",
          completed
            ? "bg-zen-green border-zen-green"
            : isMit
            ? "border-lantern hover:bg-lantern/20"
            : "border-moon-faint hover:border-moon"
        )}
      >
        {isCompleting ? (
          <Loader2 className="w-2.5 h-2.5 animate-spin text-moon-faint" />
        ) : completed ? (
          <CheckCircle2 className="w-3 h-3 text-void" />
        ) : null}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs leading-tight",
            completed ? "line-through text-moon-faint" : "text-moon-soft",
            isMit && !completed && "text-lantern font-medium"
          )}
        >
          {task.title}
        </p>
        {isMit && !completed && (
          <span className="text-[0.625rem] text-lantern/70 uppercase tracking-wider">
            MIT
          </span>
        )}
      </div>
    </div>
  );
}

export default function WeekPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const startDate = formatDateKey(weekDates[0]);
  const endDate = formatDateKey(weekDates[6]);

  const { data: goalsData } = useGoals("weekly");
  const { data: tasksData, isLoading: tasksLoading, refetch } = useWeekTasks(startDate, endDate);
  const completeTask = useCompleteTask();
  const updateTask = useUpdateTask();

  const weeklyGoals = (goalsData?.goals || []) as Array<{
    id: string;
    title: string;
    status: string;
    category: string;
  }>;

  const tasksByDate = tasksData?.tasksByDate || {};
  const stats = tasksData?.stats;

  const goToThisWeek = () => setWeekOffset(0);
  const goToPrevWeek = () => setWeekOffset(weekOffset - 1);
  const goToNextWeek = () => setWeekOffset(weekOffset + 1);

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      await completeTask.mutateAsync(taskId);
      toast.success("Task completed!");
      refetch();
    } catch {
      toast.error("Failed to complete task");
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleUncompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      await updateTask.mutateAsync({ id: taskId, status: "PENDING" });
      toast.success("Task reopened");
      refetch();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleToggleTask = (task: TaskItem) => {
    if (task.status === "COMPLETED") {
      handleUncompleteTask(task.id);
    } else {
      handleCompleteTask(task.id);
    }
  };

  const handleAddTask = (date: Date) => {
    setCreateModalDate(date);
    setCreateModalOpen(true);
  };

  // Calculate week stats
  const weekStats = useMemo(() => {
    if (!stats) return { completed: 0, total: 0, mitsCompleted: 0, mitsTotal: 0 };

    const allTasks = tasksData?.tasks || [];
    const mits = allTasks.filter((t) => t.priority === "MIT");
    const mitsCompleted = mits.filter((t) => t.status === "COMPLETED").length;

    return {
      completed: stats.completed,
      total: stats.total,
      mitsCompleted,
      mitsTotal: mits.length,
    };
  }, [stats, tasksData?.tasks]);

  return (
    <AppShell>
      <PageHeader title="Week View" subtitle={formatWeekRange(weekDates)}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevWeek}
            className="h-9 w-9 p-0 border-night-mist bg-night-soft hover:bg-night-mist"
          >
            <ChevronLeft className="w-4 h-4 text-moon-soft" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToThisWeek}
            disabled={weekOffset === 0}
            className="h-9 px-3 border-night-mist bg-night-soft hover:bg-night-mist text-moon-soft text-sm"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="h-9 w-9 p-0 border-night-mist bg-night-soft hover:bg-night-mist"
          >
            <ChevronRight className="w-4 h-4 text-moon-soft" />
          </Button>
        </div>
      </PageHeader>

      {/* Week Stats Bar */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-night border border-night-mist rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zen-green/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-zen-green" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-moon">
              {weekStats.completed}
              <span className="text-moon-faint text-base font-normal">/{weekStats.total}</span>
            </p>
            <p className="text-xs text-moon-dim">Tasks completed</p>
          </div>
        </div>

        <div className="w-px h-10 bg-night-mist" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lantern/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-lantern" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-lantern">
              {weekStats.mitsCompleted}
              <span className="text-moon-faint text-base font-normal">/{weekStats.mitsTotal}</span>
            </p>
            <p className="text-xs text-moon-dim">MITs completed</p>
          </div>
        </div>

        <div className="w-px h-10 bg-night-mist" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center">
            <Target className="w-5 h-5 text-moon-soft" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-moon">
              {weeklyGoals.filter((g) => g.status === "COMPLETED").length}
              <span className="text-moon-faint text-base font-normal">/{weeklyGoals.length}</span>
            </p>
            <p className="text-xs text-moon-dim">Weekly goals</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 ml-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-moon-dim">Week Progress</span>
            <span className="text-xs font-medium text-moon">
              {weekStats.total > 0
                ? Math.round((weekStats.completed / weekStats.total) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="h-2 bg-night-mist rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lantern to-zen-green rounded-full transition-all duration-500"
              style={{
                width: `${
                  weekStats.total > 0
                    ? (weekStats.completed / weekStats.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Week Calendar Grid */}
      {tasksLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {weekDates.map((date) => {
            const dateKey = formatDateKey(date);
            const dayTasks = (tasksByDate[dateKey] || []) as TaskItem[];

            return (
              <DayColumn
                key={dateKey}
                date={date}
                tasks={dayTasks}
                onCompleteTask={(taskId) => {
                  const task = dayTasks.find((t) => t.id === taskId);
                  if (task) handleToggleTask(task);
                }}
                onAddTask={handleAddTask}
                isCompletingTask={completingTaskId}
              />
            );
          })}
        </div>
      )}

      {/* Weekly Goals Section */}
      <div className="mt-8 bg-night border border-night-mist rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center">
              <Target className="w-5 h-5 text-lantern" />
            </div>
            <div>
              <h3 className="font-medium text-moon">Weekly Goals</h3>
              <p className="text-sm text-moon-dim">
                {weeklyGoals.filter((g) => g.status === "COMPLETED").length} of{" "}
                {weeklyGoals.length} completed
              </p>
            </div>
          </div>
          <Link href="/goals?level=weekly">
            <Button
              variant="outline"
              size="sm"
              className="border-night-mist bg-night-soft hover:bg-night-mist text-moon-soft"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Goal
            </Button>
          </Link>
        </div>

        {weeklyGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-10 h-10 text-moon-faint mx-auto mb-3" />
            <p className="text-moon-dim text-sm">No weekly goals yet</p>
            <Link href="/goals?level=weekly">
              <Button variant="link" className="text-lantern hover:text-lantern/80 mt-2">
                Create your first weekly goal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weeklyGoals.map((goal) => (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="flex items-center gap-3 p-3 bg-night-soft rounded-xl hover:bg-night-mist transition-colors"
              >
                {goal.status === "COMPLETED" ? (
                  <CheckCircle2 className="w-5 h-5 text-zen-green flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-moon-faint flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm flex-1",
                    goal.status === "COMPLETED" ? "text-moon-dim line-through" : "text-moon"
                  )}
                >
                  {goal.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Review CTA */}
      <div className="mt-6 bg-night border border-night-mist rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-moon mb-1">Ready for your weekly review?</h3>
            <p className="text-sm text-moon-dim">
              Reflect on your progress and plan for next week
            </p>
          </div>
          <Link href="/review/weekly">
            <Button className="bg-lantern text-void hover:bg-lantern/90">Start Review</Button>
          </Link>
        </div>
      </div>

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        scheduledDate={createModalDate ? formatDateKey(createModalDate) : undefined}
      />
    </AppShell>
  );
}

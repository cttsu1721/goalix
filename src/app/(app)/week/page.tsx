"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
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
  ChevronDown,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals, useWeekTasks, useCompleteTask, useUpdateTask } from "@/hooks";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { toast } from "sonner";
import Link from "next/link";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// Get dates for the current week (Monday to Sunday)
function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay;

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

// Draggable task row with full title visibility
function DraggableTaskRow({
  task,
  onComplete,
  isCompleting,
  isDragging: isCurrentlyDragging,
}: {
  task: TaskItem;
  onComplete: () => void;
  isCompleting: boolean;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completed = task.status === "COMPLETED";
  const isMit = task.priority === "MIT";
  const isPrimary = task.priority === "PRIMARY";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 py-3 px-4 rounded-xl transition-all duration-200",
        "hover:bg-sakura-100/50",
        isMit && !completed && "bg-gradient-to-r from-sakura-100 to-transparent border-l-2 border-sakura-400",
        completed && "opacity-50",
        isDragging && "opacity-50 shadow-lg z-50",
        isCurrentlyDragging && "ring-2 ring-sakura-300"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center cursor-grab active:cursor-grabbing text-moon-faint hover:text-moon-dim touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        onClick={onComplete}
        disabled={isCompleting}
        className={cn(
          "w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center",
          "border-2 transition-all duration-200",
          completed
            ? "bg-zen-green border-zen-green"
            : isMit
            ? "border-sakura-400 hover:bg-sakura-100"
            : "border-moon-dim/40 hover:border-moon-dim"
        )}
      >
        {isCompleting ? (
          <Loader2 className="w-3 h-3 animate-spin text-moon-faint" />
        ) : completed ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-relaxed",
            completed ? "line-through text-moon-faint" : "text-moon",
            isMit && !completed && "font-medium text-sakura-700"
          )}
        >
          {task.title}
        </p>
        {isMit && !completed && (
          <span className="inline-flex items-center gap-1 mt-1 text-[0.65rem] text-sakura-500 uppercase tracking-wider font-medium">
            <Sparkles className="w-3 h-3" />
            Most Important Task
          </span>
        )}
      </div>

      {/* Priority indicator */}
      <div className={cn(
        "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2",
        isMit ? "bg-sakura-400" : isPrimary ? "bg-lantern/60" : "bg-moon-dim/30"
      )} />
    </div>
  );
}

// Non-draggable task row for drag overlay
function TaskRowOverlay({ task }: { task: TaskItem }) {
  const completed = task.status === "COMPLETED";
  const isMit = task.priority === "MIT";
  const isPrimary = task.priority === "PRIMARY";

  return (
    <div
      className={cn(
        "flex items-start gap-2 py-3 px-4 rounded-xl bg-white shadow-xl border border-sakura-200",
        isMit && !completed && "bg-gradient-to-r from-sakura-100 to-white border-l-2 border-sakura-400",
        completed && "opacity-50"
      )}
    >
      <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center text-moon-dim">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className={cn(
        "w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center",
        "border-2",
        completed
          ? "bg-zen-green border-zen-green"
          : isMit
          ? "border-sakura-400"
          : "border-moon-dim/40"
      )}>
        {completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-relaxed",
          completed ? "line-through text-moon-faint" : "text-moon",
          isMit && !completed && "font-medium text-sakura-700"
        )}>
          {task.title}
        </p>
      </div>

      <div className={cn(
        "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2",
        isMit ? "bg-sakura-400" : isPrimary ? "bg-lantern/60" : "bg-moon-dim/30"
      )} />
    </div>
  );
}

// Day section - expandable with elegant animation and droppable zone
function DaySection({
  date,
  tasks,
  onCompleteTask,
  onAddTask,
  isCompletingTask,
  defaultExpanded = false,
  activeTaskId,
  dateKey,
}: {
  date: Date;
  tasks: TaskItem[];
  onCompleteTask: (task: TaskItem) => void;
  onAddTask: (date: Date) => void;
  isCompletingTask: string | null;
  defaultExpanded?: boolean;
  activeTaskId: string | null;
  dateKey: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || tasks.length > 0);
  const today = isToday(date);
  const past = isPast(date);

  // Make this day a droppable zone
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateKey}`,
    data: { date: dateKey },
  });

  const dayName = date.toLocaleDateString("en-AU", { weekday: "long" });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString("en-AU", { month: "short" });

  const mit = tasks.find((t) => t.priority === "MIT");
  const primary = tasks.filter((t) => t.priority === "PRIMARY");
  const secondary = tasks.filter((t) => t.priority === "SECONDARY");
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;

  // For today, always show expanded
  const showExpanded = today || isExpanded;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl transition-all duration-300",
        today
          ? "bg-gradient-to-br from-sakura-50 via-white to-sakura-50/50 border-2 border-sakura-200 shadow-lg shadow-sakura-100/50"
          : "bg-white/80 border border-night-mist/30 hover:border-sakura-200/50",
        past && !today && "opacity-70",
        isOver && "ring-2 ring-sakura-400 ring-offset-2 bg-sakura-50/50"
      )}
    >
      {/* Day Header - Always Visible */}
      <button
        onClick={() => !today && setIsExpanded(!isExpanded)}
        disabled={today}
        className={cn(
          "w-full flex items-center gap-4 p-4 text-left",
          !today && "cursor-pointer hover:bg-sakura-50/30 rounded-2xl transition-colors"
        )}
      >
        {/* Date Badge */}
        <div className={cn(
          "flex flex-col items-center justify-center w-14 h-14 rounded-xl flex-shrink-0",
          today
            ? "bg-sakura-200 border-2 border-sakura-300"
            : "bg-night-soft/50"
        )}>
          <span className={cn(
            "text-[0.6rem] uppercase tracking-wider font-medium",
            today ? "text-sakura-600" : "text-moon-dim"
          )}>
            {dayName.slice(0, 3)}
          </span>
          <span className={cn(
            "text-xl font-semibold leading-none",
            today ? "text-sakura-700" : "text-moon-dim"
          )}>
            {dayNum}
          </span>
        </div>

        {/* Day Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-medium",
              today ? "text-sakura-700" : "text-moon"
            )}>
              {today ? "Today" : dayName}
            </h3>
            {today && (
              <span className="px-2 py-0.5 bg-sakura-100 text-sakura-600 text-[0.65rem] rounded-full font-medium uppercase tracking-wider">
                Focus Day
              </span>
            )}
          </div>
          <p className="text-sm text-moon-dim mt-0.5">
            {monthName} {dayNum}
            {total > 0 && (
              <span className="ml-2">
                · {completed}/{total} tasks
              </span>
            )}
          </p>
        </div>

        {/* Progress Ring */}
        {total > 0 && (
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg className="w-10 h-10 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-night-mist/30"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(completed / total) * 100.5} 100.5`}
                strokeLinecap="round"
                className={cn(
                  today ? "text-sakura-400" : "text-zen-green"
                )}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[0.65rem] font-medium text-moon-dim">
              {Math.round((completed / total) * 100)}%
            </span>
          </div>
        )}

        {/* Expand Toggle (not for today) */}
        {!today && (
          <ChevronDown
            className={cn(
              "w-5 h-5 text-moon-faint transition-transform duration-200",
              showExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Tasks - Expandable */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          showExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4">
          {/* Tasks List */}
          {tasks.length > 0 ? (
            <div className="space-y-1">
              {/* MIT First */}
              {mit && (
                <DraggableTaskRow
                  task={mit}
                  onComplete={() => onCompleteTask(mit)}
                  isCompleting={isCompletingTask === mit.id}
                  isDragging={activeTaskId === mit.id}
                />
              )}

              {/* Primary Tasks */}
              {primary.map((task) => (
                <DraggableTaskRow
                  key={task.id}
                  task={task}
                  onComplete={() => onCompleteTask(task)}
                  isCompleting={isCompletingTask === task.id}
                  isDragging={activeTaskId === task.id}
                />
              ))}

              {/* Secondary Tasks */}
              {secondary.length > 0 && (
                <div className="pt-2 mt-2 border-t border-night-mist/20">
                  <p className="text-[0.65rem] uppercase tracking-wider text-moon-faint px-4 mb-1">
                    Secondary
                  </p>
                  {secondary.map((task) => (
                    <DraggableTaskRow
                      key={task.id}
                      task={task}
                      onComplete={() => onCompleteTask(task)}
                      isCompleting={isCompletingTask === task.id}
                      isDragging={activeTaskId === task.id}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Calendar className="w-8 h-8 text-moon-faint/30 mx-auto mb-2" />
              <p className="text-sm text-moon-faint">
                {isOver ? "Drop task here" : "No tasks scheduled"}
              </p>
            </div>
          )}

          {/* Add Task Button */}
          {!past && (
            <button
              onClick={() => onAddTask(date)}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 mt-3 rounded-xl",
                "text-sm text-moon-dim hover:text-sakura-600",
                "border border-dashed border-night-mist/40 hover:border-sakura-300",
                "hover:bg-sakura-50/50 transition-all duration-200"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WeekPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const startDate = formatDateKey(weekDates[0]);
  const endDate = formatDateKey(weekDates[6]);

  const { data: goalsData } = useGoals("weekly");
  const { data: tasksData, isLoading: tasksLoading, refetch } = useWeekTasks(startDate, endDate);
  const completeTask = useCompleteTask();
  const updateTask = useUpdateTask();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    setActiveTaskId(taskId);

    // Find the task being dragged
    const allTasks = tasksData?.tasks || [];
    const task = allTasks.find((t) => t.id === taskId) as TaskItem | undefined;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTaskId(null);
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Extract date from droppable ID (format: "day-YYYY-MM-DD")
    if (!overId.startsWith("day-")) return;
    const newDateKey = overId.replace("day-", "");

    // Find current task to check if date changed
    const allTasks = tasksData?.tasks || [];
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentDateKey = formatDateKey(new Date(task.scheduledDate));
    if (currentDateKey === newDateKey) return; // No change

    // Update task date
    try {
      await updateTask.mutateAsync({ id: taskId, scheduledDate: newDateKey });
      toast.success("Task moved to " + new Date(newDateKey).toLocaleDateString("en-AU", { weekday: "long", month: "short", day: "numeric" }));
      refetch();
    } catch {
      toast.error("Failed to move task");
    }
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
    setActiveTask(null);
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

  // Separate today from other days
  const todayIndex = weekDates.findIndex(isToday);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-moon">Week View</h1>
          <p className="text-moon-dim mt-1">{formatWeekRange(weekDates)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevWeek}
            className="h-9 w-9 p-0 border-night-mist bg-white hover:bg-sakura-50"
          >
            <ChevronLeft className="w-4 h-4 text-moon-soft" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToThisWeek}
            disabled={weekOffset === 0}
            className="h-9 px-4 border-night-mist bg-white hover:bg-sakura-50 text-moon-soft text-sm"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="h-9 w-9 p-0 border-night-mist bg-white hover:bg-sakura-50"
          >
            <ChevronRight className="w-4 h-4 text-moon-soft" />
          </Button>
        </div>
      </div>

      {/* Week Stats Bar */}
      <div className="flex items-center gap-6 mb-6 p-5 bg-white/80 border border-night-mist/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-zen-green/10 flex items-center justify-center">
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

        <div className="w-px h-10 bg-night-mist/30" />

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sakura-100 flex items-center justify-center">
            <Flame className="w-5 h-5 text-sakura-500" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-sakura-600">
              {weekStats.mitsCompleted}
              <span className="text-moon-faint text-base font-normal">/{weekStats.mitsTotal}</span>
            </p>
            <p className="text-xs text-moon-dim">MITs completed</p>
          </div>
        </div>

        <div className="w-px h-10 bg-night-mist/30" />

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-night-soft/50 flex items-center justify-center">
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
                : 0}%
            </span>
          </div>
          <div className="h-2 bg-night-mist/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sakura-400 to-zen-green rounded-full transition-all duration-500"
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

      {/* Days List */}
      {tasksLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-sakura-400" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="space-y-3">
            {weekDates.map((date, index) => {
              const dateKey = formatDateKey(date);
              const dayTasks = (tasksByDate[dateKey] || []) as TaskItem[];

              return (
                <DaySection
                  key={dateKey}
                  date={date}
                  dateKey={dateKey}
                  tasks={dayTasks}
                  onCompleteTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  isCompletingTask={completingTaskId}
                  defaultExpanded={index === todayIndex}
                  activeTaskId={activeTaskId}
                />
              );
            })}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <TaskRowOverlay task={activeTask} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Weekly Goals Section */}
      <div className="mt-8 bg-white/80 border border-night-mist/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sakura-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-sakura-500" />
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
              className="border-night-mist bg-white hover:bg-sakura-50 text-moon-soft"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Goal
            </Button>
          </Link>
        </div>

        {weeklyGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-10 h-10 text-moon-faint/30 mx-auto mb-3" />
            <p className="text-moon-dim text-sm">No weekly goals yet</p>
            <Link href="/goals?level=weekly">
              <Button variant="link" className="text-sakura-500 hover:text-sakura-600 mt-2">
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
                className="flex items-center gap-3 p-4 bg-night-soft/30 rounded-xl hover:bg-sakura-50/50 transition-colors"
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
      <div className="mt-6 bg-gradient-to-r from-sakura-50 to-white border border-sakura-200/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-moon mb-1">Ready for your weekly review?</h3>
            <p className="text-sm text-moon-dim">
              Reflect on your progress and plan for next week
            </p>
          </div>
          <Link href="/review/weekly">
            <Button className="bg-sakura-500 text-white hover:bg-sakura-600 shadow-md shadow-sakura-200">
              Start Review
            </Button>
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

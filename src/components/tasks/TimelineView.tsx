"use client";

import { useMemo } from "react";
import { Clock, Check, AlertTriangle, Target, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineTask {
  id: string;
  title: string;
  completed: boolean;
  priority: "MIT" | "PRIMARY" | "SECONDARY";
  estimatedMinutes?: number;
  scheduledTime?: string; // HH:mm format
  goalTitle?: string;
}

interface TimelineViewProps {
  tasks: TimelineTask[];
  className?: string;
  onTaskClick?: (taskId: string) => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

export function TimelineView({
  tasks,
  className,
  onTaskClick,
}: TimelineViewProps) {
  const timeSlots = useMemo(() => getTimeSlots(), []);

  // Group tasks by scheduled time
  const tasksByTime = useMemo(() => {
    const map = new Map<string, TimelineTask[]>();

    // Initialize all slots
    timeSlots.forEach((slot) => map.set(slot, []));

    // Group tasks
    tasks.forEach((task) => {
      if (task.scheduledTime) {
        const hour = task.scheduledTime.split(":")[0];
        const slotKey = `${hour}:00`;
        const existing = map.get(slotKey) || [];
        map.set(slotKey, [...existing, task]);
      }
    });

    return map;
  }, [tasks, timeSlots]);

  // Unscheduled tasks
  const unscheduledTasks = tasks.filter((t) => !t.scheduledTime);

  // Calculate totals
  const totalEstimated = tasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 0),
    0
  );
  const completedEstimated = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  // Current time indicator
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-night-soft rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-moon-faint" />
          <span className="text-sm text-moon-dim">Estimated time:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-moon">
            {formatDuration(totalEstimated)}
          </span>
          {completedEstimated > 0 && (
            <span className="text-xs text-zen-green">
              ({formatDuration(completedEstimated)} done)
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Time column + tasks */}
        <div className="space-y-0">
          {timeSlots.map((slot) => {
            const slotTasks = tasksByTime.get(slot) || [];
            const hour = parseInt(slot.split(":")[0]);
            const isCurrentHour = hour === currentHour;
            const isPastHour = hour < currentHour;

            return (
              <div
                key={slot}
                className={cn(
                  "flex min-h-[60px]",
                  "border-l-2 ml-12",
                  isCurrentHour
                    ? "border-lantern"
                    : isPastHour
                    ? "border-night-mist"
                    : "border-night-glow"
                )}
              >
                {/* Time label */}
                <div
                  className={cn(
                    "absolute left-0 w-10 text-right pr-2 -mt-2",
                    "text-xs",
                    isCurrentHour
                      ? "text-lantern font-medium"
                      : isPastHour
                      ? "text-moon-faint"
                      : "text-moon-dim"
                  )}
                >
                  {slot}
                </div>

                {/* Current time indicator */}
                {isCurrentHour && (
                  <div
                    className="absolute left-10 right-0 flex items-center"
                    style={{
                      top: `${(currentMinute / 60) * 60}px`,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-lantern -ml-1" />
                    <div className="flex-1 h-px bg-lantern/50" />
                  </div>
                )}

                {/* Tasks */}
                <div className="flex-1 pl-4 py-1 space-y-1">
                  {slotTasks.map((task) => (
                    <TimelineTaskItem
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-night-mist">
          <h4 className="text-xs text-moon-faint uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            Unscheduled ({unscheduledTasks.length})
          </h4>
          <div className="space-y-1">
            {unscheduledTasks.map((task) => (
              <TimelineTaskItem
                key={task.id}
                task={task}
                compact
                onClick={() => onTaskClick?.(task.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineTaskItem({
  task,
  compact = false,
  onClick,
}: {
  task: TimelineTask;
  compact?: boolean;
  onClick?: () => void;
}) {
  const priorityColors = {
    MIT: "border-l-lantern bg-lantern/5",
    PRIMARY: "border-l-zen-green bg-zen-green/5",
    SECONDARY: "border-l-moon-faint bg-night",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded-r-lg border-l-2",
        "hover:bg-night-soft transition-colors",
        priorityColors[task.priority],
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-center gap-2">
        {task.completed ? (
          <Check className="w-3.5 h-3.5 text-zen-green flex-shrink-0" />
        ) : task.priority === "MIT" ? (
          <Play className="w-3.5 h-3.5 text-lantern flex-shrink-0" />
        ) : (
          <div
            className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              task.priority === "PRIMARY" ? "bg-zen-green" : "bg-moon-faint"
            )}
          />
        )}
        <span
          className={cn(
            "text-sm truncate flex-1",
            task.completed ? "line-through text-moon-faint" : "text-moon"
          )}
        >
          {task.title}
        </span>
        {task.estimatedMinutes && !compact && (
          <span className="text-xs text-moon-faint flex-shrink-0">
            {formatDuration(task.estimatedMinutes)}
          </span>
        )}
      </div>
      {task.goalTitle && !compact && (
        <div className="flex items-center gap-1 mt-1 ml-5">
          <Target className="w-3 h-3 text-moon-faint" />
          <span className="text-xs text-moon-faint truncate">
            {task.goalTitle}
          </span>
        </div>
      )}
    </button>
  );
}

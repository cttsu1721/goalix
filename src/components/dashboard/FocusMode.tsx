"use client";

import { useState } from "react";
import { Focus, ChevronRight, Clock, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  priority: "MIT" | "PRIMARY" | "SECONDARY";
  completed: boolean;
  estimatedMinutes?: number | null;
  scheduledDate: Date | string;
}

interface FocusModeProps {
  todayTasks: Task[];
  tomorrowTasks: Task[];
  className?: string;
}

/**
 * Focus mode showing only today + tomorrow tasks (6.5)
 * Minimizes cognitive load by hiding everything else
 */
export function FocusMode({
  todayTasks,
  tomorrowTasks,
  className,
}: FocusModeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter for incomplete tasks
  const todayIncomplete = todayTasks.filter((t) => !t.completed);
  const tomorrowIncomplete = tomorrowTasks.filter((t) => !t.completed);

  // Sort by priority
  const priorityOrder = { MIT: 0, PRIMARY: 1, SECONDARY: 2 };
  const sortedToday = [...todayIncomplete].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  const sortedTomorrow = [...tomorrowIncomplete].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // Calculate total time
  const todayTime = todayIncomplete.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 0),
    0
  );
  const tomorrowTime = tomorrowIncomplete.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 0),
    0
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("text-moon-dim hover:text-moon", className)}
      >
        <Focus className="w-4 h-4 mr-2" />
        Focus Mode
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-void border-night-mist p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-night via-night-soft to-void p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-moon">
                <Focus className="w-5 h-5 text-lantern" />
                Focus Mode
              </DialogTitle>
              <DialogDescription className="text-moon-dim">
                Just today and tomorrow. Nothing else matters right now.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Today Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-moon flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-lantern" />
                  Today
                </h3>
                {todayTime > 0 && (
                  <span className="text-xs text-moon-faint flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(todayTime)}
                  </span>
                )}
              </div>

              {sortedToday.length === 0 ? (
                <p className="text-sm text-zen-green py-4 text-center">
                  ✓ All done for today!
                </p>
              ) : (
                <ul className="space-y-2">
                  {sortedToday.map((task) => (
                    <FocusTaskItem key={task.id} task={task} />
                  ))}
                </ul>
              )}
            </div>

            {/* Tomorrow Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-moon-dim flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Tomorrow
                </h3>
                {tomorrowTime > 0 && (
                  <span className="text-xs text-moon-faint flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(tomorrowTime)}
                  </span>
                )}
              </div>

              {sortedTomorrow.length === 0 ? (
                <p className="text-sm text-moon-dim py-4 text-center">
                  No tasks scheduled yet
                </p>
              ) : (
                <ul className="space-y-2 opacity-75">
                  {sortedTomorrow.slice(0, 5).map((task) => (
                    <FocusTaskItem key={task.id} task={task} />
                  ))}
                  {sortedTomorrow.length > 5 && (
                    <p className="text-xs text-moon-faint text-center pt-2">
                      +{sortedTomorrow.length - 5} more tasks
                    </p>
                  )}
                </ul>
              )}
            </div>

            {/* Focus tip */}
            <div className="p-4 bg-night-soft rounded-lg border border-night-mist">
              <p className="text-xs text-moon-dim">
                <span className="text-lantern font-medium">Pro tip: </span>
                Focus on completing your MIT first. Everything else is a bonus.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FocusTaskItem({ task }: { task: Task }) {
  const priorityStyles = {
    MIT: "border-l-lantern bg-lantern/5",
    PRIMARY: "border-l-zen-blue bg-zen-blue/5",
    SECONDARY: "border-l-night-glow bg-night",
  };

  return (
    <li
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-l-4 transition-all",
        priorityStyles[task.priority]
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-moon truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {task.priority === "MIT" && (
            <span className="text-xs px-1.5 py-0.5 bg-lantern/10 text-lantern rounded">
              MIT
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="text-xs text-moon-faint flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedMinutes}m
            </span>
          )}
        </div>
      </div>
      <Target
        className={cn(
          "w-4 h-4 flex-shrink-0",
          task.priority === "MIT" ? "text-lantern" : "text-moon-faint"
        )}
      />
    </li>
  );
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Floating focus mode toggle for mobile
 */
export function FocusModeToggle({
  isActive,
  onToggle,
  className,
}: {
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        isActive
          ? "bg-lantern text-void"
          : "bg-night-soft border border-night-mist text-moon-dim hover:bg-night",
        className
      )}
    >
      <Focus className="w-3.5 h-3.5" />
      {isActive ? "Exit Focus" : "Focus"}
    </button>
  );
}

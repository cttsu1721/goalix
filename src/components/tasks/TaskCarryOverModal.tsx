"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Moon, ArrowRight, X, AlertTriangle } from "lucide-react";
import type { TaskPriority } from "@prisma/client";

const CARRY_OVER_DISMISSED_KEY = "goalzenix_carry_over_dismissed";

interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  category?: string;
}

interface TaskCarryOverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incompleteTasks: Task[];
  onCarryOver: (taskIds: string[]) => Promise<void>;
  onSkip: () => void;
}

export function TaskCarryOverModal({
  open,
  onOpenChange,
  incompleteTasks,
  onCarryOver,
  onSkip,
}: TaskCarryOverModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
    new Set(incompleteTasks.map((t) => t.id))
  );
  const [isCarrying, setIsCarrying] = useState(false);

  // Group tasks by priority
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {
      MIT: [],
      PRIMARY: [],
      SECONDARY: [],
    };

    incompleteTasks.forEach((task) => {
      groups[task.priority].push(task);
    });

    return groups;
  }, [incompleteTasks]);

  const toggleTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleAll = () => {
    if (selectedTasks.size === incompleteTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(incompleteTasks.map((t) => t.id)));
    }
  };

  const handleCarryOver = async () => {
    if (selectedTasks.size === 0) {
      onSkip();
      return;
    }

    setIsCarrying(true);
    try {
      await onCarryOver(Array.from(selectedTasks));
      // Mark as dismissed for today
      markAsDismissed();
      onOpenChange(false);
    } finally {
      setIsCarrying(false);
    }
  };

  const handleSkip = () => {
    markAsDismissed();
    onSkip();
  };

  const priorityLabels: Record<string, { label: string; color: string }> = {
    MIT: { label: "MIT", color: "text-lantern" },
    PRIMARY: { label: "Primary", color: "text-zen-green" },
    SECONDARY: { label: "Secondary", color: "text-moon-faint" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-night border-night-mist">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-night-soft flex items-center justify-center">
              <Moon className="w-5 h-5 text-lantern" />
            </div>
            <div>
              <DialogTitle className="text-moon">Wrapping Up Today</DialogTitle>
              <DialogDescription className="text-moon-faint text-sm">
                You have {incompleteTasks.length} incomplete task
                {incompleteTasks.length !== 1 ? "s" : ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Select all toggle */}
          <button
            onClick={toggleAll}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-night-soft hover:bg-night-glow transition-colors mb-4"
          >
            <span className="text-sm text-moon-dim">
              Move tasks to tomorrow
            </span>
            <span className="text-xs text-lantern">
              {selectedTasks.size === incompleteTasks.length
                ? "Deselect all"
                : "Select all"}
            </span>
          </button>

          {/* Task list by priority */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {(["MIT", "PRIMARY", "SECONDARY"] as const).map((priority) => {
              const tasks = groupedTasks[priority];
              if (tasks.length === 0) return null;

              const { label, color } = priorityLabels[priority];

              return (
                <div key={priority}>
                  <div
                    className={cn(
                      "text-[0.625rem] font-medium uppercase tracking-[0.2em] mb-2",
                      color
                    )}
                  >
                    {label}
                    {priority === "MIT" && tasks.length > 0 && (
                      <span className="ml-2 text-moon-faint normal-case tracking-normal">
                        (will become regular task tomorrow)
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <label
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-night-soft hover:bg-night-glow cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="border-night-glow data-[state=checked]:bg-lantern data-[state=checked]:border-lantern"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-moon truncate">
                            {task.title}
                          </div>
                          {task.category && (
                            <div className="text-xs text-moon-faint">
                              {task.category}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning for MIT */}
          {groupedTasks.MIT.length > 0 &&
            selectedTasks.has(groupedTasks.MIT[0]?.id) && (
              <div className="mt-4 p-3 rounded-lg bg-lantern/10 border border-lantern/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-lantern flex-shrink-0 mt-0.5" />
                <p className="text-xs text-moon-dim">
                  Your MIT will become a Primary task tomorrow. Pick a new MIT
                  in the morning!
                </p>
              </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1 text-moon-dim hover:text-moon"
          >
            <X className="w-4 h-4 mr-2" />
            Skip
          </Button>
          <Button
            onClick={handleCarryOver}
            disabled={isCarrying}
            className="flex-1 bg-lantern text-void hover:bg-lantern/90"
          >
            {isCarrying ? (
              "Moving..."
            ) : (
              <>
                Move {selectedTasks.size} task{selectedTasks.size !== 1 ? "s" : ""}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Check if user should see carry-over prompt
 */
export function shouldShowCarryOverPrompt(): boolean {
  if (typeof window === "undefined") return false;

  // Check if it's evening (6pm - 11pm)
  const hour = new Date().getHours();
  if (hour < 18 || hour > 23) return false;

  // Check if already dismissed today
  const dismissed = localStorage.getItem(CARRY_OVER_DISMISSED_KEY);
  if (dismissed) {
    const dismissedDate = new Date(dismissed);
    const today = new Date();
    // Same day = already dismissed
    if (
      dismissedDate.getDate() === today.getDate() &&
      dismissedDate.getMonth() === today.getMonth() &&
      dismissedDate.getFullYear() === today.getFullYear()
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Mark carry-over as dismissed for today
 */
export function markAsDismissed(): void {
  localStorage.setItem(CARRY_OVER_DISMISSED_KEY, new Date().toISOString());
}

/**
 * Reset carry-over dismissal (for testing)
 */
export function resetCarryOverDismissal(): void {
  localStorage.removeItem(CARRY_OVER_DISMISSED_KEY);
}

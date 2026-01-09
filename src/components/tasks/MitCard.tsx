"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Trophy, Target, Link2Off, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextualTip } from "@/components/onboarding";

interface GoalChain {
  weeklyGoal?: {
    id: string;
    title: string;
  } | null;
  oneYearGoal?: {
    id: string;
    title: string;
  } | null;
  sevenYearVision?: {
    id: string;
    title: string;
    description?: string | null;
  } | null;
}

interface DroppedTask {
  id: string;
  title: string;
  priority: "PRIMARY" | "SECONDARY";
}

interface MitCardProps {
  task?: {
    id: string;
    title: string;
    category: string;
    estimatedMinutes?: number;
    completed: boolean;
    goalChain?: GoalChain;
  };
  onToggle?: () => void;
  onAiSuggest?: () => void;
  onDrop?: (droppedTask: DroppedTask) => void;
  isDraggingOver?: boolean;
  className?: string;
}

export function MitCard({ task, onToggle, onAiSuggest, onDrop, className }: MitCardProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Space or 'c' to toggle completion
      if (e.key === " " || e.key === "c") {
        e.preventDefault();
        onToggle?.();
      }
    },
    [onToggle]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDropTarget(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set to false if we're actually leaving the card (not entering a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDropTarget(false);
    }
  }, []);

  const handleDropEvent = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);

    try {
      const data = e.dataTransfer.getData("text/plain");
      const droppedTask: DroppedTask = JSON.parse(data);
      onDrop?.(droppedTask);
    } catch {
      // Invalid drop data
    }
  }, [onDrop]);

  if (!task) {
    return (
      <section className={cn("mb-5 sm:mb-12", className)}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropEvent}
          className={cn(
            "bg-night border rounded-xl sm:rounded-[20px] p-4 sm:p-8 relative overflow-hidden",
            "transition-all duration-200",
            isDropTarget
              ? "border-lantern border-dashed scale-[1.02] shadow-lg shadow-lantern/20"
              : "border-night-mist"
          )}
        >
          {/* Subtle gradient background */}
          <div className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-200",
            isDropTarget
              ? "bg-gradient-to-br from-lantern/20 to-transparent"
              : "bg-gradient-to-br from-lantern/5 to-transparent"
          )} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lantern" />
              <span className="text-[0.625rem] sm:text-[0.6875rem] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-lantern">
                Most Important Task
              </span>
            </div>
            <div className="text-center py-4 sm:py-8">
              {isDropTarget ? (
                <>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-lantern/20 flex items-center justify-center animate-pulse">
                    <ArrowUp className="w-6 h-6 text-lantern" />
                  </div>
                  <p className="text-lantern font-medium mb-2">Drop to promote to MIT</p>
                  <p className="text-moon-faint text-sm">This will become your #1 priority</p>
                </>
              ) : (
                <>
                  <p className="text-moon-dim mb-1.5 sm:mb-2 text-xs sm:text-base">No MIT set for today</p>
                  <p className="text-moon-faint/60 text-[0.625rem] sm:text-xs mb-3 sm:mb-4">Drag a task here to promote it</p>
                  <Button
                    variant="outline"
                    onClick={onAiSuggest}
                    className="bg-night-soft border-night-mist text-moon-soft hover:border-lantern hover:text-lantern hover:bg-lantern/5 h-9 sm:h-11 px-4 sm:px-5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    AI Suggest MIT
                  </Button>
                  <div className="mt-3 sm:mt-4">
                    <ContextualTip tipId="mit_importance" variant="inline" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("mb-5 sm:mb-12", className)}>
      <div
        tabIndex={0}
        role="button"
        aria-label={`${task.completed ? "Completed" : "Incomplete"} MIT: ${task.title}. Press space to toggle completion. Drop a task here to swap.`}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
        className={cn(
          "bg-night border rounded-xl sm:rounded-[20px] p-4 sm:p-8 relative overflow-hidden",
          "transition-all duration-200",
          // Focus ring for keyboard navigation
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-lantern focus-visible:ring-offset-2 focus-visible:ring-offset-night",
          // Drop target styling
          isDropTarget
            ? "border-lantern border-dashed scale-[1.02] shadow-lg shadow-lantern/20"
            : "border-night-mist"
        )}
      >
        {/* Accent bar - adjusted for mobile */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1 sm:w-[3px] transition-all duration-200",
          isDropTarget
            ? "bg-lantern"
            : "bg-gradient-to-b from-lantern via-lantern/50 to-transparent"
        )} />

        {/* Subtle gradient background */}
        <div className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-200",
          isDropTarget
            ? "bg-gradient-to-br from-lantern/20 to-transparent"
            : "bg-gradient-to-br from-lantern/5 to-transparent"
        )} />

        {/* Drop overlay when dragging over */}
        {isDropTarget && (
          <div className="absolute inset-0 flex items-center justify-center bg-night/80 z-10 rounded-2xl sm:rounded-[20px]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-lantern/20 flex items-center justify-center animate-pulse">
                <ArrowUp className="w-6 h-6 text-lantern" />
              </div>
              <p className="text-lantern font-medium mb-1">Drop to swap</p>
              <p className="text-moon-faint text-sm">Current MIT will move to the dropped task&apos;s priority</p>
            </div>
          </div>
        )}

        <div className="relative pl-3 sm:pl-6">
          {/* Label */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lantern" />
              <span className="text-[0.625rem] sm:text-[0.6875rem] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-lantern">
                Most Important Task
              </span>
            </div>
            <span className={cn(
              "text-xs sm:text-sm font-bold tabular-nums",
              task.completed ? "text-zen-green" : "text-lantern"
            )}>
              {task.completed ? "+100" : "100"} pts
            </span>
          </div>

          {/* Content - mobile-first layout */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Checkbox - 44px touch target */}
            <button
              tabIndex={-1}
              onClick={onToggle}
              className={cn(
                // Large touch target
                "w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0",
                "flex items-center justify-center",
                "-ml-1 -mt-1",
                "rounded-xl",
                "transition-all duration-300 active:scale-90"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border-2",
                  "flex items-center justify-center",
                  "transition-all duration-300",
                  task.completed
                    ? "bg-lantern border-lantern shadow-lg shadow-lantern/30"
                    : "border-night-glow"
                )}
              >
                {task.completed && (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-void" strokeWidth={2.5} />
                )}
              </div>
            </button>

            {/* Body */}
            <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
              <h3
                className={cn(
                  "text-base sm:text-xl font-medium leading-snug mb-1.5 sm:mb-2",
                  task.completed && "line-through text-moon-faint"
                )}
              >
                {task.title}
              </h3>

              {/* Goal Chain Connection */}
              {task.goalChain?.weeklyGoal ? (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-moon-dim mb-2">
                  <Target className="w-3.5 h-3.5 text-zen-green flex-shrink-0" />
                  <span className="truncate">
                    <span className="text-moon-faint">Supports:</span>{" "}
                    <span className="text-moon-soft">{task.goalChain.weeklyGoal.title}</span>
                    {task.goalChain.oneYearGoal && (
                      <>
                        <span className="text-moon-faint"> → </span>
                        <span className="text-lantern/80">{task.goalChain.oneYearGoal.title}</span>
                      </>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-moon-faint/70 mb-2">
                  <Link2Off className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Standalone task</span>
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-moon-faint">
                {task.estimatedMinutes && (
                  <span>
                    ~{Math.floor(task.estimatedMinutes / 60) > 0
                      ? `${Math.floor(task.estimatedMinutes / 60)}h`
                      : `${task.estimatedMinutes}m`}
                  </span>
                )}
                <span>{task.category}</span>
              </div>
            </div>
          </div>

          {/* AI Suggest - subtle, bottom aligned */}
          <div className="flex justify-end mt-4 sm:mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAiSuggest}
              className="text-moon-faint hover:text-lantern hover:bg-lantern/10 text-xs h-8 px-3 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Suggest
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

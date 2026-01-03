import { useCallback } from "react";
import { useCompleteTask, useUncompleteTask } from "./useTasks";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface UseTaskCompletionOptions {
  onLevelUp?: (newLevel: number) => void;
}

// Check if user prefers reduced motion
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useTaskCompletion(options: UseTaskCompletionOptions = {}) {
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const triggerConfetti = useCallback(() => {
    // Skip confetti if user prefers reduced motion
    if (prefersReducedMotion()) return;

    // Burst from the left
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.2, y: 0.6 },
      colors: ["#e8a857", "#7dd3a8", "#f0eef8", "#c4c2d0"],
    });

    // Burst from the right
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.8, y: 0.6 },
      colors: ["#e8a857", "#7dd3a8", "#f0eef8", "#c4c2d0"],
    });
  }, []);

  const handleUndo = useCallback(
    async (taskId: string) => {
      try {
        const result = await uncompleteTask.mutateAsync(taskId);
        toast.success("Task restored", {
          description: `${result.pointsRemoved} points removed`,
          duration: 2000,
        });
      } catch (error) {
        toast.error("Failed to undo", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    },
    [uncompleteTask]
  );

  const complete = useCallback(
    async (taskId: string, isMit: boolean = false) => {
      try {
        const result = await completeTask.mutateAsync(taskId);

        // Show confetti for MIT completion
        if (isMit) {
          triggerConfetti();
          toast.success("MIT Completed!", {
            description: `+${result.points.earned} points earned${
              result.points.streakBonus > 0
                ? ` (including +${result.points.streakBonus} streak bonus)`
                : ""
            }`,
            duration: 5000,
            action: {
              label: "Undo",
              onClick: () => handleUndo(taskId),
            },
          });
        } else {
          toast.success("Task completed", {
            description: `+${result.points.earned} points`,
            duration: 5000,
            action: {
              label: "Undo",
              onClick: () => handleUndo(taskId),
            },
          });
        }

        // Handle level up
        if (result.leveledUp && result.newLevel !== undefined) {
          const newLevel = result.newLevel;
          setTimeout(() => {
            toast.success(`Level Up!`, {
              description: `You've reached Level ${newLevel}!`,
              duration: 5000,
            });
            options.onLevelUp?.(newLevel);
          }, isMit ? 1500 : 500);
        }

        return result;
      } catch (error) {
        toast.error("Failed to complete task", {
          description: error instanceof Error ? error.message : "Please try again",
        });
        throw error;
      }
    },
    [completeTask, triggerConfetti, handleUndo, options]
  );

  const uncomplete = useCallback(
    async (taskId: string) => {
      return handleUndo(taskId);
    },
    [handleUndo]
  );

  return {
    complete,
    uncomplete,
    isPending: completeTask.isPending,
    isUndoing: uncompleteTask.isPending,
  };
}

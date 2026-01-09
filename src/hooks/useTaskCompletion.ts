import { useCallback } from "react";
import { useCompleteTask, useUncompleteTask } from "./useTasks";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { haptics } from "@/lib/haptics";
import { useCompletionFeedback } from "./useSoundEffects";

interface EarnedBadge {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
}

interface UseTaskCompletionOptions {
  onLevelUp?: (previousLevel: number, newLevel: number) => void;
  onFirstMit?: (pointsEarned: number) => void;
  onStreakMilestone?: (milestone: number) => void;
  onBadgeEarned?: (badge: EarnedBadge) => void;
}

// Check if user prefers reduced motion
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Check if this is the first MIT celebration
const FIRST_MIT_CELEBRATION_KEY = "goalzenix_first_mit_celebrated";
function hasSeenFirstMitCelebration(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(FIRST_MIT_CELEBRATION_KEY) === "true";
}

export function useTaskCompletion(options: UseTaskCompletionOptions = {}) {
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const { onTaskComplete, onBadgeEarned: playSoundBadge, onLevelUp: playSoundLevelUp, onUndo } = useCompletionFeedback();

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

  const triggerStreakMilestoneConfetti = useCallback(() => {
    // Skip confetti if user prefers reduced motion
    if (prefersReducedMotion()) return;

    // Flame-colored confetti for streak milestones - more intense burst
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#f97316", "#ea580c", "#fb923c", "#fbbf24", "#f59e0b"],
      gravity: 0.6,
      scalar: 1.3,
    });
  }, []);

  const handleUndo = useCallback(
    async (taskId: string) => {
      try {
        const result = await uncompleteTask.mutateAsync(taskId);
        haptics.taskUncomplete(); // Haptic feedback on undo
        onUndo(); // Sound effect for undo
        toast.success("Task restored", {
          description: `${result.pointsRemoved} points removed`,
          duration: 2000,
        });
      } catch (error) {
        haptics.error(); // Haptic feedback on error
        toast.error("Failed to undo", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    },
    [uncompleteTask, onUndo]
  );

  const complete = useCallback(
    async (taskId: string, isMit: boolean = false) => {
      try {
        const result = await completeTask.mutateAsync(taskId);
        haptics.taskComplete(); // Haptic feedback on completion
        onTaskComplete(isMit); // Sound effect for completion

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
          const previousLevel = newLevel - 1;
          setTimeout(() => {
            playSoundLevelUp(); // Sound effect for level up
            // Call the callback instead of showing a toast
            // The modal will handle the celebration
            options.onLevelUp?.(previousLevel, newLevel);
          }, isMit ? 1500 : 500);
        }

        // Handle earned badges
        if (result.badges && result.badges.length > 0) {
          // Show badges after level up (or after completion if no level up)
          const badgeDelay = result.leveledUp ? 3000 : (isMit ? 1500 : 500);
          result.badges.forEach((badge, index) => {
            setTimeout(() => {
              playSoundBadge(); // Sound effect for badge earned
              options.onBadgeEarned?.(badge);
            }, badgeDelay + index * 2000); // Stagger badges 2s apart
          });
        }

        // Handle streak milestone
        if (result.streak?.milestone) {
          const milestone = result.streak.milestone;
          const milestoneMessages: Record<number, string> = {
            7: "One week consistent. You're building momentum!",
            14: "Two weeks strong! This is becoming a habit.",
            30: "30 days! This is no longer effort — it's becoming lifestyle.",
            60: "60 days. Your conveyor belt is producing results.",
            90: "90 days! This habit is now instinctual.",
          };

          setTimeout(() => {
            triggerStreakMilestoneConfetti();
            toast.success(`🔥 ${milestone}-Day Streak!`, {
              description: milestoneMessages[milestone] || `Amazing ${milestone}-day streak!`,
              duration: 6000,
            });
            options.onStreakMilestone?.(milestone);
          }, result.leveledUp ? 2500 : (isMit ? 1500 : 500));
        }

        // Check for first MIT celebration
        if (isMit && !hasSeenFirstMitCelebration()) {
          // Delay slightly so the confetti and toast appear first
          setTimeout(() => {
            options.onFirstMit?.(result.points.earned);
          }, 2000);
        }

        return result;
      } catch (error) {
        haptics.error(); // Haptic feedback on error
        toast.error("Failed to complete task", {
          description: error instanceof Error ? error.message : "Please try again",
        });
        throw error;
      }
    },
    [completeTask, triggerConfetti, triggerStreakMilestoneConfetti, handleUndo, options, onTaskComplete, playSoundLevelUp, playSoundBadge]
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

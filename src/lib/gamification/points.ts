import type { TaskPriority } from "@prisma/client";

// Points configuration
export const POINTS_CONFIG = {
  task: {
    MIT: 100,
    PRIMARY: 50,
    SECONDARY: 25,
  },
  goal: {
    weekly: 200,
    monthly: 500,
    oneYear: 1000,
    fiveYear: 2500,
    dream: 5000,
  },
  bonus: {
    dailyPlanning: 50,
    weeklyReview: 100,
    monthlyReview: 200,
    kaizen: 25,
  },
  streak: {
    bonusPercentPerDay: 10, // +10% per day of streak
    maxBonusPercent: 100, // Cap at +100%
  },
} as const;

/**
 * Calculate points for completing a task
 */
export function calculateTaskPoints(priority: TaskPriority): number {
  return POINTS_CONFIG.task[priority] || 0;
}

/**
 * Calculate streak bonus multiplier
 * @param streakDays - Current streak in days
 * @returns Multiplier (1.0 - 2.0)
 */
export function calculateStreakMultiplier(streakDays: number): number {
  const bonusPercent = Math.min(
    streakDays * POINTS_CONFIG.streak.bonusPercentPerDay,
    POINTS_CONFIG.streak.maxBonusPercent
  );
  return 1 + bonusPercent / 100;
}

/**
 * Calculate total points with streak bonus
 */
export function calculatePointsWithStreak(
  basePoints: number,
  streakDays: number
): { basePoints: number; bonusPoints: number; totalPoints: number } {
  const multiplier = calculateStreakMultiplier(streakDays);
  const bonusPoints = Math.round(basePoints * (multiplier - 1));
  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
  };
}

/**
 * Calculate points for completing a goal
 */
export function calculateGoalPoints(
  level: "weekly" | "monthly" | "oneYear" | "fiveYear" | "dream"
): number {
  return POINTS_CONFIG.goal[level] || 0;
}

/**
 * Calculate bonus points breakdown for display
 */
export function formatPointsBreakdown(
  basePoints: number,
  streakDays: number
): string {
  const { bonusPoints, totalPoints } = calculatePointsWithStreak(
    basePoints,
    streakDays
  );

  if (bonusPoints > 0) {
    return `+${totalPoints} points earned (including +${bonusPoints} streak bonus)`;
  }
  return `+${totalPoints} points earned`;
}

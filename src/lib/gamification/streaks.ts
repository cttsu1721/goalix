import { prisma } from "@/lib/db";
import type { StreakType, Streak } from "@prisma/client";

/**
 * Check if an action was performed today (in user's timezone)
 */
export function isToday(date: Date | null, timezone: string = "UTC"): boolean {
  if (!date) return false;

  const now = new Date();
  const todayStart = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  todayStart.setHours(0, 0, 0, 0);

  const actionDate = new Date(
    date.toLocaleString("en-US", { timeZone: timezone })
  );
  actionDate.setHours(0, 0, 0, 0);

  return actionDate.getTime() === todayStart.getTime();
}

/**
 * Check if an action was performed yesterday (streak continuity)
 */
export function isYesterday(
  date: Date | null,
  timezone: string = "UTC"
): boolean {
  if (!date) return false;

  const now = new Date();
  const yesterdayStart = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const actionDate = new Date(
    date.toLocaleString("en-US", { timeZone: timezone })
  );
  actionDate.setHours(0, 0, 0, 0);

  return actionDate.getTime() === yesterdayStart.getTime();
}

/**
 * Check if streak is still active (action today or yesterday)
 */
export function isStreakActive(
  lastActionAt: Date | null,
  timezone: string = "UTC"
): boolean {
  return isToday(lastActionAt, timezone) || isYesterday(lastActionAt, timezone);
}

/**
 * Check how many days ago the last action was
 */
function daysSinceAction(date: Date | null, timezone: string = "UTC"): number {
  if (!date) return Infinity;

  const now = new Date();
  const todayStart = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  todayStart.setHours(0, 0, 0, 0);

  const actionDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  actionDate.setHours(0, 0, 0, 0);

  return Math.floor((todayStart.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Update or create a streak for a user
 */
export async function updateStreak(
  userId: string,
  type: StreakType,
  timezone: string = "UTC"
): Promise<{ streak: Streak; isNewStreak: boolean; levelUp: boolean; freezeUsed: boolean }> {
  const existingStreak = await prisma.streak.findUnique({
    where: {
      userId_type: { userId, type },
    },
  });

  const now = new Date();
  let isNewStreak = false;
  let levelUp = false;
  let freezeUsed = false;

  if (!existingStreak) {
    // Create new streak
    const streak = await prisma.streak.create({
      data: {
        userId,
        type,
        currentCount: 1,
        longestCount: 1,
        lastActionAt: now,
      },
    });
    isNewStreak = true;
    return { streak, isNewStreak, levelUp, freezeUsed };
  }

  // Check if action already done today
  if (isToday(existingStreak.lastActionAt, timezone)) {
    return { streak: existingStreak, isNewStreak: false, levelUp: false, freezeUsed: false };
  }

  // Check if streak should continue, use freeze, or reset
  let newCount: number;
  const daysMissed = daysSinceAction(existingStreak.lastActionAt, timezone);

  if (daysMissed === 1) {
    // Yesterday - continue streak normally
    newCount = existingStreak.currentCount + 1;
  } else if (daysMissed === 2) {
    // Missed yesterday - try to use a streak freeze
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakFreezes: true, lastFreezeAt: true },
    });

    const canUseFreeze = user && user.streakFreezes > 0 && !isToday(user.lastFreezeAt, timezone);

    if (canUseFreeze) {
      // Use a freeze to save the streak
      await prisma.user.update({
        where: { id: userId },
        data: {
          streakFreezes: { decrement: 1 },
          lastFreezeAt: now,
        },
      });
      newCount = existingStreak.currentCount + 1;
      freezeUsed = true;
    } else {
      // No freeze available - reset streak
      newCount = 1;
      isNewStreak = true;
    }
  } else {
    // Missed more than 1 day - reset streak (freeze only covers 1 missed day)
    newCount = 1;
    isNewStreak = true;
  }

  // Check for milestone level ups (7, 30, 80 days)
  const milestones = [7, 30, 80];
  if (milestones.includes(newCount) && !milestones.includes(existingStreak.currentCount)) {
    levelUp = true;
  }

  const streak = await prisma.streak.update({
    where: { id: existingStreak.id },
    data: {
      currentCount: newCount,
      longestCount: Math.max(existingStreak.longestCount, newCount),
      lastActionAt: now,
    },
  });

  return { streak, isNewStreak, levelUp, freezeUsed };
}

/**
 * Get user's streak freeze count
 */
export async function getUserStreakFreezes(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakFreezes: true },
  });
  return user?.streakFreezes ?? 0;
}

/**
 * Award a streak freeze to user (e.g., from completing weekly review)
 */
export async function awardStreakFreeze(userId: string, count: number = 1): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      streakFreezes: { increment: count },
    },
    select: { streakFreezes: true },
  });
  return user.streakFreezes;
}

/**
 * Get primary streak (MIT completion) for points calculation
 */
export async function getPrimaryStreakDays(userId: string): Promise<number> {
  const streak = await prisma.streak.findUnique({
    where: {
      userId_type: { userId, type: "MIT_COMPLETION" },
    },
    select: { currentCount: true, lastActionAt: true },
  });

  if (!streak) return 0;

  // Only count if streak is active
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });

  if (isStreakActive(streak.lastActionAt, user?.timezone || "UTC")) {
    return streak.currentCount;
  }

  return 0;
}

/**
 * Get all streaks for a user with active status
 */
export async function getUserStreaks(userId: string, timezone: string = "UTC") {
  const streaks = await prisma.streak.findMany({
    where: { userId },
    orderBy: { currentCount: "desc" },
  });

  return streaks.map((streak) => ({
    ...streak,
    isActive: isStreakActive(streak.lastActionAt, timezone),
  }));
}

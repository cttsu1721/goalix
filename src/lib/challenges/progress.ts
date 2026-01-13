import { prisma } from "@/lib/db";
import { startOfDay, startOfWeek, endOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface ProgressUpdate {
  challengeId: string;
  newValue: number;
  isCompleted: boolean;
}

/**
 * Update challenge progress when a task is completed
 */
export async function updateChallengeProgressOnTaskComplete(
  userId: string,
  timezone: string = "UTC",
  taskPriority: string,
  isLinkedToGoal: boolean,
  completedAt: Date
): Promise<ProgressUpdate[]> {
  const updates: ProgressUpdate[] = [];
  const userNow = toZonedTime(new Date(), timezone);
  const todayStart = startOfDay(userNow);
  const weekStart = startOfWeek(userNow, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(userNow, { weekStartsOn: 1 });

  // Get active challenges for today and this week
  const challenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      isCompleted: false,
      OR: [
        { type: "DAILY", periodStart: todayStart },
        { type: "WEEKLY", periodStart: weekStart },
      ],
    },
  });

  for (const challenge of challenges) {
    let newValue = challenge.currentValue;
    let shouldUpdate = false;

    switch (challenge.slug) {
      // Task completion challenges
      case "complete_3_tasks":
      case "complete_5_tasks":
      case "complete_20_tasks":
      case "complete_30_tasks":
        newValue = challenge.currentValue + 1;
        shouldUpdate = true;
        break;

      // MIT challenges
      case "complete_mit":
        if (taskPriority === "MIT") {
          newValue = 1;
          shouldUpdate = true;
        }
        break;

      case "mit_before_noon":
        if (taskPriority === "MIT") {
          const completedHour = toZonedTime(completedAt, timezone).getHours();
          if (completedHour < 12) {
            newValue = 1;
            shouldUpdate = true;
          }
        }
        break;

      case "mit_5_days":
      case "mit_7_days":
        if (taskPriority === "MIT") {
          // Count days with MIT completed this week
          const mitDays = await countMitDaysThisWeek(userId, weekStart, weekEnd);
          newValue = mitDays;
          shouldUpdate = true;
        }
        break;

      // Alignment challenges - handled separately in recalculate function
    }

    if (shouldUpdate && newValue !== challenge.currentValue) {
      const isCompleted = newValue >= challenge.targetValue;

      await prisma.userChallenge.update({
        where: { id: challenge.id },
        data: {
          currentValue: newValue,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      updates.push({
        challengeId: challenge.id,
        newValue,
        isCompleted,
      });
    }
  }

  return updates;
}

/**
 * Update challenge progress when Kaizen check-in is completed
 */
export async function updateChallengeProgressOnKaizen(
  userId: string,
  timezone: string = "UTC",
  areasChecked: number
): Promise<ProgressUpdate[]> {
  const updates: ProgressUpdate[] = [];
  const userNow = toZonedTime(new Date(), timezone);
  const todayStart = startOfDay(userNow);
  const weekStart = startOfWeek(userNow, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(userNow, { weekStartsOn: 1 });

  // Get active Kaizen challenges
  const challenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      isCompleted: false,
      category: "KAIZEN",
      OR: [
        { type: "DAILY", periodStart: todayStart },
        { type: "WEEKLY", periodStart: weekStart },
      ],
    },
  });

  for (const challenge of challenges) {
    let newValue = challenge.currentValue;
    let shouldUpdate = false;

    switch (challenge.slug) {
      case "kaizen_checkin":
        newValue = 1;
        shouldUpdate = true;
        break;

      case "kaizen_all_areas":
        newValue = areasChecked;
        shouldUpdate = true;
        break;

      case "kaizen_5_days":
      case "kaizen_7_days":
        // Count Kaizen days this week
        const kaizenDays = await countKaizenDaysThisWeek(userId, weekStart, weekEnd);
        newValue = kaizenDays;
        shouldUpdate = true;
        break;
    }

    if (shouldUpdate && newValue !== challenge.currentValue) {
      const isCompleted = newValue >= challenge.targetValue;

      await prisma.userChallenge.update({
        where: { id: challenge.id },
        data: {
          currentValue: newValue,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      updates.push({
        challengeId: challenge.id,
        newValue,
        isCompleted,
      });
    }
  }

  return updates;
}

/**
 * Recalculate alignment challenges (should be called after any task changes)
 */
export async function updateAlignmentChallenges(
  userId: string,
  timezone: string = "UTC"
): Promise<ProgressUpdate[]> {
  const updates: ProgressUpdate[] = [];
  const userNow = toZonedTime(new Date(), timezone);
  const todayStart = startOfDay(userNow);
  const weekStart = startOfWeek(userNow, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(userNow, { weekStartsOn: 1 });

  // Get active alignment challenges
  const challenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      isCompleted: false,
      category: "ALIGNMENT",
      OR: [
        { type: "DAILY", periodStart: todayStart },
        { type: "WEEKLY", periodStart: weekStart },
      ],
    },
  });

  for (const challenge of challenges) {
    let newValue = challenge.currentValue;
    let shouldUpdate = false;

    switch (challenge.slug) {
      case "all_tasks_aligned":
        // Check if all completed tasks today are linked
        const todayAlignment = await getDailyAlignmentRate(userId, todayStart);
        newValue = todayAlignment === 100 ? 1 : 0;
        shouldUpdate = true;
        break;

      case "weekly_alignment_80":
      case "weekly_alignment_100":
        // Get weekly alignment rate
        const weeklyAlignment = await getWeeklyAlignmentRate(
          userId,
          weekStart,
          weekEnd
        );
        newValue = weeklyAlignment;
        shouldUpdate = true;
        break;
    }

    if (shouldUpdate && newValue !== challenge.currentValue) {
      const isCompleted = newValue >= challenge.targetValue;

      await prisma.userChallenge.update({
        where: { id: challenge.id },
        data: {
          currentValue: newValue,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      updates.push({
        challengeId: challenge.id,
        newValue,
        isCompleted,
      });
    }
  }

  return updates;
}

/**
 * Update goal-related challenges
 */
export async function updateGoalChallenges(
  userId: string,
  timezone: string = "UTC",
  goalCompleted: boolean = false
): Promise<ProgressUpdate[]> {
  const updates: ProgressUpdate[] = [];
  const userNow = toZonedTime(new Date(), timezone);
  const weekStart = startOfWeek(userNow, { weekStartsOn: 1 });

  // Get active goal challenges
  const challenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      isCompleted: false,
      category: "GOALS",
      type: "WEEKLY",
      periodStart: weekStart,
    },
  });

  for (const challenge of challenges) {
    let newValue = challenge.currentValue;
    let shouldUpdate = false;

    switch (challenge.slug) {
      case "complete_weekly_goal":
        if (goalCompleted) {
          newValue = 1;
          shouldUpdate = true;
        }
        break;

      case "advance_3_goals":
        // Count goals with progress this week (via completed tasks)
        const goalsWithProgress = await countGoalsWithProgressThisWeek(
          userId,
          weekStart
        );
        newValue = goalsWithProgress;
        shouldUpdate = true;
        break;
    }

    if (shouldUpdate && newValue !== challenge.currentValue) {
      const isCompleted = newValue >= challenge.targetValue;

      await prisma.userChallenge.update({
        where: { id: challenge.id },
        data: {
          currentValue: newValue,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      updates.push({
        challengeId: challenge.id,
        newValue,
        isCompleted,
      });
    }
  }

  return updates;
}

// Helper functions

async function countMitDaysThisWeek(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<number> {
  const result = await prisma.dailyTask.groupBy({
    by: ["scheduledDate"],
    where: {
      userId,
      priority: "MIT",
      status: "COMPLETED",
      scheduledDate: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });
  return result.length;
}

async function countKaizenDaysThisWeek(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<number> {
  const count = await prisma.kaizenCheckin.count({
    where: {
      userId,
      checkinDate: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });
  return count;
}

async function getDailyAlignmentRate(
  userId: string,
  dayStart: Date
): Promise<number> {
  const tasks = await prisma.dailyTask.findMany({
    where: {
      userId,
      scheduledDate: dayStart,
      status: "COMPLETED",
    },
    select: { weeklyGoalId: true },
  });

  if (tasks.length === 0) return 0;

  const linkedCount = tasks.filter((t) => t.weeklyGoalId !== null).length;
  return Math.round((linkedCount / tasks.length) * 100);
}

async function getWeeklyAlignmentRate(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<number> {
  const tasks = await prisma.dailyTask.findMany({
    where: {
      userId,
      scheduledDate: {
        gte: weekStart,
        lte: weekEnd,
      },
      status: "COMPLETED",
    },
    select: { weeklyGoalId: true },
  });

  if (tasks.length === 0) return 0;

  const linkedCount = tasks.filter((t) => t.weeklyGoalId !== null).length;
  return Math.round((linkedCount / tasks.length) * 100);
}

async function countGoalsWithProgressThisWeek(
  userId: string,
  weekStart: Date
): Promise<number> {
  // Count unique weekly goals that have tasks completed this week
  const result = await prisma.dailyTask.groupBy({
    by: ["weeklyGoalId"],
    where: {
      userId,
      weeklyGoalId: { not: null },
      status: "COMPLETED",
      completedAt: {
        gte: weekStart,
      },
    },
  });
  return result.length;
}

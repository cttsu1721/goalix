import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  getAvailableChallenges,
  selectRandomChallenges,
} from "./templates";

const DAILY_CHALLENGE_COUNT = 3;
const WEEKLY_CHALLENGE_COUNT = 3;

/**
 * Generate daily challenges for a user
 * Called when user loads dashboard and no challenges exist for today
 */
export async function generateDailyChallenges(
  userId: string,
  timezone: string = "UTC"
): Promise<void> {
  const now = new Date();
  const userNow = toZonedTime(now, timezone);
  const periodStart = startOfDay(userNow);
  const periodEnd = endOfDay(userNow);

  // Check if challenges already exist for today
  const existingDaily = await prisma.userChallenge.findFirst({
    where: {
      userId,
      type: "DAILY",
      periodStart: periodStart,
    },
  });

  if (existingDaily) return; // Already generated

  // Get user level and streak for challenge selection
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  const mitStreak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type: "MIT_COMPLETION" } },
    select: { currentCount: true },
  });

  const userLevel = user?.level || 1;
  const currentStreak = mitStreak?.currentCount || 0;

  // Get available challenges and select random ones
  const availableChallenges = getAvailableChallenges(
    DAILY_CHALLENGES,
    userLevel,
    currentStreak
  );
  const selectedChallenges = selectRandomChallenges(
    availableChallenges,
    DAILY_CHALLENGE_COUNT
  );

  // Create challenges
  await prisma.userChallenge.createMany({
    data: selectedChallenges.map((template) => ({
      userId,
      type: "DAILY",
      category: template.category,
      slug: template.slug,
      title: template.title,
      description: template.description,
      targetValue: template.targetValue,
      bonusXp: template.bonusXp,
      periodStart,
      periodEnd,
    })),
  });
}

/**
 * Generate weekly challenges for a user
 * Called when user loads dashboard and no challenges exist for this week
 */
export async function generateWeeklyChallenges(
  userId: string,
  timezone: string = "UTC"
): Promise<void> {
  const now = new Date();
  const userNow = toZonedTime(now, timezone);
  const periodStart = startOfWeek(userNow, { weekStartsOn: 1 }); // Monday
  const periodEnd = endOfWeek(userNow, { weekStartsOn: 1 }); // Sunday

  // Check if challenges already exist for this week
  const existingWeekly = await prisma.userChallenge.findFirst({
    where: {
      userId,
      type: "WEEKLY",
      periodStart: periodStart,
    },
  });

  if (existingWeekly) return; // Already generated

  // Get user level and streak for challenge selection
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  const mitStreak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type: "MIT_COMPLETION" } },
    select: { currentCount: true },
  });

  const userLevel = user?.level || 1;
  const currentStreak = mitStreak?.currentCount || 0;

  // Get available challenges and select random ones
  const availableChallenges = getAvailableChallenges(
    WEEKLY_CHALLENGES,
    userLevel,
    currentStreak
  );
  const selectedChallenges = selectRandomChallenges(
    availableChallenges,
    WEEKLY_CHALLENGE_COUNT
  );

  // Create challenges
  await prisma.userChallenge.createMany({
    data: selectedChallenges.map((template) => ({
      userId,
      type: "WEEKLY",
      category: template.category,
      slug: template.slug,
      title: template.title,
      description: template.description,
      targetValue: template.targetValue,
      bonusXp: template.bonusXp,
      periodStart,
      periodEnd,
    })),
  });
}

/**
 * Ensure challenges exist for a user (generate if needed)
 */
export async function ensureChallengesExist(
  userId: string,
  timezone: string = "UTC"
): Promise<void> {
  await Promise.all([
    generateDailyChallenges(userId, timezone),
    generateWeeklyChallenges(userId, timezone),
  ]);
}

import { prisma } from "@/lib/db";
import { BADGE_DEFINITIONS, type BadgeSlug } from "@/types/gamification";
import type { GoalCategory } from "@prisma/client";

// Badge icons mapping
export const BADGE_ICONS: Record<BadgeSlug, string> = {
  first_blood: "⚔️",
  on_fire_7: "🔥",
  on_fire_30: "🔥",
  rockstar: "⭐",
  century_club: "💯",
  goal_getter: "🎯",
  dream_starter: "💫",
  planner_pro: "📋",
  visionary: "👁️",
  health_nut: "💪",
  wealth_builder: "💰",
  kaizen_starter: "🧘",
};

interface BadgeCheckResult {
  earned: boolean;
  newlyEarned: boolean;
  badge: (typeof BADGE_DEFINITIONS)[BadgeSlug];
}

/**
 * Check if user has earned a specific badge
 */
async function hasBadge(userId: string, slug: string): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { slug } });
  if (!badge) return false;

  const earned = await prisma.earnedBadge.findFirst({
    where: { userId, badgeId: badge.id },
  });

  return !!earned;
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
  userId: string,
  slug: BadgeSlug
): Promise<{ success: boolean; alreadyEarned: boolean }> {
  const alreadyEarned = await hasBadge(userId, slug);
  if (alreadyEarned) {
    return { success: true, alreadyEarned: true };
  }

  const badge = await prisma.badge.findUnique({ where: { slug } });
  if (!badge) {
    // Create badge if it doesn't exist
    const definition = BADGE_DEFINITIONS[slug];
    const newBadge = await prisma.badge.create({
      data: {
        slug,
        name: definition.name,
        description: definition.description,
        category: definition.category,
        criteria: JSON.stringify({ slug }),
      },
    });

    await prisma.earnedBadge.create({
      data: { userId, badgeId: newBadge.id },
    });
  } else {
    await prisma.earnedBadge.create({
      data: { userId, badgeId: badge.id },
    });
  }

  return { success: true, alreadyEarned: false };
}

/**
 * Check and award first_blood badge
 */
export async function checkFirstBlood(userId: string): Promise<BadgeCheckResult | null> {
  const hasIt = await hasBadge(userId, "first_blood");
  if (hasIt) return null;

  const taskCount = await prisma.dailyTask.count({
    where: { userId, status: "COMPLETED" },
  });

  if (taskCount >= 1) {
    await awardBadge(userId, "first_blood");
    return {
      earned: true,
      newlyEarned: true,
      badge: BADGE_DEFINITIONS.first_blood,
    };
  }

  return null;
}

/**
 * Check and award streak badges (7, 30, 80 days)
 */
export async function checkStreakBadges(
  userId: string,
  currentStreak: number
): Promise<BadgeCheckResult | null> {
  // Check 7-day streak
  if (currentStreak >= 7) {
    const has7 = await hasBadge(userId, "on_fire_7");
    if (!has7) {
      await awardBadge(userId, "on_fire_7");
      return {
        earned: true,
        newlyEarned: true,
        badge: BADGE_DEFINITIONS.on_fire_7,
      };
    }
  }

  // Check 30-day streak
  if (currentStreak >= 30) {
    const has30 = await hasBadge(userId, "on_fire_30");
    if (!has30) {
      await awardBadge(userId, "on_fire_30");
      return {
        earned: true,
        newlyEarned: true,
        badge: BADGE_DEFINITIONS.on_fire_30,
      };
    }
  }

  // Check 80-day streak (Rockstar)
  if (currentStreak >= 80) {
    const has80 = await hasBadge(userId, "rockstar");
    if (!has80) {
      await awardBadge(userId, "rockstar");
      return {
        earned: true,
        newlyEarned: true,
        badge: BADGE_DEFINITIONS.rockstar,
      };
    }
  }

  return null;
}

/**
 * Check and award century_club badge (100+ points in one day)
 */
export async function checkCenturyClub(
  userId: string,
  todayPoints: number
): Promise<BadgeCheckResult | null> {
  if (todayPoints < 100) return null;

  const hasIt = await hasBadge(userId, "century_club");
  if (hasIt) return null;

  await awardBadge(userId, "century_club");
  return {
    earned: true,
    newlyEarned: true,
    badge: BADGE_DEFINITIONS.century_club,
  };
}

/**
 * Check and award dream_starter badge (now for 7-year visions)
 */
export async function checkDreamStarter(userId: string): Promise<BadgeCheckResult | null> {
  const hasIt = await hasBadge(userId, "dream_starter");
  if (hasIt) return null;

  const visionCount = await prisma.sevenYearVision.count({
    where: { userId },
  });

  if (visionCount >= 1) {
    await awardBadge(userId, "dream_starter");
    return {
      earned: true,
      newlyEarned: true,
      badge: BADGE_DEFINITIONS.dream_starter,
    };
  }

  return null;
}

/**
 * Check and award goal_getter badge (first goal completed)
 */
export async function checkGoalGetter(userId: string): Promise<BadgeCheckResult | null> {
  const hasIt = await hasBadge(userId, "goal_getter");
  if (hasIt) return null;

  // Check any goal at any level is completed
  const completedGoals = await prisma.$transaction([
    prisma.weeklyGoal.count({ where: { userId, status: "COMPLETED" } }),
    prisma.monthlyGoal.count({ where: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } }, status: "COMPLETED" } }),
    prisma.oneYearGoal.count({ where: { threeYearGoal: { sevenYearVision: { userId } }, status: "COMPLETED" } }),
    prisma.threeYearGoal.count({ where: { sevenYearVision: { userId }, status: "COMPLETED" } }),
    prisma.sevenYearVision.count({ where: { userId, status: "COMPLETED" } }),
  ]);

  const totalCompleted = completedGoals.reduce((sum, count) => sum + count, 0);

  if (totalCompleted >= 1) {
    await awardBadge(userId, "goal_getter");
    return {
      earned: true,
      newlyEarned: true,
      badge: BADGE_DEFINITIONS.goal_getter,
    };
  }

  return null;
}

/**
 * Check and award planner_pro badge (7 consecutive days of daily planning)
 */
export async function checkPlannerPro(userId: string): Promise<BadgeCheckResult | null> {
  const hasIt = await hasBadge(userId, "planner_pro");
  if (hasIt) return null;

  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type: "DAILY_PLANNING" } },
  });

  if (streak && streak.currentCount >= 7) {
    await awardBadge(userId, "planner_pro");
    return {
      earned: true,
      newlyEarned: true,
      badge: BADGE_DEFINITIONS.planner_pro,
    };
  }

  return null;
}

/**
 * Check and award visionary badge (active goals at all 5 levels)
 */
export async function checkVisionary(userId: string): Promise<BadgeCheckResult | null> {
  const hasIt = await hasBadge(userId, "visionary");
  if (hasIt) return null;

  const [visions, threeYear, oneYear, monthly, weekly] = await prisma.$transaction([
    prisma.sevenYearVision.count({ where: { userId, status: "ACTIVE" } }),
    prisma.threeYearGoal.count({ where: { sevenYearVision: { userId }, status: "ACTIVE" } }),
    prisma.oneYearGoal.count({ where: { threeYearGoal: { sevenYearVision: { userId } }, status: "ACTIVE" } }),
    prisma.monthlyGoal.count({ where: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } }, status: "ACTIVE" } }),
    prisma.weeklyGoal.count({ where: { userId, status: "ACTIVE" } }),
  ]);

  if (visions > 0 && threeYear > 0 && oneYear > 0 && monthly > 0 && weekly > 0) {
    await awardBadge(userId, "visionary");
    return {
      earned: true,
      newlyEarned: true,
      badge: BADGE_DEFINITIONS.visionary,
    };
  }

  return null;
}

/**
 * Check category badges (10 tasks completed in a category)
 */
export async function checkCategoryBadges(
  userId: string,
  category: string
): Promise<BadgeCheckResult | null> {
  const categoryBadgeMap: Record<string, BadgeSlug> = {
    HEALTH: "health_nut",
    WEALTH: "wealth_builder",
  };

  const badgeSlug = categoryBadgeMap[category];
  if (!badgeSlug) return null;

  const hasIt = await hasBadge(userId, badgeSlug);
  if (hasIt) return null;

  // Count completed tasks in this category (through weeklyGoal relation)
  const count = await prisma.dailyTask.count({
    where: {
      userId,
      status: "COMPLETED",
      weeklyGoal: {
        category: category as GoalCategory,
      },
    },
  });

  if (count >= 10) {
    await awardBadge(userId, badgeSlug);
    return {
      earned: true,
      newlyEarned: true,
      badge: BADGE_DEFINITIONS[badgeSlug],
    };
  }

  return null;
}

/**
 * Check and award kaizen_starter badge (first Kaizen check-in)
 */
export async function checkKaizenStarter(userId: string): Promise<BadgeCheckResult | null> {
  const hasIt = await hasBadge(userId, "kaizen_starter");
  if (hasIt) return null;

  const checkinCount = await prisma.kaizenCheckin.count({
    where: { userId },
  });

  if (checkinCount >= 1) {
    await awardBadge(userId, "kaizen_starter");
    return {
      earned: true,
      newlyEarned: true,
      badge: BADGE_DEFINITIONS.kaizen_starter,
    };
  }

  return null;
}

/**
 * Run all badge checks after an action
 */
export async function checkAllBadges(
  userId: string,
  context: {
    taskCompleted?: boolean;
    kaizenCheckin?: boolean;
    todayPoints?: number;
    currentStreak?: number;
    category?: string;
  }
): Promise<BadgeCheckResult[]> {
  const results: BadgeCheckResult[] = [];

  // First blood (first task)
  if (context.taskCompleted) {
    const firstBlood = await checkFirstBlood(userId);
    if (firstBlood) results.push(firstBlood);
  }

  // Kaizen starter (first kaizen check-in)
  if (context.kaizenCheckin) {
    const kaizenStarter = await checkKaizenStarter(userId);
    if (kaizenStarter) results.push(kaizenStarter);
  }

  // Streak badges
  if (context.currentStreak) {
    const streakBadge = await checkStreakBadges(userId, context.currentStreak);
    if (streakBadge) results.push(streakBadge);
  }

  // Century club (100+ points in a day)
  if (context.todayPoints && context.todayPoints >= 100) {
    const century = await checkCenturyClub(userId, context.todayPoints);
    if (century) results.push(century);
  }

  // Category badges
  if (context.category) {
    const categoryBadge = await checkCategoryBadges(userId, context.category);
    if (categoryBadge) results.push(categoryBadge);
  }

  // Planner pro (check on daily planning)
  const plannerPro = await checkPlannerPro(userId);
  if (plannerPro) results.push(plannerPro);

  return results;
}

/**
 * Get all badges with earned status for a user
 */
export async function getAllBadgesWithStatus(userId: string) {
  const earnedBadges = await prisma.earnedBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const earnedSlugs = new Set(earnedBadges.map((eb) => eb.badge.slug));

  return Object.entries(BADGE_DEFINITIONS).map(([slug, definition]) => ({
    ...definition,
    icon: BADGE_ICONS[slug as BadgeSlug],
    earned: earnedSlugs.has(slug),
    earnedAt: earnedBadges.find((eb) => eb.badge.slug === slug)?.earnedAt || null,
  }));
}

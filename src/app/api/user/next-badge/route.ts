import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BADGE_DEFINITIONS, type BadgeSlug } from "@/types/gamification";
import { BADGE_ICONS } from "@/lib/gamification/badges";
import type { GoalCategory } from "@prisma/client";

interface BadgeProgress {
  slug: BadgeSlug;
  name: string;
  description: string;
  icon: string;
  category: string;
  current: number;
  target: number;
  percentage: number;
}

// GET /api/user/next-badge - Get the next badge to earn with progress
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get earned badges
    const earnedBadges = await prisma.earnedBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
    const earnedSlugs = new Set(earnedBadges.map((eb) => eb.badge.slug));

    // Get current stats for progress calculation - run basic queries in transaction
    const [
      completedTaskCount,
      mitStreak,
      planningStreak,
      kaizenCheckinCount,
      healthTaskCount,
      wealthTaskCount,
      visionCount,
    ] = await prisma.$transaction([
      // Total completed tasks
      prisma.dailyTask.count({
        where: { userId, status: "COMPLETED" },
      }),
      // MIT completion streak
      prisma.streak.findFirst({
        where: { userId, type: "MIT_COMPLETION" },
      }),
      // Daily planning streak
      prisma.streak.findFirst({
        where: { userId, type: "DAILY_PLANNING" },
      }),
      // Kaizen check-in count
      prisma.kaizenCheckin.count({
        where: { userId },
      }),
      // Health tasks completed
      prisma.dailyTask.count({
        where: {
          userId,
          status: "COMPLETED",
          weeklyGoal: { category: "HEALTH" as GoalCategory },
        },
      }),
      // Wealth tasks completed
      prisma.dailyTask.count({
        where: {
          userId,
          status: "COMPLETED",
          weeklyGoal: { category: "WEALTH" as GoalCategory },
        },
      }),
      // Vision count
      prisma.sevenYearVision.count({
        where: { userId },
      }),
    ]);

    // Get goal counts separately (can't be in transaction with Promise.all)
    const completedGoalCounts = await Promise.all([
      prisma.weeklyGoal.count({ where: { userId, status: "COMPLETED" } }),
      prisma.monthlyGoal.count({ where: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } }, status: "COMPLETED" } }),
      prisma.oneYearGoal.count({ where: { threeYearGoal: { sevenYearVision: { userId } }, status: "COMPLETED" } }),
      prisma.threeYearGoal.count({ where: { sevenYearVision: { userId }, status: "COMPLETED" } }),
      prisma.sevenYearVision.count({ where: { userId, status: "COMPLETED" } }),
    ]);

    const goalLevelCounts = await Promise.all([
      prisma.sevenYearVision.count({ where: { userId, status: "ACTIVE" } }),
      prisma.threeYearGoal.count({ where: { sevenYearVision: { userId }, status: "ACTIVE" } }),
      prisma.oneYearGoal.count({ where: { threeYearGoal: { sevenYearVision: { userId } }, status: "ACTIVE" } }),
      prisma.monthlyGoal.count({ where: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } }, status: "ACTIVE" } }),
      prisma.weeklyGoal.count({ where: { userId, status: "ACTIVE" } }),
    ]);

    const totalCompletedGoals = Array.isArray(completedGoalCounts)
      ? completedGoalCounts.reduce((sum, count) => sum + count, 0)
      : 0;

    const activeLevels = Array.isArray(goalLevelCounts)
      ? goalLevelCounts.filter((count) => count > 0).length
      : 0;

    const currentStreak = mitStreak?.currentCount || 0;
    const currentPlanningStreak = planningStreak?.currentCount || 0;

    // Calculate progress for each unearned badge
    const badgeProgress: BadgeProgress[] = [];

    // first_blood - Complete first task
    if (!earnedSlugs.has("first_blood")) {
      badgeProgress.push({
        slug: "first_blood",
        name: BADGE_DEFINITIONS.first_blood.name,
        description: BADGE_DEFINITIONS.first_blood.description,
        icon: BADGE_ICONS.first_blood,
        category: BADGE_DEFINITIONS.first_blood.category,
        current: completedTaskCount,
        target: 1,
        percentage: Math.min(100, (completedTaskCount / 1) * 100),
      });
    }

    // on_fire_7 - 7-day streak
    if (!earnedSlugs.has("on_fire_7")) {
      badgeProgress.push({
        slug: "on_fire_7",
        name: BADGE_DEFINITIONS.on_fire_7.name,
        description: BADGE_DEFINITIONS.on_fire_7.description,
        icon: BADGE_ICONS.on_fire_7,
        category: BADGE_DEFINITIONS.on_fire_7.category,
        current: currentStreak,
        target: 7,
        percentage: Math.min(100, (currentStreak / 7) * 100),
      });
    }

    // on_fire_30 - 30-day streak
    if (!earnedSlugs.has("on_fire_30")) {
      badgeProgress.push({
        slug: "on_fire_30",
        name: BADGE_DEFINITIONS.on_fire_30.name,
        description: BADGE_DEFINITIONS.on_fire_30.description,
        icon: BADGE_ICONS.on_fire_30,
        category: BADGE_DEFINITIONS.on_fire_30.category,
        current: currentStreak,
        target: 30,
        percentage: Math.min(100, (currentStreak / 30) * 100),
      });
    }

    // rockstar - 80-day streak
    if (!earnedSlugs.has("rockstar")) {
      badgeProgress.push({
        slug: "rockstar",
        name: BADGE_DEFINITIONS.rockstar.name,
        description: BADGE_DEFINITIONS.rockstar.description,
        icon: BADGE_ICONS.rockstar,
        category: BADGE_DEFINITIONS.rockstar.category,
        current: currentStreak,
        target: 80,
        percentage: Math.min(100, (currentStreak / 80) * 100),
      });
    }

    // century_club - 100 points in a day (show today's progress)
    // This resets daily, so we calculate today's points
    if (!earnedSlugs.has("century_club")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const todayTasks = await prisma.dailyTask.findMany({
        where: {
          userId,
          scheduledDate: { gte: today, lte: endOfDay },
          status: "COMPLETED",
        },
        select: { pointsEarned: true },
      });
      const todayPoints = todayTasks.reduce((sum, t) => sum + t.pointsEarned, 0);

      badgeProgress.push({
        slug: "century_club",
        name: BADGE_DEFINITIONS.century_club.name,
        description: BADGE_DEFINITIONS.century_club.description,
        icon: BADGE_ICONS.century_club,
        category: BADGE_DEFINITIONS.century_club.category,
        current: todayPoints,
        target: 100,
        percentage: Math.min(100, (todayPoints / 100) * 100),
      });
    }

    // goal_getter - Complete first goal
    if (!earnedSlugs.has("goal_getter")) {
      badgeProgress.push({
        slug: "goal_getter",
        name: BADGE_DEFINITIONS.goal_getter.name,
        description: BADGE_DEFINITIONS.goal_getter.description,
        icon: BADGE_ICONS.goal_getter,
        category: BADGE_DEFINITIONS.goal_getter.category,
        current: totalCompletedGoals,
        target: 1,
        percentage: Math.min(100, (totalCompletedGoals / 1) * 100),
      });
    }

    // dream_starter - Create first vision
    if (!earnedSlugs.has("dream_starter")) {
      badgeProgress.push({
        slug: "dream_starter",
        name: BADGE_DEFINITIONS.dream_starter.name,
        description: BADGE_DEFINITIONS.dream_starter.description,
        icon: BADGE_ICONS.dream_starter,
        category: BADGE_DEFINITIONS.dream_starter.category,
        current: visionCount,
        target: 1,
        percentage: Math.min(100, (visionCount / 1) * 100),
      });
    }

    // planner_pro - 7-day planning streak
    if (!earnedSlugs.has("planner_pro")) {
      badgeProgress.push({
        slug: "planner_pro",
        name: BADGE_DEFINITIONS.planner_pro.name,
        description: BADGE_DEFINITIONS.planner_pro.description,
        icon: BADGE_ICONS.planner_pro,
        category: BADGE_DEFINITIONS.planner_pro.category,
        current: currentPlanningStreak,
        target: 7,
        percentage: Math.min(100, (currentPlanningStreak / 7) * 100),
      });
    }

    // visionary - Active goals at all 5 levels
    if (!earnedSlugs.has("visionary")) {
      badgeProgress.push({
        slug: "visionary",
        name: BADGE_DEFINITIONS.visionary.name,
        description: BADGE_DEFINITIONS.visionary.description,
        icon: BADGE_ICONS.visionary,
        category: BADGE_DEFINITIONS.visionary.category,
        current: activeLevels,
        target: 5,
        percentage: Math.min(100, (activeLevels / 5) * 100),
      });
    }

    // health_nut - 10 health tasks
    if (!earnedSlugs.has("health_nut")) {
      badgeProgress.push({
        slug: "health_nut",
        name: BADGE_DEFINITIONS.health_nut.name,
        description: BADGE_DEFINITIONS.health_nut.description,
        icon: BADGE_ICONS.health_nut,
        category: BADGE_DEFINITIONS.health_nut.category,
        current: healthTaskCount,
        target: 10,
        percentage: Math.min(100, (healthTaskCount / 10) * 100),
      });
    }

    // wealth_builder - 10 wealth tasks
    if (!earnedSlugs.has("wealth_builder")) {
      badgeProgress.push({
        slug: "wealth_builder",
        name: BADGE_DEFINITIONS.wealth_builder.name,
        description: BADGE_DEFINITIONS.wealth_builder.description,
        icon: BADGE_ICONS.wealth_builder,
        category: BADGE_DEFINITIONS.wealth_builder.category,
        current: wealthTaskCount,
        target: 10,
        percentage: Math.min(100, (wealthTaskCount / 10) * 100),
      });
    }

    // kaizen_starter - First Kaizen check-in
    if (!earnedSlugs.has("kaizen_starter")) {
      badgeProgress.push({
        slug: "kaizen_starter",
        name: BADGE_DEFINITIONS.kaizen_starter.name,
        description: BADGE_DEFINITIONS.kaizen_starter.description,
        icon: BADGE_ICONS.kaizen_starter,
        category: BADGE_DEFINITIONS.kaizen_starter.category,
        current: kaizenCheckinCount,
        target: 1,
        percentage: Math.min(100, (kaizenCheckinCount / 1) * 100),
      });
    }

    // Sort by percentage (highest first) to show closest to earning
    badgeProgress.sort((a, b) => b.percentage - a.percentage);

    // Return the top 3 closest badges
    const nextBadges = badgeProgress.slice(0, 3);

    return NextResponse.json({
      nextBadges,
      totalEarned: earnedSlugs.size,
      totalBadges: Object.keys(BADGE_DEFINITIONS).length,
    });
  } catch (error) {
    console.error("Error fetching next badge:", error);
    return NextResponse.json(
      { error: "Failed to fetch next badge" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { TASK_PRIORITY_POINTS } from "@/types/tasks";
import { checkAllBadges } from "@/lib/gamification/badges";
import {
  updateChallengeProgressOnTaskComplete,
  updateAlignmentChallenges,
  updateGoalChallenges,
} from "@/lib/challenges";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/tasks/[id]/complete - Complete a task and award points
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const { id } = await params;

    // Check task exists and belongs to user
    const existingTask = await prisma.dailyTask.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if already completed
    if (existingTask.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Task is already completed" },
        { status: 400 }
      );
    }

    // Calculate points (base points + streak bonus)
    const basePoints = TASK_PRIORITY_POINTS[existingTask.priority];

    // Get current streak for bonus calculation
    const mitStreak = await prisma.streak.findFirst({
      where: {
        userId: userId,
        type: "MIT_COMPLETION",
      },
    });

    // Streak bonus: +10% per day, max +100%
    const streakBonus = existingTask.priority === "MIT" && mitStreak
      ? Math.min(mitStreak.currentCount * 0.1, 1.0)
      : 0;

    const totalPoints = Math.round(basePoints * (1 + streakBonus));

    // Use transaction to update task and user points atomically
    const [task, updatedUser] = await prisma.$transaction([
      // Update task
      prisma.dailyTask.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          pointsEarned: totalPoints,
        },
        include: {
          weeklyGoal: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      }),
      // Update user total points
      prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: totalPoints,
          },
        },
      }),
    ]);

    // Update MIT streak if this was an MIT task
    if (existingTask.priority === "MIT") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.streak.upsert({
        where: {
          userId_type: {
            userId: userId,
            type: "MIT_COMPLETION",
          },
        },
        create: {
          userId: userId,
          type: "MIT_COMPLETION",
          currentCount: 1,
          longestCount: 1,
          lastActionAt: today,
        },
        update: {
          currentCount: {
            increment: 1,
          },
          longestCount: mitStreak && mitStreak.currentCount + 1 > mitStreak.longestCount
            ? mitStreak.currentCount + 1
            : undefined,
          lastActionAt: today,
        },
      });
    }

    // Check if user leveled up
    const newLevel = calculateLevel(updatedUser.totalPoints);
    let leveledUp = false;

    if (newLevel > (updatedUser.level || 1)) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
      leveledUp = true;
    }

    // Calculate today's total points for badge checking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayTasks = await prisma.dailyTask.findMany({
      where: {
        userId: userId,
        scheduledDate: { gte: today, lte: endOfDay },
        status: "COMPLETED",
      },
      select: { pointsEarned: true, weeklyGoalId: true },
    });
    const todayPoints = todayTasks.reduce((sum, t) => sum + t.pointsEarned, 0);

    // Calculate daily alignment percentage for badge checking
    const linkedTasks = todayTasks.filter((t) => t.weeklyGoalId !== null).length;
    const totalCompletedToday = todayTasks.length;
    const dailyAlignmentPercentage = totalCompletedToday > 0
      ? Math.round((linkedTasks / totalCompletedToday) * 100)
      : 0;

    // Get current MIT streak for badge checking
    const currentMitStreak = await prisma.streak.findFirst({
      where: { userId: userId, type: "MIT_COMPLETION" },
    });

    // Check and award badges
    const earnedBadges = await checkAllBadges(userId, {
      taskCompleted: true,
      todayPoints,
      currentStreak: currentMitStreak?.currentCount || 0,
      category: task.weeklyGoal?.category || undefined,
      dailyAlignmentPercentage,
    });

    // Check for streak milestone (7, 14, 30, 60, 90 days)
    const STREAK_MILESTONES = [7, 14, 30, 60, 90];
    const previousStreak = mitStreak?.currentCount || 0;
    const newStreak = currentMitStreak?.currentCount || 0;
    const streakMilestone = existingTask.priority === "MIT"
      ? STREAK_MILESTONES.find(m => previousStreak < m && newStreak >= m)
      : undefined;

    // Update challenge progress (fire and forget for performance)
    const userTimezone = (await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    }))?.timezone || "UTC";

    Promise.all([
      updateChallengeProgressOnTaskComplete(
        userId,
        userTimezone,
        existingTask.priority,
        existingTask.weeklyGoalId !== null,
        new Date()
      ),
      updateAlignmentChallenges(userId, userTimezone),
      updateGoalChallenges(userId, userTimezone),
    ]).catch((err) => console.error("Error updating challenge progress:", err));

    return NextResponse.json({
      task,
      points: {
        earned: totalPoints,
        base: basePoints,
        streakBonus: Math.round(basePoints * streakBonus),
        newTotal: updatedUser.totalPoints,
      },
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      badges: earnedBadges.map((b) => ({
        slug: b.badge.slug,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        category: b.badge.category,
      })),
      streak: existingTask.priority === "MIT" ? {
        current: newStreak,
        milestone: streakMilestone,
      } : undefined,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    );
  }
}

// Level thresholds
const LEVEL_THRESHOLDS = [
  0,       // Level 1: Beginner
  500,     // Level 2: Starter
  2000,    // Level 3: Achiever
  5000,    // Level 4: Go-Getter
  10000,   // Level 5: Performer
  25000,   // Level 6: Rockstar
  50000,   // Level 7: Champion
  75000,   // Level 8: Elite
  100000,  // Level 9: Master
  150000,  // Level 10: Fastlaner
];

function calculateLevel(totalPoints: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

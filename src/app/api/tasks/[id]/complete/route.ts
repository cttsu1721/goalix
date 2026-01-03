import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TASK_PRIORITY_POINTS } from "@/types/tasks";
import { checkAllBadges } from "@/lib/gamification/badges";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/tasks/[id]/complete - Complete a task and award points
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check task exists and belongs to user
    const existingTask = await prisma.dailyTask.findFirst({
      where: {
        id,
        userId: session.user.id,
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
        userId: session.user.id,
        type: "MIT_COMPLETION",
      },
    });

    // Streak bonus: +10% per day, max +100%
    const streakBonus = existingTask.priority === "MIT" && mitStreak
      ? Math.min(mitStreak.currentCount * 0.1, 1.0)
      : 0;

    const totalPoints = Math.round(basePoints * (1 + streakBonus));

    // Use transaction to update task and user points atomically
    const [task, user] = await prisma.$transaction([
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
        where: { id: session.user.id },
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
            userId: session.user.id,
            type: "MIT_COMPLETION",
          },
        },
        create: {
          userId: session.user.id,
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
    const newLevel = calculateLevel(user.totalPoints);
    let leveledUp = false;

    if (newLevel > (user.level || 1)) {
      await prisma.user.update({
        where: { id: session.user.id },
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
        userId: session.user.id,
        scheduledDate: { gte: today, lte: endOfDay },
        status: "COMPLETED",
      },
      select: { pointsEarned: true },
    });
    const todayPoints = todayTasks.reduce((sum, t) => sum + t.pointsEarned, 0);

    // Get current MIT streak for badge checking
    const currentMitStreak = await prisma.streak.findFirst({
      where: { userId: session.user.id, type: "MIT_COMPLETION" },
    });

    // Check and award badges
    const earnedBadges = await checkAllBadges(session.user.id, {
      taskCompleted: true,
      todayPoints,
      currentStreak: currentMitStreak?.currentCount || 0,
      category: task.weeklyGoal?.category || undefined,
    });

    // Check for streak milestone (7, 14, 30, 60, 90 days)
    const STREAK_MILESTONES = [7, 14, 30, 60, 90];
    const previousStreak = mitStreak?.currentCount || 0;
    const newStreak = currentMitStreak?.currentCount || 0;
    const streakMilestone = existingTask.priority === "MIT"
      ? STREAK_MILESTONES.find(m => previousStreak < m && newStreak >= m)
      : undefined;

    return NextResponse.json({
      task,
      points: {
        earned: totalPoints,
        base: basePoints,
        streakBonus: Math.round(basePoints * streakBonus),
        newTotal: user.totalPoints,
      },
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      badges: earnedBadges.map((b) => ({
        slug: Object.entries(b.badge).find(([, v]) => v === b.badge.name)?.[0],
        name: b.badge.name,
        description: b.badge.description,
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

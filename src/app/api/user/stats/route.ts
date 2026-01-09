import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LEVELS } from "@/types/gamification";

// GET /api/user/stats - Get user gamification stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalPoints: true,
        level: true,
        streakFreezes: true,
        maxMitCount: true,
        streaks: true,
        earnedBadges: {
          include: {
            badge: true,
          },
          orderBy: { earnedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate level info
    const currentLevel = LEVELS.find((l) => l.level === user.level) || LEVELS[0];
    const nextLevel = LEVELS.find((l) => l.level === user.level + 1);
    const pointsToNextLevel = nextLevel
      ? nextLevel.pointsRequired - user.totalPoints
      : 0;
    const levelProgress = nextLevel
      ? Math.round(
          ((user.totalPoints - currentLevel.pointsRequired) /
            (nextLevel.pointsRequired - currentLevel.pointsRequired)) *
            100
        )
      : 100;

    // Get today's task stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysTasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: today,
          lte: endOfDay,
        },
      },
      select: {
        status: true,
        priority: true,
        pointsEarned: true,
      },
    });

    const todayStats = {
      total: todaysTasks.length,
      completed: todaysTasks.filter((t) => t.status === "COMPLETED").length,
      mitCompleted: todaysTasks.some(
        (t) => t.priority === "MIT" && t.status === "COMPLETED"
      ),
      pointsEarned: todaysTasks.reduce((sum, t) => sum + t.pointsEarned, 0),
    };

    // Get weekly stats
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyTasks = await prisma.dailyTask.aggregate({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: startOfWeek,
        },
        status: "COMPLETED",
      },
      _sum: {
        pointsEarned: true,
      },
      _count: true,
    });

    return NextResponse.json({
      totalPoints: user.totalPoints,
      level: user.level,
      levelName: currentLevel.name,
      pointsToNextLevel,
      levelProgress,
      streakFreezes: user.streakFreezes,
      maxMitCount: user.maxMitCount,
      streaks: user.streaks,
      badges: user.earnedBadges,
      todayStats,
      weeklyStats: {
        tasksCompleted: weeklyTasks._count,
        pointsEarned: weeklyTasks._sum.pointsEarned || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

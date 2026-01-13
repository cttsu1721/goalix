import { NextResponse, NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { LEVELS } from "@/types/gamification";

// GET /api/user/stats - Get user gamification stats
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const userData = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate level info
    const currentLevel = LEVELS.find((l) => l.level === userData.level) || LEVELS[0];
    const nextLevel = LEVELS.find((l) => l.level === userData.level + 1);
    const pointsToNextLevel = nextLevel
      ? nextLevel.pointsRequired - userData.totalPoints
      : 0;
    const levelProgress = nextLevel
      ? Math.round(
          ((userData.totalPoints - currentLevel.pointsRequired) /
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
        userId,
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
        userId,
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
      success: true,
      data: {
        totalPoints: userData.totalPoints,
        level: userData.level,
        levelName: currentLevel.name,
        pointsToNextLevel,
        levelProgress,
        streakFreezes: userData.streakFreezes,
        maxMitCount: userData.maxMitCount,
        streaks: userData.streaks,
        badges: userData.earnedBadges,
        todayStats,
        weeklyStats: {
          tasksCompleted: weeklyTasks._count,
          pointsEarned: weeklyTasks._sum.pointsEarned || 0,
        },
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

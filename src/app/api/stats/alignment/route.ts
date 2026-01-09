import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface WeeklyAlignment {
  weekStart: string;
  weekEnd: string;
  alignmentRate: number;
  linkedCompleted: number;
  totalCompleted: number;
}

// GET /api/stats/alignment - Get weekly alignment trend for last N weeks
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weeks = Math.min(parseInt(searchParams.get("weeks") || "12", 10), 52);

    // Calculate week boundaries for each of the last N weeks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of current week (Monday)
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentWeekStart.setDate(today.getDate() - daysToSubtract);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Calculate the earliest date we need data for
    const earliestDate = new Date(currentWeekStart);
    earliestDate.setDate(earliestDate.getDate() - (weeks - 1) * 7);

    // Fetch all completed tasks in the date range
    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        scheduledDate: {
          gte: earliestDate,
          lte: today,
        },
      },
      select: {
        scheduledDate: true,
        weeklyGoalId: true,
      },
      orderBy: { scheduledDate: "asc" },
    });

    // Group tasks by week and calculate alignment
    const weeklyData: WeeklyAlignment[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Filter tasks for this week
      const weekTasks = tasks.filter((t) => {
        const taskDate = new Date(t.scheduledDate);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const totalCompleted = weekTasks.length;
      const linkedCompleted = weekTasks.filter((t) => t.weeklyGoalId !== null).length;
      const alignmentRate = totalCompleted > 0
        ? Math.round((linkedCompleted / totalCompleted) * 100)
        : 0;

      weeklyData.push({
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        alignmentRate,
        linkedCompleted,
        totalCompleted,
      });
    }

    // Calculate trend and averages
    const recentWeeks = weeklyData.slice(-4).filter(w => w.totalCompleted > 0);
    const olderWeeks = weeklyData.slice(0, -4).filter(w => w.totalCompleted > 0);

    const recentAvg = recentWeeks.length > 0
      ? Math.round(recentWeeks.reduce((sum, w) => sum + w.alignmentRate, 0) / recentWeeks.length)
      : 0;
    const olderAvg = olderWeeks.length > 0
      ? Math.round(olderWeeks.reduce((sum, w) => sum + w.alignmentRate, 0) / olderWeeks.length)
      : 0;

    const trend = recentAvg - olderAvg; // Positive = improving, negative = declining

    const overallAvg = weeklyData.filter(w => w.totalCompleted > 0).length > 0
      ? Math.round(
          weeklyData
            .filter(w => w.totalCompleted > 0)
            .reduce((sum, w) => sum + w.alignmentRate, 0) /
          weeklyData.filter(w => w.totalCompleted > 0).length
        )
      : 0;

    return NextResponse.json({
      weeks: weeklyData,
      summary: {
        overallAverage: overallAvg,
        recentAverage: recentAvg,
        trend, // positive = improving, negative = declining
        trendLabel: trend > 5 ? "improving" : trend < -5 ? "declining" : "stable",
      },
    });
  } catch (error) {
    console.error("Error fetching alignment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch alignment stats" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MONTHLY_REVIEW_POINTS = 100;

interface WeekBreakdown {
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksCompleted: number;
  totalTasks: number;
  mitCompleted: number;
  mitTotal: number;
  pointsEarned: number;
}

// GET /api/review/monthly - Get comprehensive monthly review data
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthOffset = parseInt(searchParams.get("monthOffset") || "0", 10);

    // Calculate month boundaries
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch all tasks for the month
    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        scheduledDate: true,
        status: true,
        priority: true,
        pointsEarned: true,
        weeklyGoalId: true,
      },
      orderBy: { scheduledDate: "asc" },
    });

    // Build weekly breakdown
    const weeklyBreakdowns: WeekBreakdown[] = [];
    const currentWeekStart = new Date(startOfMonth);
    // Adjust to Monday
    const dayOfWeek = currentWeekStart.getDay();
    if (dayOfWeek !== 1) {
      currentWeekStart.setDate(currentWeekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    }

    let weekNumber = 1;
    while (currentWeekStart <= endOfMonth) {
      const weekStart = new Date(currentWeekStart);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Only include weeks that overlap with the month
      if (weekEnd >= startOfMonth) {
        const weekTasks = tasks.filter((t) => {
          const taskDate = new Date(t.scheduledDate);
          return taskDate >= weekStart && taskDate <= weekEnd;
        });

        const mitTasks = weekTasks.filter((t) => t.priority === "MIT");

        weeklyBreakdowns.push({
          weekNumber,
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          tasksCompleted: weekTasks.filter((t) => t.status === "COMPLETED").length,
          totalTasks: weekTasks.length,
          mitCompleted: mitTasks.filter((t) => t.status === "COMPLETED").length,
          mitTotal: mitTasks.length,
          pointsEarned: weekTasks.reduce((sum, t) => sum + t.pointsEarned, 0),
        });
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;

      // Safety check to prevent infinite loop
      if (weekNumber > 6) break;
    }

    // Calculate aggregate stats
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const totalTasks = tasks.length;
    const tasksCompleted = completedTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

    // MIT stats
    const mitTasks = tasks.filter((t) => t.priority === "MIT");
    const mitCompleted = mitTasks.filter((t) => t.status === "COMPLETED").length;
    const mitTotal = mitTasks.length;
    const mitCompletionRate = mitTotal > 0 ? Math.round((mitCompleted / mitTotal) * 100) : 0;

    // Goal alignment stats
    const linkedTasks = tasks.filter((t) => t.weeklyGoalId !== null);
    const linkedCompleted = linkedTasks.filter((t) => t.status === "COMPLETED").length;
    const unlinkedTasks = tasks.filter((t) => t.weeklyGoalId === null);
    const unlinkedCompleted = unlinkedTasks.filter((t) => t.status === "COMPLETED").length;
    const alignmentRate = tasksCompleted > 0
      ? Math.round((linkedCompleted / tasksCompleted) * 100)
      : 0;

    // Points earned
    const pointsEarned = tasks.reduce((sum, t) => sum + t.pointsEarned, 0);

    // Get monthly goals progress (through oneYearGoal -> threeYearGoal -> sevenYearVision -> user)
    const monthlyGoals = await prisma.monthlyGoal.findMany({
      where: {
        oneYearGoal: {
          threeYearGoal: {
            sevenYearVision: {
              userId: session.user.id,
            },
          },
        },
        targetMonth: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        progress: true,
      },
    });

    const goalsCompleted = monthlyGoals.filter((g) => g.status === "COMPLETED").length;
    const goalsTotal = monthlyGoals.length;

    // Fetch Kaizen check-ins for the month
    const kaizenCheckins = await prisma.kaizenCheckin.findMany({
      where: {
        userId: session.user.id,
        checkinDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { checkinDate: "asc" },
    });

    // Calculate days in month
    const daysInMonth = Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Process Kaizen data
    const kaizenStats = {
      checkinsCompleted: kaizenCheckins.length,
      checkinsTotal: daysInMonth,
      completionRate: Math.round((kaizenCheckins.length / daysInMonth) * 100),
      balancedDays: kaizenCheckins.filter((c) => {
        return c.health && c.relationships && c.wealth && c.career && c.personalGrowth && c.lifestyle;
      }).length,
      areaBreakdown: {
        health: kaizenCheckins.filter((c) => c.health).length,
        relationships: kaizenCheckins.filter((c) => c.relationships).length,
        wealth: kaizenCheckins.filter((c) => c.wealth).length,
        career: kaizenCheckins.filter((c) => c.career).length,
        personalGrowth: kaizenCheckins.filter((c) => c.personalGrowth).length,
        lifestyle: kaizenCheckins.filter((c) => c.lifestyle).length,
      },
    };

    // Find strongest and weakest areas
    const areaEntries = Object.entries(kaizenStats.areaBreakdown);
    areaEntries.sort((a, b) => b[1] - a[1]);
    const strongestArea = areaEntries[0] || null;
    const weakestArea = areaEntries[areaEntries.length - 1] || null;

    // Get streaks at end of month
    const streaks = await prisma.streak.findMany({
      where: { userId: session.user.id },
      select: { type: true, currentCount: true, longestCount: true },
    });

    return NextResponse.json({
      monthRange: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
        monthOffset,
        monthName: startOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      },
      stats: {
        tasksCompleted,
        totalTasks,
        completionRate,
        mitCompleted,
        mitTotal,
        mitCompletionRate,
        goalsCompleted,
        goalsTotal,
        pointsEarned,
        daysInMonth,
      },
      goalAlignment: {
        linkedCompleted,
        unlinkedCompleted,
        alignmentRate,
        totalLinked: linkedTasks.length,
        totalUnlinked: unlinkedTasks.length,
      },
      weeklyBreakdowns,
      goals: monthlyGoals,
      kaizen: {
        ...kaizenStats,
        strongestArea: strongestArea ? { area: strongestArea[0], count: strongestArea[1] } : null,
        weakestArea: weakestArea && weakestArea[1] < kaizenCheckins.length ? { area: weakestArea[0], count: weakestArea[1] } : null,
      },
      streaks,
    });
  } catch (error) {
    console.error("Error fetching monthly review data:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly review data" },
      { status: 500 }
    );
  }
}

// POST /api/review/monthly - Submit/update monthly review reflection
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { wins, learnings, nextMonthFocus, monthOffset = 0 } = body;

    // Calculate month boundaries
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch stats for the month to snapshot
    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        status: true,
        priority: true,
        pointsEarned: true,
        weeklyGoalId: true,
      },
    });

    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const tasksCompleted = completedTasks.length;
    const totalTasks = tasks.length;

    const mitTasks = tasks.filter((t) => t.priority === "MIT");
    const mitCompleted = mitTasks.filter((t) => t.status === "COMPLETED").length;
    const mitTotal = mitTasks.length;

    const linkedCompleted = completedTasks.filter((t) => t.weeklyGoalId !== null).length;
    const goalAlignmentRate = tasksCompleted > 0
      ? Math.round((linkedCompleted / tasksCompleted) * 100)
      : 0;

    const pointsEarned = tasks.reduce((sum, t) => sum + t.pointsEarned, 0);

    // Get monthly goals progress
    const monthlyGoals = await prisma.monthlyGoal.findMany({
      where: {
        oneYearGoal: {
          threeYearGoal: {
            sevenYearVision: {
              userId: session.user.id,
            },
          },
        },
        targetMonth: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        status: true,
      },
    });

    const goalsCompleted = monthlyGoals.filter((g) => g.status === "COMPLETED").length;
    const goalsTotal = monthlyGoals.length;

    // Get Kaizen check-ins count
    const kaizenCheckinsCount = await prisma.kaizenCheckin.count({
      where: {
        userId: session.user.id,
        checkinDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Check if review already exists for this month
    const existingReview = await prisma.monthlyReview.findUnique({
      where: {
        userId_monthStart: {
          userId: session.user.id,
          monthStart: startOfMonth,
        },
      },
    });

    let review;
    let isNewReview = false;

    if (existingReview) {
      // Update existing review
      review = await prisma.monthlyReview.update({
        where: { id: existingReview.id },
        data: {
          wins,
          learnings,
          nextMonthFocus,
          tasksCompleted,
          totalTasks,
          mitCompleted,
          mitTotal,
          goalsCompleted,
          goalsTotal,
          pointsEarned,
          goalAlignmentRate,
          kaizenCheckinsCount,
        },
      });
    } else {
      // Create new review and award points
      isNewReview = true;

      review = await prisma.monthlyReview.create({
        data: {
          userId: session.user.id,
          monthStart: startOfMonth,
          wins,
          learnings,
          nextMonthFocus,
          tasksCompleted,
          totalTasks,
          mitCompleted,
          mitTotal,
          goalsCompleted,
          goalsTotal,
          pointsEarned,
          goalAlignmentRate,
          kaizenCheckinsCount,
          reviewPoints: MONTHLY_REVIEW_POINTS,
        },
      });

      // Award points to user
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalPoints: { increment: MONTHLY_REVIEW_POINTS },
        },
      });

      // Update monthly review streak
      await prisma.streak.upsert({
        where: {
          userId_type: {
            userId: session.user.id,
            type: "MONTHLY_REVIEW",
          },
        },
        update: {
          currentCount: { increment: 1 },
          longestCount: {
            increment: 0, // Will be handled separately
          },
          lastActionAt: new Date(),
        },
        create: {
          userId: session.user.id,
          type: "MONTHLY_REVIEW",
          currentCount: 1,
          longestCount: 1,
          lastActionAt: new Date(),
        },
      });

      // Update longest count if needed
      const streak = await prisma.streak.findUnique({
        where: {
          userId_type: {
            userId: session.user.id,
            type: "MONTHLY_REVIEW",
          },
        },
      });

      if (streak && streak.currentCount > streak.longestCount) {
        await prisma.streak.update({
          where: { id: streak.id },
          data: { longestCount: streak.currentCount },
        });
      }
    }

    return NextResponse.json({
      success: true,
      review,
      isNewReview,
      pointsAwarded: isNewReview ? MONTHLY_REVIEW_POINTS : 0,
    });
  } catch (error) {
    console.error("Error submitting monthly review:", error);
    return NextResponse.json(
      { error: "Failed to submit monthly review" },
      { status: 500 }
    );
  }
}

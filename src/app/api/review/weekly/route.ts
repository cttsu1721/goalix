import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface DayBreakdown {
  date: string;
  dayOfWeek: string;
  completed: number;
  total: number;
  mitCompleted: boolean;
  pointsEarned: number;
}

// GET /api/review/weekly - Get comprehensive weekly review data
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get("weekOffset") || "0", 10);

    // Calculate week boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of current week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysToSubtract - weekOffset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    // End of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Fetch all tasks for the week
    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: startOfWeek,
          lte: endOfWeek,
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

    // Build daily breakdown
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyBreakdown: DayBreakdown[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTasks = tasks.filter((t) => {
        const taskDate = new Date(t.scheduledDate).toISOString().split("T")[0];
        return taskDate === dateStr;
      });

      dailyBreakdown.push({
        date: dateStr,
        dayOfWeek: dayNames[i],
        completed: dayTasks.filter((t) => t.status === "COMPLETED").length,
        total: dayTasks.length,
        mitCompleted: dayTasks.some(
          (t) => t.priority === "MIT" && t.status === "COMPLETED"
        ),
        pointsEarned: dayTasks.reduce((sum, t) => sum + t.pointsEarned, 0),
      });
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

    // Get goals progressed (weekly goals with at least one completed task)
    const weeklyGoalIds = [
      ...new Set(
        completedTasks
          .map((t) => t.weeklyGoalId)
          .filter((id): id is string => id !== null)
      ),
    ];
    const goalsProgressed = weeklyGoalIds.length;

    // Fetch Kaizen check-ins for the week
    const kaizenCheckins = await prisma.kaizenCheckin.findMany({
      where: {
        userId: session.user.id,
        checkinDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: { checkinDate: "asc" },
    });

    // Process Kaizen data
    const kaizenStats = {
      checkinsCompleted: kaizenCheckins.length,
      checkinsTotal: 7,
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
      dailyCheckins: dayNames.map((day, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const checkin = kaizenCheckins.find(
          (c) => new Date(c.checkinDate).toISOString().split("T")[0] === dateStr
        );

        if (!checkin) {
          return { day, date: dateStr, areasChecked: 0, areas: [] };
        }

        const areas: string[] = [];
        if (checkin.health) areas.push("health");
        if (checkin.relationships) areas.push("relationships");
        if (checkin.wealth) areas.push("wealth");
        if (checkin.career) areas.push("career");
        if (checkin.personalGrowth) areas.push("personalGrowth");
        if (checkin.lifestyle) areas.push("lifestyle");

        return {
          day,
          date: dateStr,
          areasChecked: areas.length,
          areas,
        };
      }),
    };

    // Find strongest and weakest areas
    const areaEntries = Object.entries(kaizenStats.areaBreakdown);
    areaEntries.sort((a, b) => b[1] - a[1]);
    const strongestArea = areaEntries[0] || null;
    const weakestArea = areaEntries[areaEntries.length - 1] || null;

    return NextResponse.json({
      weekRange: {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString(),
        weekOffset,
      },
      stats: {
        tasksCompleted,
        totalTasks,
        completionRate,
        mitCompleted,
        mitTotal,
        mitCompletionRate,
        goalsProgressed,
        pointsEarned,
      },
      goalAlignment: {
        linkedCompleted,
        unlinkedCompleted,
        alignmentRate,
        totalLinked: linkedTasks.length,
        totalUnlinked: unlinkedTasks.length,
      },
      dailyBreakdown,
      kaizen: {
        ...kaizenStats,
        strongestArea: strongestArea ? { area: strongestArea[0], count: strongestArea[1] } : null,
        weakestArea: weakestArea && weakestArea[1] < 7 ? { area: weakestArea[0], count: weakestArea[1] } : null,
      },
    });
  } catch (error) {
    console.error("Error fetching weekly review data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly review data" },
      { status: 500 }
    );
  }
}

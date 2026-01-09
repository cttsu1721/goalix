import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const format = request.nextUrl.searchParams.get("format") || "json";

    // Fetch all user data
    const [
      user,
      visions,
      threeYearGoals,
      oneYearGoals,
      monthlyGoals,
      weeklyGoals,
      tasks,
      kaizenCheckins,
      streaks,
      badges,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          timezone: true,
          totalPoints: true,
          level: true,
          createdAt: true,
        },
      }),
      prisma.sevenYearVision.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.threeYearGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.oneYearGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.monthlyGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.weeklyGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.dailyTask.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 1000, // Limit to last 1000 tasks
      }),
      prisma.kaizenCheckin.findMany({
        where: { userId },
        orderBy: { checkinDate: "desc" },
        take: 365, // Limit to last year
      }),
      prisma.streak.findMany({
        where: { userId },
      }),
      prisma.earnedBadge.findMany({
        where: { userId },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      goals: {
        visions,
        threeYearGoals,
        oneYearGoals,
        monthlyGoals,
        weeklyGoals,
      },
      tasks,
      kaizenCheckins,
      streaks,
      badges,
    };

    if (format === "csv") {
      // Generate CSV for tasks (most useful for spreadsheet analysis)
      const csvRows = [
        ["Date", "Title", "Priority", "Status", "Points Earned", "Weekly Goal ID", "Created At"].join(","),
        ...tasks.map((task) =>
          [
            task.scheduledDate.toISOString().split("T")[0],
            `"${task.title.replace(/"/g, '""')}"`,
            task.priority,
            task.status,
            task.pointsEarned,
            task.weeklyGoalId || "",
            task.createdAt.toISOString(),
          ].join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="goalzenix-tasks-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Default: JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="goalzenix-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to export data" } },
      { status: 500 }
    );
  }
}

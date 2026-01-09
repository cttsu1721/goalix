import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface UnlinkedGoal {
  id: string;
  title: string;
  level: "threeYear" | "oneYear" | "monthly" | "weekly";
  category: string;
  status: string;
  createdAt: Date;
}

// GET /api/goals/unlinked - List all goals without parent links
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unlinkedGoals: UnlinkedGoal[] = [];

    // Find 3-year goals without a 7-year vision parent
    const orphanedThreeYear = await prisma.threeYearGoal.findMany({
      where: {
        userId: session.user.id,
        sevenYearVisionId: null,
        status: "ACTIVE", // Only show active unlinked goals
      },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    orphanedThreeYear.forEach((goal) => {
      unlinkedGoals.push({
        id: goal.id,
        title: goal.title,
        level: "threeYear",
        category: goal.category,
        status: goal.status,
        createdAt: goal.createdAt,
      });
    });

    // Find 1-year goals without a 3-year goal parent
    const orphanedOneYear = await prisma.oneYearGoal.findMany({
      where: {
        userId: session.user.id,
        threeYearGoalId: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    orphanedOneYear.forEach((goal) => {
      unlinkedGoals.push({
        id: goal.id,
        title: goal.title,
        level: "oneYear",
        category: goal.category,
        status: goal.status,
        createdAt: goal.createdAt,
      });
    });

    // Find monthly goals without a 1-year goal parent
    const orphanedMonthly = await prisma.monthlyGoal.findMany({
      where: {
        userId: session.user.id,
        oneYearGoalId: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
      },
      orderBy: { targetMonth: "desc" },
    });

    orphanedMonthly.forEach((goal) => {
      unlinkedGoals.push({
        id: goal.id,
        title: goal.title,
        level: "monthly",
        category: goal.category,
        status: goal.status,
        createdAt: goal.createdAt,
      });
    });

    // Find weekly goals without a monthly goal parent
    const orphanedWeekly = await prisma.weeklyGoal.findMany({
      where: {
        userId: session.user.id,
        monthlyGoalId: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
      },
      orderBy: { weekStart: "desc" },
    });

    orphanedWeekly.forEach((goal) => {
      unlinkedGoals.push({
        id: goal.id,
        title: goal.title,
        level: "weekly",
        category: goal.category,
        status: goal.status,
        createdAt: goal.createdAt,
      });
    });

    return NextResponse.json({
      unlinkedGoals,
      count: unlinkedGoals.length,
      breakdown: {
        threeYear: orphanedThreeYear.length,
        oneYear: orphanedOneYear.length,
        monthly: orphanedMonthly.length,
        weekly: orphanedWeekly.length,
      },
    });
  } catch (error) {
    console.error("Error fetching unlinked goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch unlinked goals" },
      { status: 500 }
    );
  }
}

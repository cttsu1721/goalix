import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { GoalLevel } from "@/types/goals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SiblingGoal {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
}

/**
 * GET /api/goals/[id]/siblings
 * Returns sibling goals (same parent, same level) for navigation context
 * Used for 3.8 - Show sibling goals when viewing one goal
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Find what level this goal is at and its parent
    const [sevenYear, threeYear, oneYear, monthly, weekly] = await prisma.$transaction([
      prisma.sevenYearVision.findFirst({
        where: { id, userId },
        select: { id: true },
      }),
      prisma.threeYearGoal.findFirst({
        where: { id, sevenYearVision: { userId } },
        select: { id: true, sevenYearVisionId: true },
      }),
      prisma.oneYearGoal.findFirst({
        where: { id, threeYearGoal: { sevenYearVision: { userId } } },
        select: { id: true, threeYearGoalId: true },
      }),
      prisma.monthlyGoal.findFirst({
        where: { id, oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } } },
        select: { id: true, oneYearGoalId: true },
      }),
      prisma.weeklyGoal.findFirst({
        where: { id, monthlyGoal: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } } } },
        select: { id: true, monthlyGoalId: true },
      }),
    ]);

    let siblings: SiblingGoal[] = [];
    let level: GoalLevel | null = null;

    // 7-year visions have no siblings (they're top-level)
    if (sevenYear) {
      level = "sevenYear";
      // Get other visions by the same user
      const otherVisions = await prisma.sevenYearVision.findMany({
        where: { userId, id: { not: id } },
        select: { id: true, title: true, category: true, status: true, progress: true },
        orderBy: { title: "asc" },
        take: 5,
      });
      siblings = otherVisions;
    }

    // 3-year goals - siblings share the same 7-year vision
    if (threeYear) {
      level = "threeYear";
      const siblingGoals = await prisma.threeYearGoal.findMany({
        where: {
          sevenYearVisionId: threeYear.sevenYearVisionId,
          id: { not: id },
        },
        select: { id: true, title: true, category: true, status: true, progress: true },
        orderBy: { title: "asc" },
        take: 5,
      });
      siblings = siblingGoals;
    }

    // 1-year goals - siblings share the same 3-year goal
    if (oneYear) {
      level = "oneYear";
      const siblingGoals = await prisma.oneYearGoal.findMany({
        where: {
          threeYearGoalId: oneYear.threeYearGoalId,
          id: { not: id },
        },
        select: { id: true, title: true, category: true, status: true, progress: true },
        orderBy: { title: "asc" },
        take: 5,
      });
      siblings = siblingGoals;
    }

    // Monthly goals - siblings share the same 1-year goal
    if (monthly) {
      level = "monthly";
      const siblingGoals = await prisma.monthlyGoal.findMany({
        where: {
          oneYearGoalId: monthly.oneYearGoalId,
          id: { not: id },
        },
        select: { id: true, title: true, category: true, status: true, progress: true },
        orderBy: { title: "asc" },
        take: 5,
      });
      siblings = siblingGoals;
    }

    // Weekly goals - siblings share the same monthly goal
    if (weekly) {
      level = "weekly";
      const siblingGoals = await prisma.weeklyGoal.findMany({
        where: {
          monthlyGoalId: weekly.monthlyGoalId,
          id: { not: id },
        },
        select: { id: true, title: true, category: true, status: true, progress: true },
        orderBy: { title: "asc" },
        take: 5,
      });
      siblings = siblingGoals;
    }

    if (!level) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({
      siblings,
      level,
      count: siblings.length,
    });
  } catch (error) {
    console.error("Error fetching sibling goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch sibling goals" },
      { status: 500 }
    );
  }
}

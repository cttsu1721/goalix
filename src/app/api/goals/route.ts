import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoalCategory, GoalStatus } from "@prisma/client";
import type { GoalLevel } from "@/types/goals";

// GET /api/goals - List goals by level
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") as GoalLevel | null;
    const parentId = searchParams.get("parentId");
    const status = searchParams.get("status") as GoalStatus | null;

    // Default to dreams if no level specified
    const goalLevel = level || "dream";

    let goals;
    const where = {
      ...(status && { status }),
    };

    switch (goalLevel) {
      case "dream":
        goals = await prisma.dream.findMany({
          where: {
            userId: session.user.id,
            ...where,
          },
          include: {
            fiveYearGoals: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "fiveYear":
        goals = await prisma.fiveYearGoal.findMany({
          where: {
            dream: { userId: session.user.id },
            ...(parentId && { dreamId: parentId }),
            ...where,
          },
          include: {
            dream: {
              select: { id: true, title: true },
            },
            oneYearGoals: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "oneYear":
        goals = await prisma.oneYearGoal.findMany({
          where: {
            fiveYearGoal: { dream: { userId: session.user.id } },
            ...(parentId && { fiveYearGoalId: parentId }),
            ...where,
          },
          include: {
            fiveYearGoal: {
              select: { id: true, title: true },
            },
            monthlyGoals: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "monthly":
        goals = await prisma.monthlyGoal.findMany({
          where: {
            oneYearGoal: { fiveYearGoal: { dream: { userId: session.user.id } } },
            ...(parentId && { oneYearGoalId: parentId }),
            ...where,
          },
          include: {
            oneYearGoal: {
              select: { id: true, title: true },
            },
            weeklyGoals: {
              select: { id: true },
            },
          },
          orderBy: { targetMonth: "desc" },
        });
        break;

      case "weekly":
        goals = await prisma.weeklyGoal.findMany({
          where: {
            userId: session.user.id,
            ...(parentId && { monthlyGoalId: parentId }),
            ...where,
          },
          include: {
            monthlyGoal: {
              select: { id: true, title: true },
            },
            dailyTasks: {
              select: { id: true, status: true },
            },
          },
          orderBy: { weekStart: "desc" },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid goal level" }, { status: 400 });
    }

    return NextResponse.json({ goals, level: goalLevel });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { level, parentId, title, description, category, targetDate, targetMonth, weekStart } = body;

    // Validate required fields
    if (!level || !title || !category) {
      return NextResponse.json(
        { error: "Missing required fields: level, title, category" },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(GoalCategory).includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    let goal;

    switch (level as GoalLevel) {
      case "dream":
        goal = await prisma.dream.create({
          data: {
            userId: session.user.id,
            title,
            description: description || null,
            category: category as GoalCategory,
            targetDate: targetDate ? new Date(targetDate) : null,
          },
        });
        break;

      case "fiveYear":
        if (!parentId) {
          return NextResponse.json(
            { error: "parentId (dreamId) is required for 5-year goals" },
            { status: 400 }
          );
        }
        // Verify parent belongs to user
        const dream = await prisma.dream.findFirst({
          where: { id: parentId, userId: session.user.id },
        });
        if (!dream) {
          return NextResponse.json({ error: "Parent dream not found" }, { status: 404 });
        }
        goal = await prisma.fiveYearGoal.create({
          data: {
            dreamId: parentId,
            title,
            description: description || null,
            category: category as GoalCategory,
            targetDate: targetDate ? new Date(targetDate) : null,
          },
        });
        break;

      case "oneYear":
        if (!parentId) {
          return NextResponse.json(
            { error: "parentId (fiveYearGoalId) is required for 1-year goals" },
            { status: 400 }
          );
        }
        const fiveYearGoal = await prisma.fiveYearGoal.findFirst({
          where: { id: parentId, dream: { userId: session.user.id } },
        });
        if (!fiveYearGoal) {
          return NextResponse.json({ error: "Parent 5-year goal not found" }, { status: 404 });
        }
        goal = await prisma.oneYearGoal.create({
          data: {
            fiveYearGoalId: parentId,
            title,
            description: description || null,
            category: category as GoalCategory,
            targetDate: targetDate ? new Date(targetDate) : null,
          },
        });
        break;

      case "monthly":
        if (!parentId) {
          return NextResponse.json(
            { error: "parentId (oneYearGoalId) is required for monthly goals" },
            { status: 400 }
          );
        }
        if (!targetMonth) {
          return NextResponse.json(
            { error: "targetMonth is required for monthly goals" },
            { status: 400 }
          );
        }
        const oneYearGoal = await prisma.oneYearGoal.findFirst({
          where: { id: parentId, fiveYearGoal: { dream: { userId: session.user.id } } },
        });
        if (!oneYearGoal) {
          return NextResponse.json({ error: "Parent 1-year goal not found" }, { status: 404 });
        }
        goal = await prisma.monthlyGoal.create({
          data: {
            oneYearGoalId: parentId,
            title,
            description: description || null,
            category: category as GoalCategory,
            targetMonth: new Date(targetMonth),
          },
        });
        break;

      case "weekly":
        if (!weekStart) {
          return NextResponse.json(
            { error: "weekStart is required for weekly goals" },
            { status: 400 }
          );
        }
        // If parentId provided, verify it belongs to user
        if (parentId) {
          const monthlyGoal = await prisma.monthlyGoal.findFirst({
            where: {
              id: parentId,
              oneYearGoal: { fiveYearGoal: { dream: { userId: session.user.id } } },
            },
          });
          if (!monthlyGoal) {
            return NextResponse.json({ error: "Parent monthly goal not found" }, { status: 404 });
          }
        }
        goal = await prisma.weeklyGoal.create({
          data: {
            userId: session.user.id,
            monthlyGoalId: parentId || null,
            title,
            description: description || null,
            category: category as GoalCategory,
            weekStart: new Date(weekStart),
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid goal level" }, { status: 400 });
    }

    return NextResponse.json({ goal, level }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

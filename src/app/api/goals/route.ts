import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { GoalCategory, GoalStatus } from "@prisma/client";
import type { GoalLevel } from "@/types/goals";

// GET /api/goals - List goals by level
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") as GoalLevel | null;
    const parentId = searchParams.get("parentId");
    const status = searchParams.get("status") as GoalStatus | null;
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Default to sevenYear if no level specified
    const goalLevel = level || "sevenYear";

    let goals;
    // By default, exclude archived goals unless specifically requested
    const where = {
      ...(status
        ? { status }
        : !includeArchived && { status: { not: "ARCHIVED" as GoalStatus } }),
    };

    switch (goalLevel) {
      case "sevenYear":
        goals = await prisma.sevenYearVision.findMany({
          where: {
            userId: user.id,
            ...where,
          },
          include: {
            threeYearGoals: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "threeYear":
        goals = await prisma.threeYearGoal.findMany({
          where: {
            userId: user.id,
            ...(parentId && { sevenYearVisionId: parentId }),
            ...where,
          },
          include: {
            sevenYearVision: {
              select: { id: true, title: true },
            },
            oneYearGoals: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "oneYear":
        goals = await prisma.oneYearGoal.findMany({
          where: {
            userId: user.id,
            ...(parentId && { threeYearGoalId: parentId }),
            ...where,
          },
          include: {
            threeYearGoal: {
              select: {
                id: true,
                title: true,
                sevenYearVision: {
                  select: { id: true, title: true },
                },
              },
            },
            monthlyGoals: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "monthly":
        goals = await prisma.monthlyGoal.findMany({
          where: {
            userId: user.id,
            ...(parentId && { oneYearGoalId: parentId }),
            ...where,
          },
          include: {
            oneYearGoal: {
              select: { id: true, title: true },
            },
            weeklyGoals: {
              select: { id: true, status: true },
            },
          },
          orderBy: { targetMonth: "desc" },
        });
        break;

      case "weekly":
        goals = await prisma.weeklyGoal.findMany({
          where: {
            userId: user.id,
            ...(parentId && { monthlyGoalId: parentId }),
            ...where,
          },
          include: {
            monthlyGoal: {
              select: {
                id: true,
                title: true,
                oneYearGoal: {
                  select: { id: true, title: true },
                },
              },
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
    const user = await authenticateRequest(request);
    if (!user) {
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
      case "sevenYear":
        goal = await prisma.sevenYearVision.create({
          data: {
            userId: user.id,
            title,
            description: description || null,
            category: category as GoalCategory,
            targetDate: targetDate ? new Date(targetDate) : null,
          },
        });
        break;

      case "threeYear":
        // If parentId provided, verify it belongs to user
        if (parentId) {
          const vision = await prisma.sevenYearVision.findFirst({
            where: { id: parentId, userId: user.id },
          });
          if (!vision) {
            return NextResponse.json({ error: "Parent vision not found" }, { status: 404 });
          }
        }
        goal = await prisma.threeYearGoal.create({
          data: {
            userId: user.id,
            sevenYearVisionId: parentId || null,
            title,
            description: description || null,
            category: category as GoalCategory,
            targetDate: targetDate ? new Date(targetDate) : null,
          },
        });
        break;

      case "oneYear":
        // If parentId provided, verify it belongs to user
        if (parentId) {
          const threeYearGoal = await prisma.threeYearGoal.findFirst({
            where: { id: parentId, userId: user.id },
          });
          if (!threeYearGoal) {
            return NextResponse.json({ error: "Parent 3-year goal not found" }, { status: 404 });
          }
        }
        goal = await prisma.oneYearGoal.create({
          data: {
            userId: user.id,
            threeYearGoalId: parentId || null,
            title,
            description: description || null,
            category: category as GoalCategory,
            targetDate: targetDate ? new Date(targetDate) : null,
          },
        });
        break;

      case "monthly":
        if (!targetMonth) {
          return NextResponse.json(
            { error: "targetMonth is required for monthly goals" },
            { status: 400 }
          );
        }
        // If parentId provided, verify it belongs to user
        if (parentId) {
          const oneYearGoal = await prisma.oneYearGoal.findFirst({
            where: { id: parentId, userId: user.id },
          });
          if (!oneYearGoal) {
            return NextResponse.json({ error: "Parent 1-year goal not found" }, { status: 404 });
          }
        }
        goal = await prisma.monthlyGoal.create({
          data: {
            userId: user.id,
            oneYearGoalId: parentId || null,
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
            where: { id: parentId, userId: user.id },
          });
          if (!monthlyGoal) {
            return NextResponse.json({ error: "Parent monthly goal not found" }, { status: 404 });
          }
        }
        goal = await prisma.weeklyGoal.create({
          data: {
            userId: user.id,
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

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { GoalCategory, GoalStatus } from "@prisma/client";
import type { GoalLevel } from "@/types/goals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Breadcrumb item type for navigation
interface BreadcrumbItem {
  id: string;
  title: string;
  level: GoalLevel;
}

// Helper to determine goal level by ID - uses parallel queries for performance
async function findGoalByIdAndUser(id: string, userId: string) {
  // Run all queries in parallel using $transaction
  const [sevenYear, threeYear, oneYear, monthly, weekly] = await prisma.$transaction([
    prisma.sevenYearVision.findFirst({
      where: { id, userId },
      include: {
        threeYearGoals: {
          include: {
            oneYearGoals: {
              include: {
                monthlyGoals: {
                  include: {
                    weeklyGoals: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.threeYearGoal.findFirst({
      where: { id, sevenYearVision: { userId } },
      include: {
        sevenYearVision: { select: { id: true, title: true } },
        oneYearGoals: {
          include: {
            monthlyGoals: {
              include: {
                weeklyGoals: true,
              },
            },
          },
        },
      },
    }),
    prisma.oneYearGoal.findFirst({
      where: { id, threeYearGoal: { sevenYearVision: { userId } } },
      include: {
        threeYearGoal: {
          select: {
            id: true,
            title: true,
            sevenYearVision: { select: { id: true, title: true } },
          },
        },
        monthlyGoals: {
          include: {
            weeklyGoals: true,
          },
        },
      },
    }),
    prisma.monthlyGoal.findFirst({
      where: { id, oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } } },
      include: {
        oneYearGoal: {
          select: {
            id: true,
            title: true,
            threeYearGoal: {
              select: {
                id: true,
                title: true,
                sevenYearVision: { select: { id: true, title: true } },
              },
            },
          },
        },
        weeklyGoals: true,
      },
    }),
    prisma.weeklyGoal.findFirst({
      where: { id, monthlyGoal: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } } } },
      include: {
        monthlyGoal: {
          select: {
            id: true,
            title: true,
            oneYearGoal: {
              select: {
                id: true,
                title: true,
                threeYearGoal: {
                  select: {
                    id: true,
                    title: true,
                    sevenYearVision: { select: { id: true, title: true } },
                  },
                },
              },
            },
          },
        },
        dailyTasks: true,
      },
    }),
  ]);

  // Build breadcrumb from ancestors
  function buildBreadcrumb(goal: Record<string, unknown>, level: GoalLevel): BreadcrumbItem[] {
    const breadcrumb: BreadcrumbItem[] = [];

    if (level === "threeYear") {
      const vision = goal.sevenYearVision as { id: string; title: string } | null;
      if (vision) breadcrumb.push({ id: vision.id, title: vision.title, level: "sevenYear" });
    }

    if (level === "oneYear") {
      const threeYear = goal.threeYearGoal as { id: string; title: string; sevenYearVision?: { id: string; title: string } } | null;
      if (threeYear?.sevenYearVision) {
        breadcrumb.push({ id: threeYear.sevenYearVision.id, title: threeYear.sevenYearVision.title, level: "sevenYear" });
      }
      if (threeYear) breadcrumb.push({ id: threeYear.id, title: threeYear.title, level: "threeYear" });
    }

    if (level === "monthly") {
      const oneYear = goal.oneYearGoal as { id: string; title: string; threeYearGoal?: { id: string; title: string; sevenYearVision?: { id: string; title: string } } } | null;
      if (oneYear?.threeYearGoal?.sevenYearVision) {
        breadcrumb.push({ id: oneYear.threeYearGoal.sevenYearVision.id, title: oneYear.threeYearGoal.sevenYearVision.title, level: "sevenYear" });
      }
      if (oneYear?.threeYearGoal) breadcrumb.push({ id: oneYear.threeYearGoal.id, title: oneYear.threeYearGoal.title, level: "threeYear" });
      if (oneYear) breadcrumb.push({ id: oneYear.id, title: oneYear.title, level: "oneYear" });
    }

    if (level === "weekly") {
      const monthly = goal.monthlyGoal as { id: string; title: string; oneYearGoal?: { id: string; title: string; threeYearGoal?: { id: string; title: string; sevenYearVision?: { id: string; title: string } } } } | null;
      if (monthly?.oneYearGoal?.threeYearGoal?.sevenYearVision) {
        breadcrumb.push({ id: monthly.oneYearGoal.threeYearGoal.sevenYearVision.id, title: monthly.oneYearGoal.threeYearGoal.sevenYearVision.title, level: "sevenYear" });
      }
      if (monthly?.oneYearGoal?.threeYearGoal) breadcrumb.push({ id: monthly.oneYearGoal.threeYearGoal.id, title: monthly.oneYearGoal.threeYearGoal.title, level: "threeYear" });
      if (monthly?.oneYearGoal) breadcrumb.push({ id: monthly.oneYearGoal.id, title: monthly.oneYearGoal.title, level: "oneYear" });
      if (monthly) breadcrumb.push({ id: monthly.id, title: monthly.title, level: "monthly" });
    }

    return breadcrumb;
  }

  // Return the first match found with breadcrumb
  if (sevenYear) return { goal: sevenYear, level: "sevenYear" as GoalLevel, breadcrumb: [] };
  if (threeYear) return { goal: threeYear, level: "threeYear" as GoalLevel, breadcrumb: buildBreadcrumb(threeYear as Record<string, unknown>, "threeYear") };
  if (oneYear) return { goal: oneYear, level: "oneYear" as GoalLevel, breadcrumb: buildBreadcrumb(oneYear as Record<string, unknown>, "oneYear") };
  if (monthly) return { goal: monthly, level: "monthly" as GoalLevel, breadcrumb: buildBreadcrumb(monthly as Record<string, unknown>, "monthly") };
  if (weekly) return { goal: weekly, level: "weekly" as GoalLevel, breadcrumb: buildBreadcrumb(weekly as Record<string, unknown>, "weekly") };

  return null;
}

// GET /api/goals/[id] - Get a single goal with children
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await findGoalByIdAndUser(id, user.id);

    if (!result) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

// PATCH /api/goals/[id] - Update a goal
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, category, status, targetDate, targetMonth, weekStart, progress } = body;

    // Find the goal first
    const result = await findGoalByIdAndUser(id, user.id);
    if (!result) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const { level } = result;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (progress !== undefined) updateData.progress = progress;

    if (category !== undefined) {
      if (!Object.values(GoalCategory).includes(category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      updateData.category = category;
    }

    if (status !== undefined) {
      if (!Object.values(GoalStatus).includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = status;
    }

    let goal;

    switch (level) {
      case "sevenYear":
        if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
        goal = await prisma.sevenYearVision.update({
          where: { id },
          data: updateData,
        });
        break;

      case "threeYear":
        if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
        goal = await prisma.threeYearGoal.update({
          where: { id },
          data: updateData,
        });
        break;

      case "oneYear":
        if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
        goal = await prisma.oneYearGoal.update({
          where: { id },
          data: updateData,
        });
        break;

      case "monthly":
        if (targetMonth !== undefined) updateData.targetMonth = new Date(targetMonth);
        goal = await prisma.monthlyGoal.update({
          where: { id },
          data: updateData,
        });
        break;

      case "weekly":
        if (weekStart !== undefined) updateData.weekStart = new Date(weekStart);
        goal = await prisma.weeklyGoal.update({
          where: { id },
          data: updateData,
        });
        break;
    }

    return NextResponse.json({ goal, level });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id] - Delete a goal (cascades to children)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the goal first
    const result = await findGoalByIdAndUser(id, user.id);
    if (!result) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const { level } = result;

    // Delete based on level (Prisma cascade will handle children)
    switch (level) {
      case "sevenYear":
        await prisma.sevenYearVision.delete({ where: { id } });
        break;
      case "threeYear":
        await prisma.threeYearGoal.delete({ where: { id } });
        break;
      case "oneYear":
        await prisma.oneYearGoal.delete({ where: { id } });
        break;
      case "monthly":
        await prisma.monthlyGoal.delete({ where: { id } });
        break;
      case "weekly":
        await prisma.weeklyGoal.delete({ where: { id } });
        break;
    }

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}

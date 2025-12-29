import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoalCategory, GoalStatus } from "@prisma/client";
import type { GoalLevel } from "@/types/goals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to determine goal level by ID
async function findGoalByIdAndUser(id: string, userId: string) {
  // Try each goal type
  const dream = await prisma.dream.findFirst({
    where: { id, userId },
    include: {
      fiveYearGoals: {
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
  });
  if (dream) return { goal: dream, level: "dream" as GoalLevel };

  const fiveYear = await prisma.fiveYearGoal.findFirst({
    where: { id, dream: { userId } },
    include: {
      dream: { select: { id: true, title: true } },
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
  });
  if (fiveYear) return { goal: fiveYear, level: "fiveYear" as GoalLevel };

  const oneYear = await prisma.oneYearGoal.findFirst({
    where: { id, fiveYearGoal: { dream: { userId } } },
    include: {
      fiveYearGoal: { select: { id: true, title: true } },
      monthlyGoals: {
        include: {
          weeklyGoals: true,
        },
      },
    },
  });
  if (oneYear) return { goal: oneYear, level: "oneYear" as GoalLevel };

  const monthly = await prisma.monthlyGoal.findFirst({
    where: { id, oneYearGoal: { fiveYearGoal: { dream: { userId } } } },
    include: {
      oneYearGoal: { select: { id: true, title: true } },
      weeklyGoals: true,
    },
  });
  if (monthly) return { goal: monthly, level: "monthly" as GoalLevel };

  const weekly = await prisma.weeklyGoal.findFirst({
    where: { id, monthlyGoal: { oneYearGoal: { fiveYearGoal: { dream: { userId } } } } },
    include: {
      monthlyGoal: { select: { id: true, title: true } },
      dailyTasks: true,
    },
  });
  if (weekly) return { goal: weekly, level: "weekly" as GoalLevel };

  return null;
}

// GET /api/goals/[id] - Get a single goal with children
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await findGoalByIdAndUser(id, session.user.id);

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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, category, status, targetDate, targetMonth, weekStart, progress } = body;

    // Find the goal first
    const result = await findGoalByIdAndUser(id, session.user.id);
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
      case "dream":
        if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
        goal = await prisma.dream.update({
          where: { id },
          data: updateData,
        });
        break;

      case "fiveYear":
        if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
        goal = await prisma.fiveYearGoal.update({
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the goal first
    const result = await findGoalByIdAndUser(id, session.user.id);
    if (!result) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const { level } = result;

    // Delete based on level (Prisma cascade will handle children)
    switch (level) {
      case "dream":
        await prisma.dream.delete({ where: { id } });
        break;
      case "fiveYear":
        await prisma.fiveYearGoal.delete({ where: { id } });
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

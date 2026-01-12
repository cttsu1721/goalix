import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Helper to get Monday of current week
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Helper to get first day of current month
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Helper to format date as YYYY-MM-DD
function formatLocalDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD
}

interface CascadeCreateRequest {
  parentGoalId: string;
  parentLevel: "oneYear" | "monthly" | "weekly";
  children: Array<{
    title: string;
    description?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CascadeCreateRequest;
    const { parentGoalId, parentLevel, children } = body;

    if (!parentGoalId || !parentLevel || !children?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    let createdCount = 0;

    // Handle each level type differently
    if (parentLevel === "oneYear") {
      // Creating monthly goals from 1-year goal
      const oneYearGoal = await prisma.oneYearGoal.findFirst({
        where: { id: parentGoalId, userId },
      });

      if (!oneYearGoal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      const monthStart = getMonthStart();

      await prisma.monthlyGoal.createMany({
        data: children.map((child) => ({
          userId,
          oneYearGoalId: parentGoalId,
          title: child.title,
          description: child.description,
          category: oneYearGoal.category,
          targetMonth: monthStart,
        })),
      });

      createdCount = children.length;
    } else if (parentLevel === "monthly") {
      // Creating weekly goals from monthly goal
      const monthlyGoal = await prisma.monthlyGoal.findFirst({
        where: { id: parentGoalId, userId },
      });

      if (!monthlyGoal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      const weekStart = getWeekStart();

      await prisma.weeklyGoal.createMany({
        data: children.map((child) => ({
          userId,
          monthlyGoalId: parentGoalId,
          title: child.title,
          description: child.description,
          category: monthlyGoal.category,
          weekStart,
        })),
      });

      createdCount = children.length;
    } else if (parentLevel === "weekly") {
      // Creating daily tasks from weekly goal
      const weeklyGoal = await prisma.weeklyGoal.findFirst({
        where: { id: parentGoalId, userId },
      });

      if (!weeklyGoal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      const today = formatLocalDate();

      await prisma.dailyTask.createMany({
        data: children.map((child, index) => ({
          userId,
          weeklyGoalId: parentGoalId,
          title: child.title,
          notes: child.description,
          priority: index === 0 ? "PRIMARY" : "SECONDARY",
          scheduledDate: new Date(`${today}T12:00:00`),
        })),
      });

      createdCount = children.length;
    } else {
      return NextResponse.json(
        { error: "Invalid parent level" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      createdCount,
    });
  } catch (error) {
    console.error("Error creating cascade children:", error);
    return NextResponse.json(
      { error: "Failed to create goals" },
      { status: 500 }
    );
  }
}

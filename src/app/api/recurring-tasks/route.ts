import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecurrencePattern, TaskPriority } from "@prisma/client";
import { parseLocalDate } from "@/lib/utils";

const DAY_MAP: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

// GET /api/recurring-tasks - List recurring task templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const templates = await prisma.recurringTaskTemplate.findMany({
      where: {
        userId: session.user.id,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        weeklyGoal: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching recurring templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring templates" },
      { status: 500 }
    );
  }
}

// POST /api/recurring-tasks - Create a new recurring task template
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      priority,
      estimatedMinutes,
      weeklyGoalId,
      pattern,
      daysOfWeek,
      customInterval,
      startDate,
      endDate,
    } = body;

    // Validate required fields
    if (!title || !priority || !pattern || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, priority, pattern, startDate" },
        { status: 400 }
      );
    }

    // Validate priority
    if (!["MIT", "PRIMARY", "SECONDARY"].includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority. Must be MIT, PRIMARY, or SECONDARY" },
        { status: 400 }
      );
    }

    // Validate pattern
    if (!["DAILY", "WEEKDAYS", "WEEKLY", "CUSTOM"].includes(pattern)) {
      return NextResponse.json(
        { error: "Invalid pattern. Must be DAILY, WEEKDAYS, WEEKLY, or CUSTOM" },
        { status: 400 }
      );
    }

    // Validate pattern-specific fields
    if (pattern === "WEEKLY" && (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0)) {
      return NextResponse.json(
        { error: "daysOfWeek array is required for WEEKLY pattern" },
        { status: 400 }
      );
    }

    if (pattern === "CUSTOM" && (!customInterval || customInterval < 1)) {
      return NextResponse.json(
        { error: "customInterval (positive integer) is required for CUSTOM pattern" },
        { status: 400 }
      );
    }

    // Validate weeklyGoalId if provided
    if (weeklyGoalId) {
      const weeklyGoal = await prisma.weeklyGoal.findFirst({
        where: {
          id: weeklyGoalId,
          userId: session.user.id,
        },
      });

      if (!weeklyGoal) {
        return NextResponse.json(
          { error: "Weekly goal not found or does not belong to user" },
          { status: 400 }
        );
      }
    }

    const parsedStartDate = parseLocalDate(startDate);
    const parsedEndDate = endDate ? parseLocalDate(endDate) : null;

    const template = await prisma.recurringTaskTemplate.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        priority: priority as TaskPriority,
        estimatedMinutes: estimatedMinutes || null,
        weeklyGoalId: weeklyGoalId || null,
        pattern: pattern as RecurrencePattern,
        daysOfWeek: daysOfWeek ? JSON.stringify(daysOfWeek) : null,
        customInterval: customInterval || null,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
      include: {
        weeklyGoal: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating recurring template:", error);
    return NextResponse.json(
      { error: "Failed to create recurring template" },
      { status: 500 }
    );
  }
}

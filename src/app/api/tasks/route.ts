import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskPriority } from "@prisma/client";
import { TASK_PRIORITY_LIMITS } from "@/types/tasks";

// GET /api/tasks - List tasks for a specific date
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    // Default to today if no date provided
    const date = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
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
      orderBy: [
        { priority: "asc" }, // MIT first, then PRIMARY, then SECONDARY
        { createdAt: "asc" },
      ],
    });

    // Calculate stats
    const mit = tasks.find((t) => t.priority === "MIT") || null;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const primaryCount = tasks.filter((t) => t.priority === "PRIMARY").length;
    const secondaryCount = tasks.filter((t) => t.priority === "SECONDARY").length;

    return NextResponse.json({
      tasks,
      date: startOfDay.toISOString().split("T")[0],
      stats: {
        total: tasks.length,
        completed,
        mit,
        primaryCount,
        secondaryCount,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, scheduledDate, estimatedMinutes, weeklyGoalId } = body;

    // Validate required fields
    if (!title || !priority || !scheduledDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, priority, scheduledDate" },
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

    const date = new Date(scheduledDate);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Check priority limits
    const limit = TASK_PRIORITY_LIMITS[priority as TaskPriority];
    if (limit !== null) {
      const existingCount = await prisma.dailyTask.count({
        where: {
          userId: session.user.id,
          priority: priority as TaskPriority,
          scheduledDate: startOfDay,
        },
      });

      if (existingCount >= limit) {
        return NextResponse.json(
          { error: `Maximum ${limit} ${priority} task(s) allowed per day` },
          { status: 400 }
        );
      }
    }

    // Validate weeklyGoalId if provided
    if (weeklyGoalId) {
      const weeklyGoal = await prisma.weeklyGoal.findFirst({
        where: {
          id: weeklyGoalId,
          monthlyGoal: {
            oneYearGoal: {
              fiveYearGoal: {
                dream: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      });

      if (!weeklyGoal) {
        return NextResponse.json(
          { error: "Weekly goal not found or does not belong to user" },
          { status: 400 }
        );
      }
    }

    const task = await prisma.dailyTask.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        priority: priority as TaskPriority,
        scheduledDate: startOfDay,
        estimatedMinutes: estimatedMinutes || null,
        weeklyGoalId: weeklyGoalId || null,
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

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

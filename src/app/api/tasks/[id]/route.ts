import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { TASK_PRIORITY_LIMITS } from "@/types/tasks";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/[id] - Get a single task
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.dailyTask.findFirst({
      where: {
        id,
        userId: session.user.id,
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

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check task exists and belongs to user
    const existingTask = await prisma.dailyTask.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Build update data
    const updateData: {
      title?: string;
      description?: string | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      scheduledDate?: Date;
      estimatedMinutes?: number | null;
      weeklyGoalId?: string | null;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.estimatedMinutes !== undefined) updateData.estimatedMinutes = body.estimatedMinutes;
    if (body.weeklyGoalId !== undefined) updateData.weeklyGoalId = body.weeklyGoalId;

    // Handle priority change with limit check
    if (body.priority && body.priority !== existingTask.priority) {
      if (!["MIT", "PRIMARY", "SECONDARY"].includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority" },
          { status: 400 }
        );
      }

      const limit = TASK_PRIORITY_LIMITS[body.priority as TaskPriority];
      if (limit !== null) {
        const existingCount = await prisma.dailyTask.count({
          where: {
            userId: session.user.id,
            priority: body.priority as TaskPriority,
            scheduledDate: existingTask.scheduledDate,
            id: { not: id }, // Exclude current task
          },
        });

        if (existingCount >= limit) {
          return NextResponse.json(
            { error: `Maximum ${limit} ${body.priority} task(s) allowed per day` },
            { status: 400 }
          );
        }
      }
      updateData.priority = body.priority as TaskPriority;
    }

    // Handle status change
    if (body.status && body.status !== existingTask.status) {
      if (!["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"].includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = body.status as TaskStatus;
    }

    // Handle date change
    if (body.scheduledDate) {
      const newDate = new Date(body.scheduledDate);
      newDate.setHours(0, 0, 0, 0);
      updateData.scheduledDate = newDate;
    }

    const task = await prisma.dailyTask.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check task exists and belongs to user
    const existingTask = await prisma.dailyTask.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.dailyTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

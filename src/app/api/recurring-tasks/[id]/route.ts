import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecurrencePattern, TaskPriority } from "@prisma/client";
import { parseLocalDate } from "@/lib/utils";

// GET /api/recurring-tasks/[id] - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.recurringTaskTemplate.findFirst({
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
        dailyTasks: {
          take: 10,
          orderBy: { scheduledDate: "desc" },
          select: {
            id: true,
            scheduledDate: true,
            status: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Recurring template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching recurring template:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring template" },
      { status: 500 }
    );
  }
}

// PATCH /api/recurring-tasks/[id] - Update a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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
      isActive,
    } = body;

    // Verify template exists and belongs to user
    const existingTemplate = await prisma.recurringTaskTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Recurring template not found" },
        { status: 404 }
      );
    }

    // Validate priority if provided
    if (priority && !["MIT", "PRIMARY", "SECONDARY"].includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority. Must be MIT, PRIMARY, or SECONDARY" },
        { status: 400 }
      );
    }

    // Validate pattern if provided
    if (pattern && !["DAILY", "WEEKDAYS", "WEEKLY", "CUSTOM"].includes(pattern)) {
      return NextResponse.json(
        { error: "Invalid pattern. Must be DAILY, WEEKDAYS, WEEKLY, or CUSTOM" },
        { status: 400 }
      );
    }

    // Validate weeklyGoalId if provided
    if (weeklyGoalId !== undefined && weeklyGoalId !== null) {
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

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority as TaskPriority;
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;
    if (weeklyGoalId !== undefined) updateData.weeklyGoalId = weeklyGoalId;
    if (pattern !== undefined) updateData.pattern = pattern as RecurrencePattern;
    if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek ? JSON.stringify(daysOfWeek) : null;
    if (customInterval !== undefined) updateData.customInterval = customInterval;
    if (startDate !== undefined) updateData.startDate = parseLocalDate(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? parseLocalDate(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await prisma.recurringTaskTemplate.update({
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

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating recurring template:", error);
    return NextResponse.json(
      { error: "Failed to update recurring template" },
      { status: 500 }
    );
  }
}

// DELETE /api/recurring-tasks/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify template exists and belongs to user
    const existingTemplate = await prisma.recurringTaskTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Recurring template not found" },
        { status: 404 }
      );
    }

    // Delete the template (linked daily tasks remain but lose the reference)
    await prisma.recurringTaskTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring template:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring template" },
      { status: 500 }
    );
  }
}

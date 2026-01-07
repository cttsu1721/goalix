import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatLocalDate, parseLocalDate } from "@/lib/utils";

// POST /api/tasks/reschedule-overdue - Reschedule all overdue tasks to today
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { targetDate } = body;

    // Default to today if no target date provided
    const target = targetDate ? parseLocalDate(targetDate) : new Date();
    target.setHours(0, 0, 0, 0);

    const userId = session.user.id;

    // Find all overdue incomplete tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await prisma.dailyTask.findMany({
      where: {
        userId,
        scheduledDate: { lt: today },
        status: { not: "COMPLETED" },
      },
      select: {
        id: true,
        priority: true,
      },
    });

    if (overdueTasks.length === 0) {
      return NextResponse.json({
        success: true,
        rescheduledCount: 0,
        taskIds: [],
        message: "No overdue tasks to reschedule",
      });
    }

    // Reschedule all overdue tasks to target date
    // MIT tasks become PRIMARY (can't have multiple MITs on same day)
    const result = await prisma.$transaction(async (tx) => {
      const updated: string[] = [];

      for (const task of overdueTasks) {
        // MIT becomes PRIMARY when rescheduled
        const newPriority = task.priority === "MIT" ? "PRIMARY" : task.priority;

        await tx.dailyTask.update({
          where: { id: task.id },
          data: {
            scheduledDate: target,
            priority: newPriority,
          },
        });

        updated.push(task.id);
      }

      return { updated };
    });

    return NextResponse.json({
      success: true,
      rescheduledCount: result.updated.length,
      taskIds: result.updated,
      targetDate: formatLocalDate(target),
    });
  } catch (error) {
    console.error("Error rescheduling overdue tasks:", error);
    return NextResponse.json(
      { error: "Failed to reschedule overdue tasks" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/tasks/carry-over - Move tasks to tomorrow
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskIds } = body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: "taskIds array is required" },
        { status: 400 }
      );
    }

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const userId = session.user.id;

    // Update tasks to move them to tomorrow
    // MIT tasks become PRIMARY when carried over
    const result = await prisma.$transaction(async (tx) => {
      const updated: string[] = [];

      for (const taskId of taskIds) {
        // Verify task belongs to user and is incomplete
        const task = await tx.dailyTask.findFirst({
          where: {
            id: taskId,
            userId,
            status: { not: "COMPLETED" },
          },
        });

        if (!task) continue;

        // MIT becomes PRIMARY when carried over
        const newPriority = task.priority === "MIT" ? "PRIMARY" : task.priority;

        await tx.dailyTask.update({
          where: { id: taskId },
          data: {
            scheduledDate: tomorrow,
            priority: newPriority,
          },
        });

        updated.push(taskId);
      }

      return { updated };
    });

    return NextResponse.json({
      success: true,
      movedCount: result.updated.length,
      taskIds: result.updated,
    });
  } catch (error) {
    console.error("Error carrying over tasks:", error);
    return NextResponse.json(
      { error: "Failed to carry over tasks" },
      { status: 500 }
    );
  }
}

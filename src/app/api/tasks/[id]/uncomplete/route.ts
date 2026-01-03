import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/tasks/[id]/uncomplete - Uncomplete a task and reverse points
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check if task is completed
    if (existingTask.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Task is not completed" },
        { status: 400 }
      );
    }

    const pointsToRemove = existingTask.pointsEarned;

    // Use transaction to update task and user points atomically
    const [task, user] = await prisma.$transaction([
      // Update task back to pending
      prisma.dailyTask.update({
        where: { id },
        data: {
          status: "PENDING",
          completedAt: null,
          pointsEarned: 0,
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
      }),
      // Decrement user total points (ensure it doesn't go below 0)
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalPoints: {
            decrement: pointsToRemove,
          },
        },
      }),
    ]);

    // Ensure points don't go negative
    if (user.totalPoints < 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { totalPoints: 0 },
      });
    }

    // Decrement MIT streak if this was an MIT task
    if (existingTask.priority === "MIT") {
      const mitStreak = await prisma.streak.findFirst({
        where: {
          userId: session.user.id,
          type: "MIT_COMPLETION",
        },
      });

      if (mitStreak && mitStreak.currentCount > 0) {
        await prisma.streak.update({
          where: {
            userId_type: {
              userId: session.user.id,
              type: "MIT_COMPLETION",
            },
          },
          data: {
            currentCount: {
              decrement: 1,
            },
          },
        });
      }
    }

    return NextResponse.json({
      task,
      pointsRemoved: pointsToRemove,
    });
  } catch (error) {
    console.error("Error uncompleting task:", error);
    return NextResponse.json(
      { error: "Failed to uncomplete task" },
      { status: 500 }
    );
  }
}

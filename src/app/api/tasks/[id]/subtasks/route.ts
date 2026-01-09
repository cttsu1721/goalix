import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/tasks/[id]/subtasks - Get all subtasks for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;

    // Verify task belongs to user
    const task = await prisma.dailyTask.findFirst({
      where: { id: taskId, userId: session.user.id },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ subtasks });
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch subtasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/subtasks - Create a new subtask
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Verify task belongs to user
    const task = await prisma.dailyTask.findFirst({
      where: { id: taskId, userId: session.user.id },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get the highest sort order
    const lastSubtask = await prisma.subtask.findFirst({
      where: { taskId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const sortOrder = (lastSubtask?.sortOrder ?? -1) + 1;

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title: title.trim(),
        sortOrder,
      },
    });

    return NextResponse.json({ subtask }, { status: 201 });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id]/subtasks - Reorder subtasks
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { order } = body;

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { error: "Order must be an array of subtask IDs" },
        { status: 400 }
      );
    }

    // Verify task belongs to user
    const task = await prisma.dailyTask.findFirst({
      where: { id: taskId, userId: session.user.id },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      order.map((subtaskId: string, index: number) =>
        prisma.subtask.update({
          where: { id: subtaskId },
          data: { sortOrder: index },
        })
      )
    );

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ subtasks });
  } catch (error) {
    console.error("Error reordering subtasks:", error);
    return NextResponse.json(
      { error: "Failed to reorder subtasks" },
      { status: 500 }
    );
  }
}

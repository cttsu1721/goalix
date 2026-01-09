import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/tasks/[id]/subtasks/[subtaskId] - Update a subtask
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId, subtaskId } = await params;
    const body = await request.json();
    const { title, completed } = body;

    // Verify task belongs to user
    const task = await prisma.dailyTask.findFirst({
      where: { id: taskId, userId: session.user.id },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify subtask exists and belongs to the task
    const existingSubtask = await prisma.subtask.findFirst({
      where: { id: subtaskId, taskId },
    });

    if (!existingSubtask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    // Build update data
    const updateData: { title?: string; completed?: boolean } = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData,
    });

    return NextResponse.json({ subtask });
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/subtasks/[subtaskId] - Delete a subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId, subtaskId } = await params;

    // Verify task belongs to user
    const task = await prisma.dailyTask.findFirst({
      where: { id: taskId, userId: session.user.id },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify subtask exists and belongs to the task
    const existingSubtask = await prisma.subtask.findFirst({
      where: { id: subtaskId, taskId },
    });

    if (!existingSubtask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 }
    );
  }
}

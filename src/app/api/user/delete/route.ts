import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE /api/user/delete - Delete user account and all associated data
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user and all cascading data
    // Due to Prisma's cascade delete settings, this will automatically delete:
    // - Account records
    // - Session records
    // - Dreams (and cascading FiveYearGoals, OneYearGoals, MonthlyGoals, WeeklyGoals)
    // - Streaks
    // - EarnedBadges
    // - AIInteractions
    // - KaizenCheckins
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

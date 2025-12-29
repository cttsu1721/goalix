import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STREAK_TYPE_LABELS } from "@/types/gamification";
import type { StreakType } from "@prisma/client";

// GET /api/user/streaks - Get all user streaks with details
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const streaks = await prisma.streak.findMany({
      where: { userId: session.user.id },
      orderBy: { type: "asc" },
    });

    // All possible streak types
    const allStreakTypes: StreakType[] = [
      "DAILY_PLANNING",
      "MIT_COMPLETION",
      "WEEKLY_REVIEW",
      "MONTHLY_REVIEW",
      "KAIZEN_CHECKIN",
    ];

    // Build complete streak data with labels
    const streakData = allStreakTypes.map((type) => {
      const streak = streaks.find((s) => s.type === type);
      return {
        type,
        label: STREAK_TYPE_LABELS[type],
        currentCount: streak?.currentCount || 0,
        longestCount: streak?.longestCount || 0,
        lastActionAt: streak?.lastActionAt || null,
        isActive: isStreakActive(streak?.lastActionAt),
      };
    });

    // Calculate combined stats
    const totalCurrentStreak = streakData.reduce(
      (sum, s) => sum + s.currentCount,
      0
    );
    const longestIndividualStreak = Math.max(
      ...streakData.map((s) => s.longestCount),
      0
    );
    const activeStreaks = streakData.filter((s) => s.isActive).length;

    return NextResponse.json({
      streaks: streakData,
      summary: {
        totalCurrentStreak,
        longestIndividualStreak,
        activeStreaks,
        totalStreakTypes: allStreakTypes.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user streaks:", error);
    return NextResponse.json(
      { error: "Failed to fetch user streaks" },
      { status: 500 }
    );
  }
}

// Helper to check if streak is still active (action within last 24-48 hours)
function isStreakActive(lastActionAt: Date | null | undefined): boolean {
  if (!lastActionAt) return false;

  const now = new Date();
  const lastAction = new Date(lastActionAt);

  // Streak is active if last action was today or yesterday
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return lastAction >= yesterday;
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllBadgesWithStatus } from "@/lib/gamification/badges";

// GET /api/user/badges - Get all badges with earned status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const badges = await getAllBadgesWithStatus(session.user.id);

    // Calculate summary
    const earnedCount = badges.filter((b) => b.earned).length;
    const totalCount = badges.length;

    return NextResponse.json({
      badges,
      summary: {
        earned: earnedCount,
        total: totalCount,
        percentage: Math.round((earnedCount / totalCount) * 100),
      },
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

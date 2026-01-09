import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface SearchableGoal {
  id: string;
  title: string;
  type: "vision" | "three_year" | "one_year" | "monthly" | "weekly";
  category?: string;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch all goals in parallel - each goal type has userId directly
    const [visions, threeYearGoals, oneYearGoals, monthlyGoals, weeklyGoals] = await Promise.all([
      prisma.sevenYearVision.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true, title: true, category: true },
      }),
      prisma.threeYearGoal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true, title: true, category: true },
      }),
      prisma.oneYearGoal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true, title: true, category: true },
      }),
      prisma.monthlyGoal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true, title: true, category: true },
      }),
      prisma.weeklyGoal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true, title: true, category: true },
      }),
    ]);

    // Combine all goals with type labels
    const allGoals: SearchableGoal[] = [
      ...visions.map((g) => ({ id: g.id, title: g.title, type: "vision" as const, category: g.category || undefined })),
      ...threeYearGoals.map((g) => ({ id: g.id, title: g.title, type: "three_year" as const, category: g.category || undefined })),
      ...oneYearGoals.map((g) => ({ id: g.id, title: g.title, type: "one_year" as const, category: g.category || undefined })),
      ...monthlyGoals.map((g) => ({ id: g.id, title: g.title, type: "monthly" as const, category: g.category || undefined })),
      ...weeklyGoals.map((g) => ({ id: g.id, title: g.title, type: "weekly" as const, category: g.category || undefined })),
    ];

    return NextResponse.json({ success: true, data: allGoals });
  } catch (error) {
    console.error("Error fetching goals for search:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch goals" } },
      { status: 500 }
    );
  }
}

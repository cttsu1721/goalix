import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { GoalCategory } from "@prisma/client";

interface CategoryCount {
  category: GoalCategory;
  count: number;
}

/**
 * GET /api/user/category-stats
 * Returns the user's most-used goal categories with counts
 * Used for 6.3 - "Suggested" categories based on existing goals
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Count goals by category across all goal types
    // This aggregates from all goal levels to get overall category usage

    const [visionCounts, threeYearCounts, oneYearCounts, monthlyCounts, weeklyCounts] = await Promise.all([
      // 7-Year Visions
      prisma.sevenYearVision.groupBy({
        by: ["category"],
        where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
        _count: { category: true },
      }),
      // 3-Year Goals
      prisma.threeYearGoal.groupBy({
        by: ["category"],
        where: { sevenYearVision: { userId }, status: { in: ["ACTIVE", "COMPLETED"] } },
        _count: { category: true },
      }),
      // 1-Year Goals
      prisma.oneYearGoal.groupBy({
        by: ["category"],
        where: { threeYearGoal: { sevenYearVision: { userId } }, status: { in: ["ACTIVE", "COMPLETED"] } },
        _count: { category: true },
      }),
      // Monthly Goals
      prisma.monthlyGoal.groupBy({
        by: ["category"],
        where: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } }, status: { in: ["ACTIVE", "COMPLETED"] } },
        _count: { category: true },
      }),
      // Weekly Goals
      prisma.weeklyGoal.groupBy({
        by: ["category"],
        where: { monthlyGoal: { oneYearGoal: { threeYearGoal: { sevenYearVision: { userId } } } }, status: { in: ["ACTIVE", "COMPLETED"] } },
        _count: { category: true },
      }),
    ]);

    // Aggregate counts across all levels
    const categoryMap = new Map<GoalCategory, number>();

    const addCounts = (counts: Array<{ category: GoalCategory; _count: { category: number } }>) => {
      for (const item of counts) {
        const current = categoryMap.get(item.category) || 0;
        categoryMap.set(item.category, current + item._count.category);
      }
    };

    addCounts(visionCounts);
    addCounts(threeYearCounts);
    addCounts(oneYearCounts);
    addCounts(monthlyCounts);
    addCounts(weeklyCounts);

    // Convert to array and sort by count (descending)
    const categoryCounts: CategoryCount[] = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Get top 3 suggested categories (those with at least 1 goal)
    const suggested = categoryCounts
      .filter((c) => c.count > 0)
      .slice(0, 3)
      .map((c) => c.category);

    return NextResponse.json({
      suggested,
      categoryCounts,
      totalGoals: categoryCounts.reduce((sum, c) => sum + c.count, 0),
    });
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch category stats" },
      { status: 500 }
    );
  }
}

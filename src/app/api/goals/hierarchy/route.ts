import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { HierarchyNode, HierarchyResponse, MindMapLevel } from "@/types/mindmap";
import type { GoalCategory, GoalStatus } from "@prisma/client";

// GET /api/goals/hierarchy - Get full goal hierarchy for mind map
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dreamId = searchParams.get("dreamId");
    const includeTasks = searchParams.get("includeTasks") === "true";
    const statusFilter = searchParams.get("status") as GoalStatus | null;

    // Build where clause for dreams
    const dreamWhere: {
      userId: string;
      id?: string;
      status?: GoalStatus;
    } = {
      userId: session.user.id,
    };

    if (dreamId) {
      dreamWhere.id = dreamId;
    }

    if (statusFilter) {
      dreamWhere.status = statusFilter;
    }

    // Fetch all dreams with nested hierarchy
    const dreams = await prisma.dream.findMany({
      where: dreamWhere,
      orderBy: { createdAt: "desc" },
      include: {
        fiveYearGoals: {
          orderBy: { createdAt: "desc" },
          include: {
            oneYearGoals: {
              orderBy: { createdAt: "desc" },
              include: {
                monthlyGoals: {
                  orderBy: { targetMonth: "desc" },
                  include: {
                    weeklyGoals: {
                      orderBy: { weekStart: "desc" },
                      include: includeTasks
                        ? {
                            dailyTasks: {
                              orderBy: { scheduledDate: "desc" },
                              take: 10, // Limit tasks per weekly goal
                            },
                          }
                        : undefined,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform to HierarchyNode format
    let totalGoals = 0;
    let totalTasks = 0;

    const hierarchyDreams: HierarchyNode[] = dreams.map((dream) => {
      const fiveYearChildren: HierarchyNode[] = dream.fiveYearGoals.map((fy) => {
        const oneYearChildren: HierarchyNode[] = fy.oneYearGoals.map((oy) => {
          const monthlyChildren: HierarchyNode[] = oy.monthlyGoals.map((m) => {
            const weeklyChildren: HierarchyNode[] = m.weeklyGoals.map((w) => {
              // Type assertion for conditional include
              const weeklyWithTasks = w as typeof w & {
                dailyTasks?: { id: string; title: string; status: string }[];
              };
              const tasks = weeklyWithTasks.dailyTasks || [];

              const taskChildren: HierarchyNode[] = includeTasks
                ? tasks.map((t) => {
                    totalTasks++;
                    return {
                      id: t.id,
                      title: t.title,
                      level: "task" as MindMapLevel,
                      category: w.category,
                      status: t.status === "COMPLETED" ? "COMPLETED" as GoalStatus : "ACTIVE" as GoalStatus,
                      progress: t.status === "COMPLETED" ? 100 : 0,
                      childrenCount: 0,
                      completedCount: 0,
                      parentId: w.id,
                      children: [],
                    };
                  })
                : [];

              totalGoals++;
              const completedTasks = tasks.filter(
                (t) => t.status === "COMPLETED"
              ).length;

              return {
                id: w.id,
                title: w.title,
                level: "weekly" as MindMapLevel,
                category: w.category,
                status: w.status,
                progress: w.progress,
                childrenCount: tasks.length,
                completedCount: completedTasks,
                parentId: m.id,
                children: taskChildren,
              };
            });

            totalGoals++;
            const completedWeekly = m.weeklyGoals.filter(
              (g) => g.status === "COMPLETED"
            ).length;

            return {
              id: m.id,
              title: m.title,
              level: "monthly" as MindMapLevel,
              category: m.category,
              status: m.status,
              progress: m.progress,
              childrenCount: m.weeklyGoals.length,
              completedCount: completedWeekly,
              parentId: oy.id,
              children: weeklyChildren,
            };
          });

          totalGoals++;
          const completedMonthly = oy.monthlyGoals.filter(
            (g) => g.status === "COMPLETED"
          ).length;

          return {
            id: oy.id,
            title: oy.title,
            level: "oneYear" as MindMapLevel,
            category: oy.category,
            status: oy.status,
            progress: oy.progress,
            childrenCount: oy.monthlyGoals.length,
            completedCount: completedMonthly,
            parentId: fy.id,
            children: monthlyChildren,
          };
        });

        totalGoals++;
        const completedOneYear = fy.oneYearGoals.filter(
          (g) => g.status === "COMPLETED"
        ).length;

        return {
          id: fy.id,
          title: fy.title,
          level: "fiveYear" as MindMapLevel,
          category: fy.category,
          status: fy.status,
          progress: fy.progress,
          childrenCount: fy.oneYearGoals.length,
          completedCount: completedOneYear,
          parentId: dream.id,
          children: oneYearChildren,
        };
      });

      const completedFiveYear = dream.fiveYearGoals.filter(
        (g) => g.status === "COMPLETED"
      ).length;

      return {
        id: dream.id,
        title: dream.title,
        level: "dream" as MindMapLevel,
        category: dream.category,
        status: dream.status,
        progress: dream.progress,
        childrenCount: dream.fiveYearGoals.length,
        completedCount: completedFiveYear,
        parentId: null,
        children: fiveYearChildren,
      };
    });

    const response: HierarchyResponse = {
      dreams: hierarchyDreams,
      stats: {
        totalDreams: dreams.length,
        totalGoals,
        totalTasks,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching goal hierarchy:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal hierarchy" },
      { status: 500 }
    );
  }
}

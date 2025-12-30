import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { GoalCategory } from "@prisma/client";
import type { DreamBuilderResponse } from "@/lib/ai";

// Helper to get Monday of current week
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Helper to get first day of current month
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Helper to add years to a date
function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

// POST /api/goals/cascade - Create complete goal hierarchy in one transaction
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, hierarchy } = await request.json() as {
      category: GoalCategory;
      hierarchy: DreamBuilderResponse;
    };

    // Validate required fields
    if (!category || !hierarchy) {
      return NextResponse.json(
        { error: "Category and hierarchy are required" },
        { status: 400 }
      );
    }

    // Validate hierarchy structure
    if (!hierarchy.dream || !hierarchy.fiveYearGoals?.length) {
      return NextResponse.json(
        { error: "Invalid hierarchy structure" },
        { status: 400 }
      );
    }

    const now = new Date();
    const weekStart = getWeekStart();
    const monthStart = getMonthStart();
    const userId = session.user.id;

    // Create the entire hierarchy in a transaction using nested creates
    const dream = await prisma.dream.create({
      data: {
        userId,
        title: hierarchy.dream.title,
        description: hierarchy.dream.description,
        category,
        targetDate: addYears(now, 10),
        fiveYearGoals: {
          create: hierarchy.fiveYearGoals.map((fiveYear) => ({
            title: fiveYear.title,
            description: fiveYear.description,
            category,
            targetDate: addYears(now, 5),
            oneYearGoals: {
              create: fiveYear.oneYearGoals.map((oneYear) => ({
                title: oneYear.title,
                description: oneYear.description,
                category,
                targetDate: addYears(now, 1),
                monthlyGoals: {
                  create: {
                    title: oneYear.monthlyGoal.title,
                    description: oneYear.monthlyGoal.description,
                    category,
                    targetMonth: monthStart,
                    weeklyGoals: {
                      create: {
                        userId,
                        title: oneYear.monthlyGoal.weeklyGoal.title,
                        description: oneYear.monthlyGoal.weeklyGoal.description,
                        category,
                        weekStart,
                      },
                    },
                  },
                },
              })),
            },
          })),
        },
      },
      include: {
        fiveYearGoals: {
          include: {
            oneYearGoals: {
              include: {
                monthlyGoals: {
                  include: {
                    weeklyGoals: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Count total goals created
    let totalCreated = 1; // Dream
    dream.fiveYearGoals.forEach((fy) => {
      totalCreated += 1; // 5-year
      fy.oneYearGoals.forEach((oy) => {
        totalCreated += 1; // 1-year
        oy.monthlyGoals.forEach((mg) => {
          totalCreated += 1; // Monthly
          totalCreated += mg.weeklyGoals.length; // Weekly
        });
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        dreamId: dream.id,
        dreamTitle: dream.title,
        totalCreated,
        hierarchy: dream,
      },
    });
  } catch (error) {
    console.error("Error creating goal cascade:", error);
    return NextResponse.json(
      { error: "Failed to create goal hierarchy" },
      { status: 500 }
    );
  }
}

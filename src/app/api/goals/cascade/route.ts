import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { GoalCategory } from "@prisma/client";
import type { VisionBuilderResponse } from "@/lib/ai";

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
      hierarchy: VisionBuilderResponse;
    };

    // Validate required fields
    if (!category || !hierarchy) {
      return NextResponse.json(
        { error: "Category and hierarchy are required" },
        { status: 400 }
      );
    }

    // Validate hierarchy structure
    if (!hierarchy.vision || !hierarchy.threeYearGoals?.length) {
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
    const vision = await prisma.sevenYearVision.create({
      data: {
        userId,
        title: hierarchy.vision.title,
        description: hierarchy.vision.description,
        category,
        targetDate: addYears(now, 7),
        threeYearGoals: {
          create: hierarchy.threeYearGoals.map((threeYear) => ({
            user: { connect: { id: userId } },
            title: threeYear.title,
            description: threeYear.description,
            category,
            targetDate: addYears(now, 3),
            oneYearGoals: {
              create: threeYear.oneYearGoals.map((oneYear) => ({
                user: { connect: { id: userId } },
                title: oneYear.title,
                description: oneYear.description,
                category,
                targetDate: addYears(now, 1),
                monthlyGoals: {
                  create: {
                    user: { connect: { id: userId } },
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
        threeYearGoals: {
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
    let totalCreated = 1; // Vision
    vision.threeYearGoals.forEach((ty) => {
      totalCreated += 1; // 3-year
      ty.oneYearGoals.forEach((oy) => {
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
        visionId: vision.id,
        visionTitle: vision.title,
        totalCreated,
        hierarchy: vision,
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

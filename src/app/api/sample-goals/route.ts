import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSampleGoalsWithDates } from "@/lib/sample-goals";

/**
 * POST /api/sample-goals
 *
 * Generate sample goals for a new user to explore the app.
 * Creates complete goal cascades from 7-year visions down to daily tasks.
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user already has goals
    const existingVisions = await prisma.sevenYearVision.count({
      where: { userId },
    });

    if (existingVisions > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GOALS_EXIST",
            message: "You already have goals. Sample goals can only be created for new users."
          }
        },
        { status: 400 }
      );
    }

    // Get sample data with proper dates
    const sampleData = getSampleGoalsWithDates();

    // Create all goals in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdVisions = [];

      for (const vision of sampleData) {
        // Create 7-year vision
        const createdVision = await tx.sevenYearVision.create({
          data: {
            userId,
            title: vision.title,
            description: vision.description,
            category: vision.category,
            targetDate: vision.targetDate,
          },
        });

        // Create 3-year goals
        for (const threeYearGoal of vision.threeYearGoals) {
          const createdThreeYear = await tx.threeYearGoal.create({
            data: {
              userId,
              sevenYearVisionId: createdVision.id,
              title: threeYearGoal.title,
              description: threeYearGoal.description,
              category: vision.category,
              targetDate: threeYearGoal.targetDate,
            },
          });

          // Create 1-year goals
          for (const oneYearGoal of threeYearGoal.oneYearGoals) {
            const createdOneYear = await tx.oneYearGoal.create({
              data: {
                userId,
                threeYearGoalId: createdThreeYear.id,
                title: oneYearGoal.title,
                description: oneYearGoal.description,
                category: vision.category,
                targetDate: oneYearGoal.targetDate,
              },
            });

            // Create monthly goals
            for (const monthlyGoal of oneYearGoal.monthlyGoals) {
              const createdMonthly = await tx.monthlyGoal.create({
                data: {
                  userId,
                  oneYearGoalId: createdOneYear.id,
                  title: monthlyGoal.title,
                  description: monthlyGoal.description,
                  category: vision.category,
                  targetMonth: new Date(monthlyGoal.year, monthlyGoal.month - 1, 1),
                },
              });

              // Create weekly goals
              for (const weeklyGoal of monthlyGoal.weeklyGoals) {
                const createdWeekly = await tx.weeklyGoal.create({
                  data: {
                    userId,
                    monthlyGoalId: createdMonthly.id,
                    title: weeklyGoal.title,
                    description: weeklyGoal.description,
                    category: vision.category,
                    weekStart: weeklyGoal.weekStart,
                  },
                });

                // Create daily tasks
                for (const task of weeklyGoal.tasks) {
                  await tx.dailyTask.create({
                    data: {
                      userId,
                      weeklyGoalId: createdWeekly.id,
                      title: task.title,
                      priority: task.priority,
                      estimatedMinutes: task.estimatedMinutes,
                      description: task.notes,
                      scheduledDate: task.scheduledDate,
                    },
                  });
                }
              }
            }
          }
        }

        createdVisions.push(createdVision);
      }

      return {
        visionsCreated: createdVisions.length,
        visionIds: createdVisions.map(v => v.id),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        message: `Created ${result.visionsCreated} sample visions with full goal cascades`,
        ...result,
      },
    });
  } catch (error) {
    console.error("Error creating sample goals:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create sample goals" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sample-goals
 *
 * Delete all sample goals for the user.
 * This is useful if users want to start fresh after exploring.
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Delete all goals (cascade will handle children)
    const result = await prisma.$transaction(async (tx) => {
      // Delete daily tasks first (they have the deepest dependency)
      const tasksDeleted = await tx.dailyTask.deleteMany({
        where: { userId },
      });

      // Delete weekly goals
      await tx.weeklyGoal.deleteMany({
        where: { userId },
      });

      // Delete monthly goals
      await tx.monthlyGoal.deleteMany({
        where: { userId },
      });

      // Delete one year goals
      await tx.oneYearGoal.deleteMany({
        where: { userId },
      });

      // Delete three year goals
      await tx.threeYearGoal.deleteMany({
        where: { userId },
      });

      // Delete visions
      const visionsDeleted = await tx.sevenYearVision.deleteMany({
        where: { userId },
      });

      return {
        visionsDeleted: visionsDeleted.count,
        tasksDeleted: tasksDeleted.count,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "All goals have been deleted",
        ...result,
      },
    });
  } catch (error) {
    console.error("Error deleting sample goals:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete goals" } },
      { status: 500 }
    );
  }
}

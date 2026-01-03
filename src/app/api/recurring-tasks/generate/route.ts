import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatLocalDate, parseLocalDate } from "@/lib/utils";
import { TASK_PRIORITY_LIMITS } from "@/types/tasks";
import { TaskPriority } from "@prisma/client";

const DAY_MAP: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function shouldGenerateForDate(
  template: {
    pattern: string;
    daysOfWeek: string | null;
    customInterval: number | null;
    startDate: Date;
    lastGeneratedAt: Date | null;
  },
  date: Date
): boolean {
  const dayOfWeek = date.getDay();

  switch (template.pattern) {
    case "DAILY":
      return true;

    case "WEEKDAYS":
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case "WEEKLY":
      if (!template.daysOfWeek) return false;
      const days = JSON.parse(template.daysOfWeek) as string[];
      const currentDayName = DAY_NAMES[dayOfWeek];
      return days.includes(currentDayName);

    case "CUSTOM":
      if (!template.customInterval) return false;
      // Calculate days since start date
      const startDate = new Date(template.startDate);
      startDate.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % template.customInterval === 0;

    default:
      return false;
  }
}

// POST /api/recurring-tasks/generate - Generate tasks for a date (or date range)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, startDate, endDate } = body;

    // Determine date range to generate for
    let dates: Date[] = [];

    if (startDate && endDate) {
      // Generate for date range
      const start = parseLocalDate(startDate);
      const end = parseLocalDate(endDate);
      const current = new Date(start);

      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Generate for single date (default to today)
      const targetDate = date ? parseLocalDate(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      dates = [targetDate];
    }

    const userId = session.user.id;

    // Get all active recurring templates for the user
    const templates = await prisma.recurringTaskTemplate.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const createdTasks: string[] = [];
    const skippedTasks: Array<{ template: string; date: string; reason: string }> = [];

    for (const targetDate of dates) {
      const dateStr = formatLocalDate(targetDate);

      for (const template of templates) {
        // Check if template applies to this date
        const templateStartDate = new Date(template.startDate);
        templateStartDate.setHours(0, 0, 0, 0);

        if (targetDate < templateStartDate) {
          continue; // Date is before template start
        }

        if (template.endDate) {
          const templateEndDate = new Date(template.endDate);
          templateEndDate.setHours(0, 0, 0, 0);
          if (targetDate > templateEndDate) {
            continue; // Date is after template end
          }
        }

        // Check if should generate for this date based on pattern
        if (!shouldGenerateForDate(template, targetDate)) {
          continue;
        }

        // Check if task already exists for this template and date
        const existingTask = await prisma.dailyTask.findFirst({
          where: {
            userId,
            recurringTemplateId: template.id,
            scheduledDate: targetDate,
          },
        });

        if (existingTask) {
          skippedTasks.push({
            template: template.title,
            date: dateStr,
            reason: "Already exists",
          });
          continue;
        }

        // Check priority limits for the date
        const limit = TASK_PRIORITY_LIMITS[template.priority as TaskPriority];
        if (limit !== null) {
          const existingCount = await prisma.dailyTask.count({
            where: {
              userId,
              priority: template.priority,
              scheduledDate: targetDate,
            },
          });

          if (existingCount >= limit) {
            skippedTasks.push({
              template: template.title,
              date: dateStr,
              reason: `${template.priority} limit reached`,
            });
            continue;
          }
        }

        // Create the task
        const task = await prisma.dailyTask.create({
          data: {
            userId,
            recurringTemplateId: template.id,
            title: template.title,
            description: template.description,
            priority: template.priority,
            scheduledDate: targetDate,
            estimatedMinutes: template.estimatedMinutes,
            weeklyGoalId: template.weeklyGoalId,
          },
        });

        createdTasks.push(task.id);

        // Update lastGeneratedAt on template
        await prisma.recurringTaskTemplate.update({
          where: { id: template.id },
          data: { lastGeneratedAt: new Date() },
        });
      }
    }

    return NextResponse.json({
      success: true,
      createdCount: createdTasks.length,
      taskIds: createdTasks,
      skipped: skippedTasks,
    });
  } catch (error) {
    console.error("Error generating recurring tasks:", error);
    return NextResponse.json(
      { error: "Failed to generate recurring tasks" },
      { status: 500 }
    );
  }
}

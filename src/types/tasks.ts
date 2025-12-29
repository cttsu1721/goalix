import type { DailyTask, TaskPriority, TaskStatus } from "@prisma/client";

export type { DailyTask };

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  scheduledDate: Date;
  estimatedMinutes?: number;
  weeklyGoalId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  scheduledDate?: Date;
  estimatedMinutes?: number;
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  MIT: "Most Important Task",
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
};

export const TASK_PRIORITY_POINTS: Record<TaskPriority, number> = {
  MIT: 100,
  PRIMARY: 50,
  SECONDARY: 25,
};

export const TASK_PRIORITY_LIMITS: Record<TaskPriority, number | null> = {
  MIT: 1,
  PRIMARY: 3,
  SECONDARY: null,
};

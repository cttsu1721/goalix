import type {
  SevenYearVision,
  ThreeYearGoal,
  OneYearGoal,
  MonthlyGoal,
  WeeklyGoal,
  GoalCategory,
  GoalStatus,
} from "@prisma/client";

export type { SevenYearVision, ThreeYearGoal, OneYearGoal, MonthlyGoal, WeeklyGoal };

export type GoalLevel =
  | "sevenYear"
  | "threeYear"
  | "oneYear"
  | "monthly"
  | "weekly";

export type GoalType =
  | SevenYearVision
  | ThreeYearGoal
  | OneYearGoal
  | MonthlyGoal
  | WeeklyGoal;

export interface GoalWithChildren extends SevenYearVision {
  threeYearGoals: (ThreeYearGoal & {
    oneYearGoals: (OneYearGoal & {
      monthlyGoals: (MonthlyGoal & {
        weeklyGoals: WeeklyGoal[];
      })[];
    })[];
  })[];
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate?: Date;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  targetDate?: Date;
}

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  HEALTH: "Health",
  WEALTH: "Wealth",
  RELATIONSHIPS: "Relationships",
  CAREER: "Career",
  PERSONAL_GROWTH: "Personal Growth",
  LIFESTYLE: "Lifestyle",
  LIFE_MAINTENANCE: "Life Maintenance",
  OTHER: "Other",
};

/**
 * Categories that are exempt from goal alignment tracking.
 * Tasks in these categories are necessary but don't need to be tied to goals.
 */
export const ALIGNMENT_EXEMPT_CATEGORIES: GoalCategory[] = [
  "LIFE_MAINTENANCE",
];

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  ABANDONED: "Abandoned",
  ARCHIVED: "Archived",
};

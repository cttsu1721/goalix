import type {
  Dream,
  FiveYearGoal,
  OneYearGoal,
  MonthlyGoal,
  WeeklyGoal,
  GoalCategory,
  GoalStatus,
} from "@prisma/client";

export type { Dream, FiveYearGoal, OneYearGoal, MonthlyGoal, WeeklyGoal };

export type GoalLevel =
  | "dream"
  | "fiveYear"
  | "oneYear"
  | "monthly"
  | "weekly";

export type GoalType =
  | Dream
  | FiveYearGoal
  | OneYearGoal
  | MonthlyGoal
  | WeeklyGoal;

export interface GoalWithChildren extends Dream {
  fiveYearGoals: (FiveYearGoal & {
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
  OTHER: "Other",
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  ABANDONED: "Abandoned",
};

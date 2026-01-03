import type { Streak, Badge, EarnedBadge, StreakType } from "@prisma/client";

export type { Streak, Badge, EarnedBadge };

export interface UserStats {
  totalPoints: number;
  level: number;
  levelName: string;
  pointsToNextLevel: number;
  streakFreezes: number;
  streaks: Streak[];
  badges: (EarnedBadge & { badge: Badge })[];
}

export const STREAK_TYPE_LABELS: Record<StreakType, string> = {
  DAILY_PLANNING: "Daily Planning",
  MIT_COMPLETION: "MIT Completion",
  WEEKLY_REVIEW: "Weekly Review",
  MONTHLY_REVIEW: "Monthly Review",
  KAIZEN_CHECKIN: "Kaizen Check-in",
};

export interface Level {
  level: number;
  name: string;
  pointsRequired: number;
}

export const LEVELS: Level[] = [
  { level: 1, name: "Beginner", pointsRequired: 0 },
  { level: 2, name: "Starter", pointsRequired: 500 },
  { level: 3, name: "Achiever", pointsRequired: 2000 },
  { level: 4, name: "Go-Getter", pointsRequired: 5000 },
  { level: 5, name: "Performer", pointsRequired: 10000 },
  { level: 6, name: "Rockstar", pointsRequired: 25000 },
  { level: 7, name: "Champion", pointsRequired: 50000 },
  { level: 8, name: "Elite", pointsRequired: 75000 },
  { level: 9, name: "Master", pointsRequired: 100000 },
  { level: 10, name: "Fastlaner", pointsRequired: 150000 },
];

export const BADGE_DEFINITIONS = {
  // Streak badges
  first_blood: {
    slug: "first_blood",
    name: "First Blood",
    description: "Complete your first task ever",
    category: "streak",
  },
  on_fire_7: {
    slug: "on_fire_7",
    name: "On Fire",
    description: "Maintain a 7-day streak",
    category: "streak",
  },
  on_fire_30: {
    slug: "on_fire_30",
    name: "Unstoppable",
    description: "Maintain a 30-day streak",
    category: "streak",
  },
  rockstar: {
    slug: "rockstar",
    name: "Rockstar",
    description: "Maintain an 80+ day streak",
    category: "streak",
  },
  // Achievement badges
  century_club: {
    slug: "century_club",
    name: "Century Club",
    description: "Earn 100 points in one day",
    category: "achievement",
  },
  goal_getter: {
    slug: "goal_getter",
    name: "Goal Getter",
    description: "Complete your first goal",
    category: "achievement",
  },
  dream_starter: {
    slug: "dream_starter",
    name: "Vision Starter",
    description: "Create your first 7-year vision",
    category: "achievement",
  },
  planner_pro: {
    slug: "planner_pro",
    name: "Planner Pro",
    description: "Complete daily planning 7 days in a row",
    category: "achievement",
  },
  visionary: {
    slug: "visionary",
    name: "Visionary",
    description: "Have active goals at all 5 levels",
    category: "achievement",
  },
  // Category badges
  health_nut: {
    slug: "health_nut",
    name: "Health Nut",
    description: "Complete 10 health-related tasks",
    category: "category",
  },
  wealth_builder: {
    slug: "wealth_builder",
    name: "Wealth Builder",
    description: "Complete 10 wealth-related tasks",
    category: "category",
  },
  // Kaizen badges
  kaizen_starter: {
    slug: "kaizen_starter",
    name: "Kaizen Starter",
    description: "Complete your first Kaizen check-in",
    category: "kaizen",
  },
} as const;

export type BadgeSlug = keyof typeof BADGE_DEFINITIONS;

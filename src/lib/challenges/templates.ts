import type { ChallengeCategory } from "@prisma/client";
import type { ChallengeTemplate } from "@/types/challenges";

// Daily challenge templates
export const DAILY_CHALLENGES: ChallengeTemplate[] = [
  // Task completion challenges
  {
    slug: "complete_3_tasks",
    title: "Task Tackler",
    description: "Complete 3 tasks today",
    category: "TASKS",
    type: "DAILY",
    targetValue: 3,
    bonusXp: 30,
  },
  {
    slug: "complete_5_tasks",
    title: "Productivity Surge",
    description: "Complete 5 tasks today",
    category: "TASKS",
    type: "DAILY",
    targetValue: 5,
    bonusXp: 50,
    minLevel: 2,
  },
  {
    slug: "complete_all_primary",
    title: "Primary Focus",
    description: "Complete all your PRIMARY tasks today",
    category: "TASKS",
    type: "DAILY",
    targetValue: 1, // Special: checked differently
    bonusXp: 40,
  },
  // MIT challenges
  {
    slug: "complete_mit",
    title: "MIT Master",
    description: "Complete your Most Important Task",
    category: "MIT",
    type: "DAILY",
    targetValue: 1,
    bonusXp: 25,
  },
  {
    slug: "mit_before_noon",
    title: "Early Bird",
    description: "Complete your MIT before noon",
    category: "MIT",
    type: "DAILY",
    targetValue: 1,
    bonusXp: 35,
  },
  // Alignment challenges
  {
    slug: "all_tasks_aligned",
    title: "Goal Aligned",
    description: "Complete only goal-linked tasks today",
    category: "ALIGNMENT",
    type: "DAILY",
    targetValue: 1, // Special: 100% alignment
    bonusXp: 45,
  },
  // Kaizen challenges
  {
    slug: "kaizen_checkin",
    title: "Reflect & Grow",
    description: "Complete your Kaizen check-in",
    category: "KAIZEN",
    type: "DAILY",
    targetValue: 1,
    bonusXp: 20,
  },
  {
    slug: "kaizen_all_areas",
    title: "Balanced Day",
    description: "Check all 6 areas in your Kaizen reflection",
    category: "KAIZEN",
    type: "DAILY",
    targetValue: 6,
    bonusXp: 40,
  },
];

// Weekly challenge templates
export const WEEKLY_CHALLENGES: ChallengeTemplate[] = [
  // Task completion challenges
  {
    slug: "complete_20_tasks",
    title: "Weekly Warrior",
    description: "Complete 20 tasks this week",
    category: "TASKS",
    type: "WEEKLY",
    targetValue: 20,
    bonusXp: 150,
  },
  {
    slug: "complete_30_tasks",
    title: "Productivity Champion",
    description: "Complete 30 tasks this week",
    category: "TASKS",
    type: "WEEKLY",
    targetValue: 30,
    bonusXp: 250,
    minLevel: 3,
  },
  // MIT challenges
  {
    slug: "mit_5_days",
    title: "MIT Streak",
    description: "Complete your MIT 5 days this week",
    category: "MIT",
    type: "WEEKLY",
    targetValue: 5,
    bonusXp: 200,
  },
  {
    slug: "mit_7_days",
    title: "Perfect MIT Week",
    description: "Complete your MIT every day this week",
    category: "MIT",
    type: "WEEKLY",
    targetValue: 7,
    bonusXp: 350,
    minLevel: 2,
  },
  // Alignment challenges
  {
    slug: "weekly_alignment_80",
    title: "Focused Week",
    description: "Maintain 80%+ goal alignment this week",
    category: "ALIGNMENT",
    type: "WEEKLY",
    targetValue: 80,
    bonusXp: 175,
  },
  {
    slug: "weekly_alignment_100",
    title: "Laser Focus",
    description: "Achieve 100% goal alignment this week",
    category: "ALIGNMENT",
    type: "WEEKLY",
    targetValue: 100,
    bonusXp: 300,
    minLevel: 4,
  },
  // Kaizen challenges
  {
    slug: "kaizen_5_days",
    title: "Reflection Habit",
    description: "Complete Kaizen check-in 5 days this week",
    category: "KAIZEN",
    type: "WEEKLY",
    targetValue: 5,
    bonusXp: 125,
  },
  {
    slug: "kaizen_7_days",
    title: "Perfect Reflection",
    description: "Complete Kaizen check-in every day this week",
    category: "KAIZEN",
    type: "WEEKLY",
    targetValue: 7,
    bonusXp: 250,
  },
  // Goal challenges
  {
    slug: "complete_weekly_goal",
    title: "Goal Crusher",
    description: "Complete a weekly goal",
    category: "GOALS",
    type: "WEEKLY",
    targetValue: 1,
    bonusXp: 200,
  },
  {
    slug: "advance_3_goals",
    title: "Multi-Goal Progress",
    description: "Make progress on 3 different goals",
    category: "GOALS",
    type: "WEEKLY",
    targetValue: 3,
    bonusXp: 175,
  },
  // Streak challenges
  {
    slug: "maintain_streak",
    title: "Streak Guardian",
    description: "Maintain your current streak all week",
    category: "STREAKS",
    type: "WEEKLY",
    targetValue: 7,
    bonusXp: 150,
    minStreak: 3,
  },
];

// Get challenges appropriate for a user's level and streak
export function getAvailableChallenges(
  templates: ChallengeTemplate[],
  userLevel: number,
  currentStreak: number
): ChallengeTemplate[] {
  return templates.filter((template) => {
    if (template.minLevel && userLevel < template.minLevel) return false;
    if (template.minStreak && currentStreak < template.minStreak) return false;
    return true;
  });
}

// Select random challenges for a period
export function selectRandomChallenges(
  templates: ChallengeTemplate[],
  count: number
): ChallengeTemplate[] {
  // Ensure we have enough templates
  if (templates.length <= count) return [...templates];

  // Fisher-Yates shuffle and take first N
  const shuffled = [...templates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

// Get category icon (for UI)
export function getChallengeIcon(category: ChallengeCategory): string {
  switch (category) {
    case "TASKS":
      return "CheckSquare";
    case "MIT":
      return "Star";
    case "ALIGNMENT":
      return "Target";
    case "KAIZEN":
      return "Sparkles";
    case "STREAKS":
      return "Flame";
    case "GOALS":
      return "Flag";
    default:
      return "Trophy";
  }
}

// Get category color (for UI)
export function getChallengeColor(category: ChallengeCategory): string {
  switch (category) {
    case "TASKS":
      return "emerald";
    case "MIT":
      return "amber";
    case "ALIGNMENT":
      return "blue";
    case "KAIZEN":
      return "purple";
    case "STREAKS":
      return "orange";
    case "GOALS":
      return "indigo";
    default:
      return "slate";
  }
}

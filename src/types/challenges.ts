import { ChallengeType, ChallengeCategory } from "@prisma/client";

// Re-export enums for convenience
export type { ChallengeType, ChallengeCategory };

// Challenge template definition
export interface ChallengeTemplate {
  slug: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  type: ChallengeType;
  targetValue: number;
  bonusXp: number;
  // Optional conditions for when this challenge should be available
  minLevel?: number;
  minStreak?: number;
}

// Challenge with progress info
export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  type: ChallengeType;
  targetValue: number;
  currentValue: number;
  bonusXp: number;
  periodStart: Date;
  periodEnd: Date;
  isCompleted: boolean;
  completedAt: Date | null;
  xpClaimed: boolean;
  progress: number; // 0-100 percentage
}

// API response types
export interface ChallengesResponse {
  daily: Challenge[];
  weekly: Challenge[];
  completedToday: number;
  completedThisWeek: number;
  totalXpEarned: number;
}

export interface ClaimChallengeResponse {
  success: boolean;
  xpEarned: number;
  newTotalPoints: number;
  challenge: Challenge;
}

/**
 * Kaizen Daily Check-in Types
 *
 * Tracks daily self-improvement across 6 life areas.
 */

// Life areas for Kaizen check-in (maps to GoalCategory)
export const KAIZEN_AREAS = [
  'health',
  'relationships', 
  'wealth',
  'career',
  'personalGrowth',
  'lifestyle',
] as const;

export type KaizenArea = typeof KAIZEN_AREAS[number];

// Display configuration for each area
export const KAIZEN_AREA_CONFIG: Record<KaizenArea, {
  label: string;
  prompt: string;
  icon: string;
  colour: string;
}> = {
  health: {
    label: 'Health & Fitness',
    prompt: 'Did you improve your health today?',
    icon: '💪',
    colour: 'emerald',
  },
  relationships: {
    label: 'Relationships',
    prompt: 'Did you nurture a relationship today?',
    icon: '❤️',
    colour: 'rose',
  },
  wealth: {
    label: 'Wealth & Finances',
    prompt: 'Did you improve your financial position today?',
    icon: '💰',
    colour: 'amber',
  },
  career: {
    label: 'Career & Skills',
    prompt: 'Did you grow professionally today?',
    icon: '💼',
    colour: 'blue',
  },
  personalGrowth: {
    label: 'Personal Growth',
    prompt: 'Did you learn or grow personally today?',
    icon: '🧠',
    colour: 'violet',
  },
  lifestyle: {
    label: 'Lifestyle',
    prompt: 'Did you improve your quality of life today?',
    icon: '🌟',
    colour: 'cyan',
  },
};

// API request/response types
export interface KaizenCheckinInput {
  health: boolean;
  relationships: boolean;
  wealth: boolean;
  career: boolean;
  personalGrowth: boolean;
  lifestyle: boolean;
  notes?: string;
}

export interface KaizenCheckin extends KaizenCheckinInput {
  id: string;
  userId: string;
  checkinDate: Date;
  pointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KaizenCheckinResponse {
  checkin: KaizenCheckin;
  pointsEarned: number;
  streakCount: number;
  badgesEarned: string[];
  isBalancedDay: boolean;
}

// Stats types
export interface KaizenAreaStat {
  count: number;
  percentage: number;
}

export interface KaizenStats {
  totalCheckins: number;
  currentStreak: number;
  longestStreak: number;
  areaBreakdown: Record<KaizenArea, KaizenAreaStat>;
  last30Days: KaizenCheckin[];
  balancedDays: number; // Days where all 6 areas were checked
}

// Query params for GET /api/kaizen
export interface KaizenQueryParams {
  date?: string;      // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  limit?: number;     // Default 30
}

// Helper to count checked areas
export function countCheckedAreas(checkin: KaizenCheckinInput): number {
  return KAIZEN_AREAS.filter(area => checkin[area]).length;
}

// Check if all areas are checked (balanced day)
export function isBalancedDay(checkin: KaizenCheckinInput): boolean {
  return countCheckedAreas(checkin) === KAIZEN_AREAS.length;
}

// Points calculation
export const KAIZEN_POINTS = {
  BASE_CHECKIN: 10,
  BALANCED_DAY_BONUS: 25,
  STREAK_7_BONUS: 50,
  STREAK_30_BONUS: 200,
} as const;

export function calculateKaizenPoints(checkin: KaizenCheckinInput): number {
  let points = KAIZEN_POINTS.BASE_CHECKIN;
  
  if (isBalancedDay(checkin)) {
    points += KAIZEN_POINTS.BALANCED_DAY_BONUS;
  }
  
  return points;
}

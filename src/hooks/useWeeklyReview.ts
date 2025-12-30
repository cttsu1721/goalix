import { useQuery } from "@tanstack/react-query";

interface DayBreakdown {
  date: string;
  dayOfWeek: string;
  completed: number;
  total: number;
  mitCompleted: boolean;
  pointsEarned: number;
}

interface KaizenDailyCheckin {
  day: string;
  date: string;
  areasChecked: number;
  areas: string[];
}

interface WeeklyReviewData {
  weekRange: {
    start: string;
    end: string;
    weekOffset: number;
  };
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    completionRate: number;
    mitCompleted: number;
    mitTotal: number;
    mitCompletionRate: number;
    goalsProgressed: number;
    pointsEarned: number;
  };
  goalAlignment: {
    linkedCompleted: number;
    unlinkedCompleted: number;
    alignmentRate: number;
    totalLinked: number;
    totalUnlinked: number;
  };
  dailyBreakdown: DayBreakdown[];
  kaizen: {
    checkinsCompleted: number;
    checkinsTotal: number;
    balancedDays: number;
    areaBreakdown: {
      health: number;
      relationships: number;
      wealth: number;
      career: number;
      personalGrowth: number;
      lifestyle: number;
    };
    dailyCheckins: KaizenDailyCheckin[];
    strongestArea: { area: string; count: number } | null;
    weakestArea: { area: string; count: number } | null;
  };
}

export function useWeeklyReview(weekOffset = 0) {
  return useQuery<WeeklyReviewData>({
    queryKey: ["review", "weekly", weekOffset],
    queryFn: async () => {
      const res = await fetch(`/api/review/weekly?weekOffset=${weekOffset}`);
      if (!res.ok) {
        throw new Error("Failed to fetch weekly review data");
      }
      return res.json();
    },
  });
}

// Helper to format area names for display
export function formatAreaName(area: string): string {
  const areaNames: Record<string, string> = {
    health: "Health & Fitness",
    relationships: "Relationships",
    wealth: "Wealth & Finances",
    career: "Career & Skills",
    personalGrowth: "Personal Growth",
    lifestyle: "Lifestyle",
  };
  return areaNames[area] || area;
}

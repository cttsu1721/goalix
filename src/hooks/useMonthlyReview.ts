import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WeekBreakdown {
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksCompleted: number;
  totalTasks: number;
  mitCompleted: number;
  mitTotal: number;
  pointsEarned: number;
}

interface MonthlyGoal {
  id: string;
  title: string;
  status: string;
  progress: number;
}

interface MonthlyReviewData {
  monthRange: {
    start: string;
    end: string;
    monthOffset: number;
    monthName: string;
  };
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    completionRate: number;
    mitCompleted: number;
    mitTotal: number;
    mitCompletionRate: number;
    goalsCompleted: number;
    goalsTotal: number;
    pointsEarned: number;
    daysInMonth: number;
  };
  goalAlignment: {
    linkedCompleted: number;
    unlinkedCompleted: number;
    alignmentRate: number;
    totalLinked: number;
    totalUnlinked: number;
  };
  weeklyBreakdowns: WeekBreakdown[];
  goals: MonthlyGoal[];
  kaizen: {
    checkinsCompleted: number;
    checkinsTotal: number;
    completionRate: number;
    balancedDays: number;
    areaBreakdown: {
      health: number;
      relationships: number;
      wealth: number;
      career: number;
      personalGrowth: number;
      lifestyle: number;
    };
    strongestArea: { area: string; count: number } | null;
    weakestArea: { area: string; count: number } | null;
  };
  streaks: Array<{
    type: string;
    currentCount: number;
    longestCount: number;
  }>;
}

export function useMonthlyReview(monthOffset = 0) {
  return useQuery<MonthlyReviewData>({
    queryKey: ["review", "monthly", monthOffset],
    queryFn: async () => {
      const res = await fetch(`/api/review/monthly?monthOffset=${monthOffset}`);
      if (!res.ok) {
        throw new Error("Failed to fetch monthly review data");
      }
      return res.json();
    },
  });
}

// Submit monthly review mutation
interface SubmitMonthlyReviewInput {
  wins: string;
  learnings: string;
  nextMonthFocus: string;
  monthOffset?: number;
}

interface SubmitMonthlyReviewResponse {
  success: boolean;
  review: {
    id: string;
    wins: string | null;
    learnings: string | null;
    nextMonthFocus: string | null;
    tasksCompleted: number;
    totalTasks: number;
    mitCompleted: number;
    mitTotal: number;
    goalsCompleted: number;
    goalsTotal: number;
    pointsEarned: number;
    goalAlignmentRate: number;
    kaizenCheckinsCount: number;
    reviewPoints: number;
    createdAt: string;
    updatedAt: string;
  };
  isNewReview: boolean;
  pointsAwarded: number;
}

export function useSubmitMonthlyReview() {
  const queryClient = useQueryClient();

  return useMutation<SubmitMonthlyReviewResponse, Error, SubmitMonthlyReviewInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/review/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit monthly review");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate monthly review queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["review", "monthly", variables.monthOffset || 0] });
      queryClient.invalidateQueries({ queryKey: ["review", "history"] });
      // Also invalidate user stats as points may have changed
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

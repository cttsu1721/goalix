import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GoalSharpenResponse, TaskSuggestResponse } from "@/lib/ai/schemas";

interface AIUsage {
  remaining: number;
  limit: number;
  used: number;
}

interface SharpenResult {
  success: boolean;
  data: GoalSharpenResponse;
  usage: AIUsage;
}

interface SuggestResult {
  success: boolean;
  data: TaskSuggestResponse;
  usage: AIUsage;
}

// Fetch AI usage stats
export function useAIUsage() {
  return useQuery<AIUsage>({
    queryKey: ["ai", "usage"],
    queryFn: async () => {
      const res = await fetch("/api/ai/sharpen");
      if (!res.ok) {
        throw new Error("Failed to fetch AI usage");
      }
      return res.json();
    },
    // Refetch every minute to keep usage up to date
    refetchInterval: 60000,
  });
}

// Goal Sharpener mutation
export function useGoalSharpen() {
  const queryClient = useQueryClient();

  return useMutation<
    SharpenResult,
    Error,
    { title: string; context?: string; category?: string }
  >({
    mutationFn: async ({ title, context, category }) => {
      const res = await fetch("/api/ai/sharpen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, context, category }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to sharpen goal");
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Update AI usage in cache
      queryClient.setQueryData(["ai", "usage"], data.usage);
    },
  });
}

// Task Suggester mutation
export function useTaskSuggest() {
  const queryClient = useQueryClient();

  return useMutation<
    SuggestResult,
    Error,
    {
      weeklyGoalId?: string;
      weeklyGoalTitle?: string;
      weeklyGoalDescription?: string;
      parentGoalTitle?: string;
    }
  >({
    mutationFn: async ({
      weeklyGoalId,
      weeklyGoalTitle,
      weeklyGoalDescription,
      parentGoalTitle,
    }) => {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyGoalId,
          weeklyGoalTitle,
          weeklyGoalDescription,
          parentGoalTitle,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to suggest tasks");
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Update AI usage in cache
      queryClient.setQueryData(["ai", "usage"], data.usage);
    },
  });
}

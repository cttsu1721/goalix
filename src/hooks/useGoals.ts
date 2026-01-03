import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GoalCategory, GoalStatus } from "@prisma/client";
import type { GoalLevel } from "@/types/goals";

interface GoalsResponse {
  goals: unknown[];
  level: GoalLevel;
}

interface BreadcrumbItem {
  id: string;
  title: string;
  level: GoalLevel;
}

interface GoalResponse {
  goal: unknown;
  level: GoalLevel;
  breadcrumb: BreadcrumbItem[];
}

interface CreateGoalInput {
  level: GoalLevel;
  parentId?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate?: string;
  targetMonth?: string;
  weekStart?: string;
}

interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  targetDate?: string;
  targetMonth?: string;
  weekStart?: string;
  progress?: number;
}

// Fetch goals by level
export function useGoals(level: GoalLevel = "sevenYear", parentId?: string, status?: GoalStatus) {
  const params = new URLSearchParams({ level });
  if (parentId) params.set("parentId", parentId);
  if (status) params.set("status", status);

  return useQuery<GoalsResponse>({
    queryKey: ["goals", level, parentId, status],
    queryFn: async () => {
      const res = await fetch(`/api/goals?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch goals");
      }
      return res.json();
    },
  });
}

// Fetch visions (convenience hook)
export function useVisions(status?: GoalStatus) {
  return useGoals("sevenYear", undefined, status);
}

// Backward compatibility alias
export const useDreams = useVisions;

// Fetch a single goal by ID
export function useGoal(id: string) {
  return useQuery<GoalResponse>({
    queryKey: ["goal", id],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch goal");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

// Create a new goal
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create goal");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals", variables.level] });
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: ["goal", variables.parentId] });
      }
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });
}

// Update a goal
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateGoalInput & { id: string }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update goal");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", data.goal?.id] });
    },
  });
}

// Delete a goal
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete goal");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DailyTask, TaskPriority, TaskStatus } from "@prisma/client";
import { formatLocalDate } from "@/lib/utils";

interface TaskWithGoal extends DailyTask {
  weeklyGoal: {
    id: string;
    title: string;
    category: string;
    monthlyGoal?: {
      id: string;
      title: string;
      oneYearGoal?: {
        id: string;
        title: string;
      } | null;
    } | null;
  } | null;
}

interface TasksResponse {
  tasks: TaskWithGoal[];
  date: string;
  requestedDate: string;
  stats: {
    total: number;
    completed: number;
    mit: TaskWithGoal | null;
    primaryCount: number;
    secondaryCount: number;
    overdueCount: number;
  };
}

interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  scheduledDate: string;
  estimatedMinutes?: number;
  weeklyGoalId?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  scheduledDate?: string;
  estimatedMinutes?: number;
  weeklyGoalId?: string;
}

interface CompleteTaskResponse {
  task: TaskWithGoal;
  points: {
    earned: number;
    base: number;
    streakBonus: number;
    newTotal: number;
  };
  leveledUp: boolean;
  newLevel?: number;
}

interface UseTasksOptions {
  includeOverdue?: boolean;
}

// Fetch tasks for a specific date
export function useTasks(date?: string, options?: UseTasksOptions) {
  const dateParam = date || formatLocalDate();
  const includeOverdue = options?.includeOverdue ?? false;

  return useQuery<TasksResponse>({
    queryKey: ["tasks", dateParam, { includeOverdue }],
    queryFn: async () => {
      const params = new URLSearchParams({ date: dateParam });
      if (includeOverdue) {
        params.set("includeOverdue", "true");
      }
      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return res.json();
    },
  });
}

interface WeekTasksResponse {
  tasks: TaskWithGoal[];
  tasksByDate: Record<string, TaskWithGoal[]>;
  startDate: string;
  endDate: string;
  stats: {
    total: number;
    completed: number;
    mit: TaskWithGoal | null;
    primaryCount: number;
    secondaryCount: number;
  };
}

// Fetch tasks for a date range (week view)
export function useWeekTasks(startDate: string, endDate: string) {
  return useQuery<WeekTasksResponse>({
    queryKey: ["tasks", "week", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) {
        throw new Error("Failed to fetch week tasks");
      }
      return res.json();
    },
  });
}

// Fetch a single task
export function useTask(id: string) {
  return useQuery<{ task: TaskWithGoal }>({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch task");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create task");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all task queries (daily and weekly views)
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// Complete a task
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation<CompleteTaskResponse, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to complete task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["user", "streaks"] });
    },
  });
}

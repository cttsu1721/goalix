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
        threeYearGoal?: {
          id: string;
          title: string;
          sevenYearVision?: {
            id: string;
            title: string;
            description: string | null;
          } | null;
        } | null;
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
  badges?: Array<{
    slug: string;
    name: string;
    description: string;
  }>;
  streak?: {
    current: number;
    milestone?: number;
  };
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

// Update a task (with optimistic update)
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
    // Optimistic update: immediately apply changes
    onMutate: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["task", id] });

      const previousTasksData = queryClient.getQueriesData<TasksResponse | WeekTasksResponse>({ queryKey: ["tasks"] });
      const previousTaskData = queryClient.getQueryData<{ task: TaskWithGoal }>(["task", id]);

      // Prepare updates with proper type conversions
      const updates: Partial<TaskWithGoal> = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.status !== undefined) updates.status = input.status;
      if (input.estimatedMinutes !== undefined) updates.estimatedMinutes = input.estimatedMinutes;
      if (input.weeklyGoalId !== undefined) updates.weeklyGoalId = input.weeklyGoalId;
      // Convert scheduledDate string to Date if provided
      if (input.scheduledDate !== undefined) {
        updates.scheduledDate = new Date(input.scheduledDate);
      }

      // Update all task list queries
      queryClient.setQueriesData<TasksResponse | WeekTasksResponse>(
        { queryKey: ["tasks"] },
        (old) => {
          if (!old) return old;

          // Handle daily tasks response
          if ("tasks" in old && !("tasksByDate" in old)) {
            const dailyData = old as TasksResponse;
            return {
              ...dailyData,
              tasks: dailyData.tasks.map((task) =>
                task.id === id ? { ...task, ...updates } : task
              ),
            };
          }

          // Handle week tasks response
          if ("tasksByDate" in old) {
            const weekData = old as WeekTasksResponse;
            return {
              ...weekData,
              tasks: weekData.tasks.map((task) =>
                task.id === id ? { ...task, ...updates } : task
              ),
              tasksByDate: Object.fromEntries(
                Object.entries(weekData.tasksByDate).map(([date, tasks]) => [
                  date,
                  tasks.map((task) =>
                    task.id === id ? { ...task, ...updates } : task
                  ),
                ])
              ),
            };
          }

          return old;
        }
      );

      // Update single task query if it exists
      if (previousTaskData) {
        queryClient.setQueryData<{ task: TaskWithGoal }>(["task", id], (old) => {
          if (!old) return old;
          return {
            ...old,
            task: { ...old.task, ...updates },
          };
        });
      }

      return { previousTasksData, previousTaskData };
    },
    onError: (_err, variables, context) => {
      if (context?.previousTasksData) {
        context.previousTasksData.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      if (context?.previousTaskData) {
        queryClient.setQueryData(["task", variables.id], context.previousTaskData);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
    },
  });
}

// Delete a task (with optimistic update)
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
    // Optimistic update: immediately remove task from list
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousData = queryClient.getQueriesData<TasksResponse | WeekTasksResponse>({ queryKey: ["tasks"] });

      queryClient.setQueriesData<TasksResponse | WeekTasksResponse>(
        { queryKey: ["tasks"] },
        (old) => {
          if (!old) return old;

          // Handle daily tasks response
          if ("tasks" in old && !("tasksByDate" in old)) {
            const dailyData = old as TasksResponse;
            const deletedTask = dailyData.tasks.find((t) => t.id === taskId);
            const wasCompleted = deletedTask?.status === "COMPLETED";
            return {
              ...dailyData,
              tasks: dailyData.tasks.filter((task) => task.id !== taskId),
              stats: {
                ...dailyData.stats,
                total: Math.max(0, dailyData.stats.total - 1),
                completed: wasCompleted ? Math.max(0, dailyData.stats.completed - 1) : dailyData.stats.completed,
              },
            };
          }

          // Handle week tasks response
          if ("tasksByDate" in old) {
            const weekData = old as WeekTasksResponse;
            const deletedTask = weekData.tasks.find((t) => t.id === taskId);
            const wasCompleted = deletedTask?.status === "COMPLETED";
            return {
              ...weekData,
              tasks: weekData.tasks.filter((task) => task.id !== taskId),
              tasksByDate: Object.fromEntries(
                Object.entries(weekData.tasksByDate).map(([date, tasks]) => [
                  date,
                  tasks.filter((task) => task.id !== taskId),
                ])
              ),
              stats: {
                ...weekData.stats,
                total: Math.max(0, weekData.stats.total - 1),
                completed: wasCompleted ? Math.max(0, weekData.stats.completed - 1) : weekData.stats.completed,
              },
            };
          }

          return old;
        }
      );

      return { previousData };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// Context type for optimistic updates
type TaskMutationContext = {
  previousData: [readonly unknown[], TasksResponse | WeekTasksResponse | undefined][];
};

// Complete a task (with optimistic update)
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation<CompleteTaskResponse, Error, string, TaskMutationContext>({
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
    // Optimistic update: immediately show task as completed
    onMutate: async (taskId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value for all task queries
      const previousData = queryClient.getQueriesData<TasksResponse | WeekTasksResponse>({ queryKey: ["tasks"] });

      // Optimistically update all matching queries
      queryClient.setQueriesData<TasksResponse | WeekTasksResponse>(
        { queryKey: ["tasks"] },
        (old) => {
          if (!old) return old;

          // Handle daily tasks response
          if ("tasks" in old && !("tasksByDate" in old)) {
            const dailyData = old as TasksResponse;
            return {
              ...dailyData,
              tasks: dailyData.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: "COMPLETED" as TaskStatus, completedAt: new Date() }
                  : task
              ),
              stats: {
                ...dailyData.stats,
                completed: dailyData.stats.completed + 1,
              },
            };
          }

          // Handle week tasks response
          if ("tasksByDate" in old) {
            const weekData = old as WeekTasksResponse;
            return {
              ...weekData,
              tasks: weekData.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: "COMPLETED" as TaskStatus, completedAt: new Date() }
                  : task
              ),
              tasksByDate: Object.fromEntries(
                Object.entries(weekData.tasksByDate).map(([date, tasks]) => [
                  date,
                  tasks.map((task) =>
                    task.id === taskId
                      ? { ...task, status: "COMPLETED" as TaskStatus, completedAt: new Date() }
                      : task
                  ),
                ])
              ),
              stats: {
                ...weekData.stats,
                completed: weekData.stats.completed + 1,
              },
            };
          }

          return old;
        }
      );

      // Return context for rollback
      return { previousData };
    },
    onError: (_err, _taskId, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },
    onSettled: () => {
      // Always refetch after success or error to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["user", "streaks"] });
    },
  });
}

interface UncompleteTaskResponse {
  task: TaskWithGoal;
  pointsRemoved: number;
}

// Uncomplete a task (undo completion, with optimistic update)
export function useUncompleteTask() {
  const queryClient = useQueryClient();

  return useMutation<UncompleteTaskResponse, Error, string, TaskMutationContext>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}/uncomplete`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to uncomplete task");
      }
      return res.json();
    },
    // Optimistic update: immediately show task as pending
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousData = queryClient.getQueriesData<TasksResponse | WeekTasksResponse>({ queryKey: ["tasks"] });

      queryClient.setQueriesData<TasksResponse | WeekTasksResponse>(
        { queryKey: ["tasks"] },
        (old) => {
          if (!old) return old;

          // Handle daily tasks response
          if ("tasks" in old && !("tasksByDate" in old)) {
            const dailyData = old as TasksResponse;
            return {
              ...dailyData,
              tasks: dailyData.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: "PENDING" as TaskStatus, completedAt: null }
                  : task
              ),
              stats: {
                ...dailyData.stats,
                completed: Math.max(0, dailyData.stats.completed - 1),
              },
            };
          }

          // Handle week tasks response
          if ("tasksByDate" in old) {
            const weekData = old as WeekTasksResponse;
            return {
              ...weekData,
              tasks: weekData.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: "PENDING" as TaskStatus, completedAt: null }
                  : task
              ),
              tasksByDate: Object.fromEntries(
                Object.entries(weekData.tasksByDate).map(([date, tasks]) => [
                  date,
                  tasks.map((task) =>
                    task.id === taskId
                      ? { ...task, status: "PENDING" as TaskStatus, completedAt: null }
                      : task
                  ),
                ])
              ),
              stats: {
                ...weekData.stats,
                completed: Math.max(0, weekData.stats.completed - 1),
              },
            };
          }

          return old;
        }
      );

      return { previousData };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["user", "streaks"] });
    },
  });
}

interface CarryOverResponse {
  success: boolean;
  movedCount: number;
  taskIds: string[];
}

// Carry over tasks to tomorrow
export function useCarryOverTasks() {
  const queryClient = useQueryClient();

  return useMutation<CarryOverResponse, Error, string[]>({
    mutationFn: async (taskIds: string[]) => {
      const res = await fetch("/api/tasks/carry-over", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to carry over tasks");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

interface RescheduleOverdueResponse {
  success: boolean;
  rescheduledCount: number;
  taskIds: string[];
  targetDate: string;
}

// Reschedule all overdue tasks to today (or a specific date)
export function useRescheduleOverdue() {
  const queryClient = useQueryClient();

  return useMutation<RescheduleOverdueResponse, Error, string | undefined>({
    mutationFn: async (targetDate?: string) => {
      const res = await fetch("/api/tasks/reschedule-overdue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reschedule overdue tasks");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

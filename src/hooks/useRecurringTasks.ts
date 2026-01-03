import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecurrencePattern, TaskPriority } from "@prisma/client";

interface RecurringTemplateWithGoal {
  id: string;
  userId: string;
  weeklyGoalId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  estimatedMinutes: number | null;
  pattern: RecurrencePattern;
  daysOfWeek: string | null; // JSON stringified array
  customInterval: number | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  lastGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
  weeklyGoal: {
    id: string;
    title: string;
    category: string;
  } | null;
}

interface RecurringTemplatesResponse {
  templates: RecurringTemplateWithGoal[];
}

interface CreateRecurringTemplateInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  estimatedMinutes?: number;
  weeklyGoalId?: string;
  pattern: RecurrencePattern;
  daysOfWeek?: string[];
  customInterval?: number;
  startDate: string;
  endDate?: string;
}

interface UpdateRecurringTemplateInput {
  id: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  estimatedMinutes?: number;
  weeklyGoalId?: string | null;
  pattern?: RecurrencePattern;
  daysOfWeek?: string[];
  customInterval?: number;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

interface GenerateRecurringTasksInput {
  date?: string;
  startDate?: string;
  endDate?: string;
}

interface GenerateRecurringTasksResponse {
  success: boolean;
  createdCount: number;
  taskIds: string[];
  skipped: Array<{ template: string; date: string; reason: string }>;
}

// Fetch all recurring task templates
export function useRecurringTemplates(activeOnly = true) {
  return useQuery<RecurringTemplatesResponse>({
    queryKey: ["recurring-templates", { activeOnly }],
    queryFn: async () => {
      const res = await fetch(`/api/recurring-tasks?activeOnly=${activeOnly}`);
      if (!res.ok) {
        throw new Error("Failed to fetch recurring templates");
      }
      return res.json();
    },
  });
}

// Fetch a single recurring template
export function useRecurringTemplate(id: string) {
  return useQuery<{ template: RecurringTemplateWithGoal }>({
    queryKey: ["recurring-template", id],
    queryFn: async () => {
      const res = await fetch(`/api/recurring-tasks/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch recurring template");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

// Create a new recurring template
export function useCreateRecurringTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRecurringTemplateInput) => {
      const res = await fetch("/api/recurring-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create recurring template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
}

// Update a recurring template
export function useUpdateRecurringTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateRecurringTemplateInput) => {
      const res = await fetch(`/api/recurring-tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update recurring template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-template"] });
    },
  });
}

// Delete a recurring template
export function useDeleteRecurringTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recurring-tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete recurring template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
}

// Generate tasks from recurring templates
export function useGenerateRecurringTasks() {
  const queryClient = useQueryClient();

  return useMutation<GenerateRecurringTasksResponse, Error, GenerateRecurringTasksInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/recurring-tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate recurring tasks");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// Helper function to format recurrence pattern for display
export function formatRecurrencePattern(
  pattern: RecurrencePattern,
  daysOfWeek: string | null,
  customInterval: number | null
): string {
  switch (pattern) {
    case "DAILY":
      return "Every day";
    case "WEEKDAYS":
      return "Weekdays (Mon-Fri)";
    case "WEEKLY":
      if (daysOfWeek) {
        try {
          const days = JSON.parse(daysOfWeek) as string[];
          return `Weekly: ${days.join(", ")}`;
        } catch {
          return "Weekly";
        }
      }
      return "Weekly";
    case "CUSTOM":
      if (customInterval) {
        return customInterval === 1
          ? "Every day"
          : `Every ${customInterval} days`;
      }
      return "Custom";
    default:
      return pattern;
  }
}

// Export types
export type { RecurringTemplateWithGoal, CreateRecurringTemplateInput, UpdateRecurringTemplateInput };

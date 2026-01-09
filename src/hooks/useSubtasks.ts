"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Fetch subtasks for a task
export function useSubtasks(taskId: string | null) {
  return useQuery<{ subtasks: Subtask[] }>({
    queryKey: ["subtasks", taskId],
    queryFn: async () => {
      if (!taskId) return { subtasks: [] };
      const res = await fetch(`/api/tasks/${taskId}/subtasks`);
      if (!res.ok) {
        throw new Error("Failed to fetch subtasks");
      }
      return res.json();
    },
    enabled: !!taskId,
  });
}

// Create a subtask
export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create subtask");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", variables.taskId] });
    },
  });
}

// Update a subtask (with optimistic update)
export function useUpdateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      subtaskId,
      title,
      completed,
    }: {
      taskId: string;
      subtaskId: string;
      title?: string;
      completed?: boolean;
    }) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update subtask");
      }
      return res.json();
    },
    // Optimistic update: immediately show changes
    onMutate: async (variables) => {
      const { taskId, subtaskId, title, completed } = variables;
      await queryClient.cancelQueries({ queryKey: ["subtasks", taskId] });

      const previousData = queryClient.getQueryData<{ subtasks: Subtask[] }>(["subtasks", taskId]);

      queryClient.setQueryData<{ subtasks: Subtask[] }>(["subtasks", taskId], (old) => {
        if (!old) return old;
        return {
          ...old,
          subtasks: old.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? {
                  ...subtask,
                  ...(title !== undefined && { title }),
                  ...(completed !== undefined && { completed }),
                }
              : subtask
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["subtasks", variables.taskId], context.previousData);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", variables.taskId] });
    },
  });
}

// Delete a subtask (with optimistic update)
export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete subtask");
      }
      return res.json();
    },
    // Optimistic update: immediately remove from list
    onMutate: async (variables) => {
      const { taskId, subtaskId } = variables;
      await queryClient.cancelQueries({ queryKey: ["subtasks", taskId] });

      const previousData = queryClient.getQueryData<{ subtasks: Subtask[] }>(["subtasks", taskId]);

      queryClient.setQueryData<{ subtasks: Subtask[] }>(["subtasks", taskId], (old) => {
        if (!old) return old;
        return {
          ...old,
          subtasks: old.subtasks.filter((subtask) => subtask.id !== subtaskId),
        };
      });

      return { previousData };
    },
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["subtasks", variables.taskId], context.previousData);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", variables.taskId] });
    },
  });
}

// Reorder subtasks
export function useReorderSubtasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, order }: { taskId: string; order: string[] }) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reorder subtasks");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", variables.taskId] });
    },
  });
}

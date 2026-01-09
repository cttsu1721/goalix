"use client";

import { useCallback, useState } from "react";
import { useQueryClient, QueryKey } from "@tanstack/react-query";

interface OptimisticUpdateOptions<TData, TError = Error> {
  queryKey: QueryKey;
  mutationFn: () => Promise<TData>;
  optimisticUpdate: (previousData: TData | undefined) => TData | undefined;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError, previousData: TData | undefined) => void;
  rollbackOnError?: boolean;
}

/**
 * Hook for optimistic UI updates with automatic rollback on error.
 *
 * @example
 * const { execute, isLoading, error } = useOptimisticUpdate({
 *   queryKey: ['tasks'],
 *   mutationFn: () => completeTask(taskId),
 *   optimisticUpdate: (tasks) =>
 *     tasks?.map(t => t.id === taskId ? { ...t, completed: true } : t),
 * });
 */
export function useOptimisticUpdate<TData, TError = Error>({
  queryKey,
  mutationFn,
  optimisticUpdate,
  onSuccess,
  onError,
  rollbackOnError = true,
}: OptimisticUpdateOptions<TData, TError>) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Snapshot previous value
    const previousData = queryClient.getQueryData<TData>(queryKey);

    // Optimistically update the cache
    queryClient.setQueryData<TData>(queryKey, (old) => optimisticUpdate(old));

    try {
      const result = await mutationFn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const typedError = err as TError;
      setError(typedError);

      // Rollback to previous value on error
      if (rollbackOnError) {
        queryClient.setQueryData(queryKey, previousData);
      }

      onError?.(typedError, previousData);
      throw err;
    } finally {
      setIsLoading(false);
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey });
    }
  }, [
    queryKey,
    mutationFn,
    optimisticUpdate,
    onSuccess,
    onError,
    rollbackOnError,
    queryClient,
  ]);

  return { execute, isLoading, error };
}

/**
 * Hook for optimistic task completion with undo support.
 */
export function useOptimisticTaskComplete(
  taskId: string,
  options?: {
    onComplete?: () => void;
    onUncomplete?: () => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const complete = useCallback(async () => {
    setIsOptimistic(true);

    // Optimistically update all task-related queries
    const taskQueries = queryClient.getQueriesData({ queryKey: ["tasks"] });

    taskQueries.forEach(([key, data]) => {
      if (Array.isArray(data)) {
        queryClient.setQueryData(
          key,
          data.map((task: { id: string; completed: boolean }) =>
            task.id === taskId ? { ...task, completed: true } : task
          )
        );
      }
    });

    try {
      await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" });
      options?.onComplete?.();
    } catch (error) {
      // Rollback
      taskQueries.forEach(([key, data]) => {
        if (Array.isArray(data)) {
          queryClient.setQueryData(
            key,
            data.map((task: { id: string; completed: boolean }) =>
              task.id === taskId ? { ...task, completed: false } : task
            )
          );
        }
      });
      options?.onError?.(error as Error);
    } finally {
      setIsOptimistic(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  }, [taskId, queryClient, options]);

  const uncomplete = useCallback(async () => {
    setIsOptimistic(true);

    // Optimistically update
    const taskQueries = queryClient.getQueriesData({ queryKey: ["tasks"] });

    taskQueries.forEach(([key, data]) => {
      if (Array.isArray(data)) {
        queryClient.setQueryData(
          key,
          data.map((task: { id: string; completed: boolean }) =>
            task.id === taskId ? { ...task, completed: false } : task
          )
        );
      }
    });

    try {
      await fetch(`/api/tasks/${taskId}/uncomplete`, { method: "POST" });
      options?.onUncomplete?.();
    } catch (error) {
      // Rollback
      taskQueries.forEach(([key, data]) => {
        if (Array.isArray(data)) {
          queryClient.setQueryData(
            key,
            data.map((task: { id: string; completed: boolean }) =>
              task.id === taskId ? { ...task, completed: true } : task
            )
          );
        }
      });
      options?.onError?.(error as Error);
    } finally {
      setIsOptimistic(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  }, [taskId, queryClient, options]);

  return { complete, uncomplete, isOptimistic };
}

/**
 * Hook for optimistic list operations (add, remove, update)
 */
export function useOptimisticList<TItem extends { id: string }>(
  queryKey: QueryKey
) {
  const queryClient = useQueryClient();

  const addItem = useCallback(
    (item: TItem, mutationFn: () => Promise<TItem>) => {
      const previousData = queryClient.getQueryData<TItem[]>(queryKey);

      // Optimistically add
      queryClient.setQueryData<TItem[]>(queryKey, (old) =>
        old ? [...old, item] : [item]
      );

      mutationFn()
        .then((result) => {
          // Update with real ID from server
          queryClient.setQueryData<TItem[]>(queryKey, (old) =>
            old?.map((i) => (i.id === item.id ? result : i))
          );
        })
        .catch(() => {
          // Rollback
          queryClient.setQueryData(queryKey, previousData);
        })
        .finally(() => {
          queryClient.invalidateQueries({ queryKey });
        });
    },
    [queryKey, queryClient]
  );

  const removeItem = useCallback(
    (itemId: string, mutationFn: () => Promise<void>) => {
      const previousData = queryClient.getQueryData<TItem[]>(queryKey);

      // Optimistically remove
      queryClient.setQueryData<TItem[]>(queryKey, (old) =>
        old?.filter((i) => i.id !== itemId)
      );

      mutationFn()
        .catch(() => {
          // Rollback
          queryClient.setQueryData(queryKey, previousData);
        })
        .finally(() => {
          queryClient.invalidateQueries({ queryKey });
        });
    },
    [queryKey, queryClient]
  );

  const updateItem = useCallback(
    (itemId: string, updates: Partial<TItem>, mutationFn: () => Promise<TItem>) => {
      const previousData = queryClient.getQueryData<TItem[]>(queryKey);

      // Optimistically update
      queryClient.setQueryData<TItem[]>(queryKey, (old) =>
        old?.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
      );

      mutationFn()
        .catch(() => {
          // Rollback
          queryClient.setQueryData(queryKey, previousData);
        })
        .finally(() => {
          queryClient.invalidateQueries({ queryKey });
        });
    },
    [queryKey, queryClient]
  );

  return { addItem, removeItem, updateItem };
}

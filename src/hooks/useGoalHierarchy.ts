import { useQuery } from "@tanstack/react-query";
import type {
  HierarchyResponse,
  UseGoalHierarchyOptions,
} from "@/types/mindmap";

export function useGoalHierarchy(options: UseGoalHierarchyOptions = {}) {
  const { dreamId, includeTasks = false, status } = options;

  const params = new URLSearchParams();
  if (dreamId) params.set("dreamId", dreamId);
  if (includeTasks) params.set("includeTasks", "true");
  if (status) params.set("status", status);

  const queryString = params.toString();
  const url = `/api/goals/hierarchy${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["goalHierarchy", dreamId, includeTasks, status],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch goal hierarchy");
      }
      return res.json() as Promise<HierarchyResponse>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

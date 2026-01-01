import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { KaizenCheckin, KaizenCheckinInput } from "@/types/kaizen";
import { formatLocalDate } from "@/lib/utils";

interface KaizenCheckinResponse {
  checkin: KaizenCheckin;
  pointsEarned: number;
  pointsDelta: number;
  isBalancedDay: boolean;
  streak: {
    currentCount: number;
    longestCount: number;
  };
}

interface KaizenListResponse {
  checkins: KaizenCheckin[];
  streak: {
    currentCount: number;
    longestCount: number;
  };
}

// Fetch Kaizen checkin for a specific date
export function useKaizenCheckin(date?: string) {
  const dateParam = date || formatLocalDate();

  return useQuery<{ checkin: KaizenCheckin | null }>({
    queryKey: ["kaizen", dateParam],
    queryFn: async () => {
      const res = await fetch(`/api/kaizen?date=${dateParam}`);
      if (!res.ok) {
        throw new Error("Failed to fetch kaizen checkin");
      }
      return res.json();
    },
  });
}

// Fetch Kaizen checkins for a date range
export function useKaizenCheckins(startDate?: string, endDate?: string, limit = 30) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  params.set("limit", limit.toString());

  return useQuery<KaizenListResponse>({
    queryKey: ["kaizen", "list", startDate, endDate, limit],
    queryFn: async () => {
      const res = await fetch(`/api/kaizen?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch kaizen checkins");
      }
      return res.json();
    },
  });
}

// Create or update Kaizen checkin
export function useSaveKaizenCheckin() {
  const queryClient = useQueryClient();

  return useMutation<KaizenCheckinResponse, Error, KaizenCheckinInput & { date?: string }>({
    mutationFn: async (input) => {
      const res = await fetch("/api/kaizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save kaizen checkin");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      const date = variables.date || formatLocalDate();
      queryClient.invalidateQueries({ queryKey: ["kaizen", date] });
      queryClient.invalidateQueries({ queryKey: ["kaizen", "list"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["user", "streaks"] });
    },
  });
}

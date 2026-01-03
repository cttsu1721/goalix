import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Streak, Badge, EarnedBadge, StreakType } from "@prisma/client";

interface UserStats {
  totalPoints: number;
  level: number;
  levelName: string;
  pointsToNextLevel: number;
  levelProgress: number;
  streakFreezes: number;
  streaks: Streak[];
  badges: (EarnedBadge & { badge: Badge })[];
  todayStats: {
    total: number;
    completed: number;
    mitCompleted: boolean;
    pointsEarned: number;
  };
  weeklyStats: {
    tasksCompleted: number;
    pointsEarned: number;
  };
}

interface StreakData {
  type: StreakType;
  label: string;
  currentCount: number;
  longestCount: number;
  lastActionAt: string | null;
  isActive: boolean;
}

interface StreaksResponse {
  streaks: StreakData[];
  summary: {
    totalCurrentStreak: number;
    longestIndividualStreak: number;
    activeStreaks: number;
    totalStreakTypes: number;
  };
}

interface UserSettings {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  timezone: string;
  notifyDailyReminder: boolean;
  notifyWeeklyReview: boolean;
  notifyAchievements: boolean;
  createdAt: string;
}

// Fetch user stats
export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["user", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/user/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch user stats");
      }
      return res.json();
    },
  });
}

// Fetch user streaks
export function useUserStreaks() {
  return useQuery<StreaksResponse>({
    queryKey: ["user", "streaks"],
    queryFn: async () => {
      const res = await fetch("/api/user/streaks");
      if (!res.ok) {
        throw new Error("Failed to fetch user streaks");
      }
      return res.json();
    },
  });
}

// Fetch user settings
export function useUserSettings() {
  return useQuery<{ user: UserSettings }>({
    queryKey: ["user", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/user/settings");
      if (!res.ok) {
        throw new Error("Failed to fetch user settings");
      }
      return res.json();
    },
  });
}

// Update user settings
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name?: string;
      timezone?: string;
      notifyDailyReminder?: boolean;
      notifyWeeklyReview?: boolean;
      notifyAchievements?: boolean;
    }) => {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update settings");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "settings"] });
    },
  });
}

// Badge data interface
interface BadgeData {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

interface BadgesResponse {
  badges: BadgeData[];
  summary: {
    earned: number;
    total: number;
    percentage: number;
  };
}

// Fetch user badges
export function useUserBadges() {
  return useQuery<BadgesResponse>({
    queryKey: ["user", "badges"],
    queryFn: async () => {
      const res = await fetch("/api/user/badges");
      if (!res.ok) {
        throw new Error("Failed to fetch user badges");
      }
      return res.json();
    },
  });
}

// Next badge progress interface
interface BadgeProgress {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  current: number;
  target: number;
  percentage: number;
}

interface NextBadgeResponse {
  nextBadges: BadgeProgress[];
  totalEarned: number;
  totalBadges: number;
}

// Fetch next badges to earn with progress
export function useNextBadges() {
  return useQuery<NextBadgeResponse>({
    queryKey: ["user", "next-badge"],
    queryFn: async () => {
      const res = await fetch("/api/user/next-badge");
      if (!res.ok) {
        throw new Error("Failed to fetch next badges");
      }
      return res.json();
    },
  });
}

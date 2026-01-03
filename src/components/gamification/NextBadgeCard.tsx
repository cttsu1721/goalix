"use client";

import { cn } from "@/lib/utils";
import { useNextBadges } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import Link from "next/link";

interface NextBadgeCardProps {
  className?: string;
}

export function NextBadgeCard({ className }: NextBadgeCardProps) {
  const { data, isLoading } = useNextBadges();

  if (isLoading) {
    return (
      <div className={cn("p-4 rounded-xl bg-night-soft animate-pulse", className)}>
        <div className="h-4 bg-night-mist rounded w-24 mb-3" />
        <div className="h-10 bg-night-mist rounded mb-2" />
        <div className="h-2 bg-night-mist rounded" />
      </div>
    );
  }

  const nextBadge = data?.nextBadges?.[0];

  // All badges earned
  if (!nextBadge) {
    return (
      <div className={cn("p-4 rounded-xl bg-night-soft", className)}>
        <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-3">
          Badges
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-lantern/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-lantern" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-moon">All Earned!</div>
            <div className="text-xs text-moon-faint">
              {data?.totalEarned}/{data?.totalBadges} badges collected
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href="/progress" className="block">
      <div
        className={cn(
          "p-4 rounded-xl bg-night-soft",
          "hover:bg-night-glow transition-colors cursor-pointer",
          className
        )}
      >
        <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-3">
          Next Badge
        </div>

        <div className="flex items-center gap-3 mb-3">
          {/* Badge icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
              nextBadge.percentage >= 75
                ? "bg-lantern/20"
                : nextBadge.percentage >= 50
                ? "bg-zen-green/10"
                : "bg-night-mist"
            )}
          >
            {nextBadge.icon}
          </div>

          {/* Badge info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-moon truncate">
              {nextBadge.name}
            </div>
            <div className="text-xs text-moon-faint truncate">
              {nextBadge.description}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress
            value={nextBadge.percentage}
            className="h-2 bg-night-mist"
          />
          <div className="flex justify-between text-[0.625rem] text-moon-faint">
            <span>
              {nextBadge.current}/{nextBadge.target}
            </span>
            <span>{Math.round(nextBadge.percentage)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

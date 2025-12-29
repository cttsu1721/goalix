"use client";

import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface Badge {
  id: string;
  icon: string;
  name: string;
  earned: boolean;
}

interface BadgeGridProps {
  badges: Badge[];
  className?: string;
}

export function BadgeGrid({ badges, className }: BadgeGridProps) {
  return (
    <div className={cn(className)}>
      <div className="text-[0.6875rem] font-normal uppercase tracking-[0.15em] text-moon-faint mb-4">
        Badges
      </div>
      <div className="flex gap-2 flex-wrap">
        {badges.map((badge) => (
          <div
            key={badge.id}
            title={badge.name}
            className={cn(
              "w-10 h-10 rounded-[10px] flex items-center justify-center",
              "text-lg cursor-pointer",
              "transition-all duration-200",
              badge.earned
                ? "bg-night-soft hover:bg-night-glow hover:scale-110"
                : "bg-night-soft opacity-30 grayscale"
            )}
          >
            {badge.earned ? badge.icon : <Lock className="w-4 h-4 text-moon-faint" />}
          </div>
        ))}
      </div>
    </div>
  );
}

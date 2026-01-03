"use client";

import Link from "next/link";
import { ChevronRight, Home, Sparkles, Target, Calendar, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GoalLevel } from "@/types/goals";

interface BreadcrumbItem {
  id: string;
  title: string;
  level: GoalLevel;
}

interface GoalBreadcrumbProps {
  breadcrumb: BreadcrumbItem[];
  currentTitle: string;
  currentLevel: GoalLevel;
}

const LEVEL_ICONS: Record<GoalLevel, React.ReactNode> = {
  sevenYear: <Sparkles className="w-3.5 h-3.5" />,
  threeYear: <Target className="w-3.5 h-3.5" />,
  oneYear: <Calendar className="w-3.5 h-3.5" />,
  monthly: <Layers className="w-3.5 h-3.5" />,
  weekly: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const LEVEL_LABELS: Record<GoalLevel, string> = {
  sevenYear: "7Y",
  threeYear: "3Y",
  oneYear: "1Y",
  monthly: "M",
  weekly: "W",
};

export function GoalBreadcrumb({ breadcrumb, currentTitle, currentLevel }: GoalBreadcrumbProps) {
  const allItems = [
    ...breadcrumb,
    { id: "", title: currentTitle, level: currentLevel },
  ];

  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm mb-4">
      {/* Home link */}
      <Link
        href="/goals"
        className="flex items-center gap-1 text-moon-dim hover:text-lantern transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only sm:not-sr-only">Goals</span>
      </Link>

      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        return (
          <div key={item.id || "current"} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-moon-faint flex-shrink-0" />

            {isLast ? (
              // Current item (not a link)
              <span className="flex items-center gap-1.5 text-moon">
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium",
                    "bg-lantern/10 text-lantern"
                  )}
                >
                  {LEVEL_LABELS[item.level]}
                </span>
                <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                  {item.title}
                </span>
              </span>
            ) : (
              // Ancestor link
              <Link
                href={`/goals/${item.id}`}
                className={cn(
                  "flex items-center gap-1.5 text-moon-dim hover:text-lantern transition-colors",
                  "group"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium",
                    "bg-night-soft text-moon-faint group-hover:bg-lantern/10 group-hover:text-lantern transition-colors"
                  )}
                >
                  {LEVEL_LABELS[item.level]}
                </span>
                <span className="truncate max-w-[100px] sm:max-w-[150px]">
                  {item.title}
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

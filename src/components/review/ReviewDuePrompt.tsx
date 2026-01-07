"use client";

import { Calendar, ArrowRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ReviewType = "weekly" | "monthly";

interface ReviewDuePromptProps {
  type: ReviewType;
  className?: string;
}

/**
 * Check if weekly review is due
 * Due on: Sunday (0) or Monday if coming from weekend
 */
export function isWeeklyReviewDue(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Sunday (0) or Monday (1) are good times for weekly review
  return dayOfWeek === 0 || dayOfWeek === 1;
}

/**
 * Check if monthly review is due
 * Due on: Last 2 days of month or first 2 days of new month
 */
export function isMonthlyReviewDue(): boolean {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Last 2 days of month or first 2 days of new month
  return dayOfMonth >= daysInMonth - 1 || dayOfMonth <= 2;
}

const REVIEW_CONFIG: Record<
  ReviewType,
  { title: string; description: string; icon: typeof Calendar; href: string; color: string }
> = {
  weekly: {
    title: "Weekly Review Time",
    description: "Reflect on your week and plan for the next one",
    icon: Calendar,
    href: "/review/weekly",
    color: "text-zen-blue",
  },
  monthly: {
    title: "Monthly Review Due",
    description: "Celebrate wins and set new monthly targets",
    icon: CalendarCheck,
    href: "/review/monthly",
    color: "text-zen-purple",
  },
};

export function ReviewDuePrompt({ type, className }: ReviewDuePromptProps) {
  const config = REVIEW_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border",
        type === "weekly"
          ? "bg-zen-blue/5 border-zen-blue/20"
          : "bg-zen-purple/5 border-zen-purple/20",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          type === "weekly" ? "bg-zen-blue/10" : "bg-zen-purple/10"
        )}
      >
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm", config.color)}>{config.title}</p>
        <p className="text-xs text-moon-dim truncate">{config.description}</p>
      </div>
      <Link href={config.href}>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "flex-shrink-0 h-8 px-3",
            type === "weekly"
              ? "border-zen-blue/30 text-zen-blue hover:bg-zen-blue/10"
              : "border-zen-purple/30 text-zen-purple hover:bg-zen-purple/10"
          )}
        >
          Start
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </Link>
    </div>
  );
}

/**
 * Combined component that shows the most urgent review prompt
 * Priority: Monthly > Weekly (since monthly is less frequent)
 */
export function ReviewDuePromptAuto({ className }: { className?: string }) {
  const monthlyDue = isMonthlyReviewDue();
  const weeklyDue = isWeeklyReviewDue();

  // Prioritize monthly review since it's less frequent
  if (monthlyDue) {
    return <ReviewDuePrompt type="monthly" className={className} />;
  }

  if (weeklyDue) {
    return <ReviewDuePrompt type="weekly" className={className} />;
  }

  return null;
}

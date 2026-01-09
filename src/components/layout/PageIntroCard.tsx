"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageIntroCardProps {
  id: string; // Unique ID for localStorage persistence
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
}

const DISMISSED_INTROS_KEY = "goalzenix_dismissed_intros";

/**
 * Page introduction card that helps clarify page purpose (14.2)
 * Dismissible and remembers user's choice
 */
export function PageIntroCard({
  id,
  title,
  description,
  icon,
  className,
  dismissible = true,
}: PageIntroCardProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Default to hidden to prevent flash

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISSED_INTROS_KEY);
      const dismissedList: string[] = dismissed ? JSON.parse(dismissed) : [];
      setIsDismissed(dismissedList.includes(id));
    } catch {
      setIsDismissed(false);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      const dismissed = localStorage.getItem(DISMISSED_INTROS_KEY);
      const dismissedList: string[] = dismissed ? JSON.parse(dismissed) : [];
      if (!dismissedList.includes(id)) {
        dismissedList.push(id);
        localStorage.setItem(DISMISSED_INTROS_KEY, JSON.stringify(dismissedList));
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        "relative p-4 bg-night-soft rounded-lg border border-night-mist",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-lantern/10 flex items-center justify-center flex-shrink-0">
          {icon || <Info className="w-4 h-4 text-lantern" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-moon mb-1">{title}</h3>
          <p className="text-xs text-moon-dim">{description}</p>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 text-moon-faint hover:text-moon rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Pre-configured intro for Dashboard page
 */
export function DashboardIntro({ className }: { className?: string }) {
  return (
    <PageIntroCard
      id="dashboard-intro"
      title="Today"
      description="Your daily command center. Plan your day, complete tasks, and focus on your MIT — the one thing that matters most."
      className={className}
    />
  );
}

/**
 * Pre-configured intro for Progress page
 */
export function ProgressIntro({ className }: { className?: string }) {
  return (
    <PageIntroCard
      id="progress-intro"
      title="Your Progress Journey"
      description="Track your overall growth over time. View streaks, badges, points, and Kaizen insights. This page shows the bigger picture of your consistency and achievements."
      className={className}
    />
  );
}

/**
 * Page distinction helper - shows tooltip explaining page purpose
 */
export function PagePurposeTooltip({
  page,
  children,
}: {
  page: "dashboard" | "progress" | "goals" | "review";
  children: React.ReactNode;
}) {
  const purposes = {
    dashboard: "Daily tasks, MIT, and today's priorities",
    progress: "Long-term stats, streaks, and achievements",
    goals: "Goal hierarchy and cascade management",
    review: "Weekly and monthly reflection sessions",
  };

  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-void border border-night-mist rounded text-xs text-moon-dim whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {purposes[page]}
      </div>
    </div>
  );
}

/**
 * Navigation clarity component - shows where user is
 */
export function NavigationClarity({
  currentPage,
  className,
}: {
  currentPage: "dashboard" | "progress" | "goals" | "review";
  className?: string;
}) {
  const pageInfo = {
    dashboard: {
      emoji: "🎯",
      title: "Today",
      subtitle: "Daily tasks & MIT",
    },
    progress: {
      emoji: "📊",
      title: "Progress",
      subtitle: "Stats & achievements",
    },
    goals: {
      emoji: "🎪",
      title: "Goals",
      subtitle: "Goal hierarchy",
    },
    review: {
      emoji: "📝",
      title: "Review",
      subtitle: "Reflection & planning",
    },
  };

  const info = pageInfo[currentPage];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-lg">{info.emoji}</span>
      <div>
        <p className="text-sm font-medium text-moon">{info.title}</p>
        <p className="text-xs text-moon-faint">{info.subtitle}</p>
      </div>
    </div>
  );
}

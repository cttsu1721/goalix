"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Target,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/useGoals";
import Link from "next/link";

// Get next 30 days grouped by week
function getUpcomingWeeks() {
  const weeks: { label: string; startDate: Date; endDate: Date }[] = [];
  const today = new Date();

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (i * 7));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let label: string;
    if (i === 0) {
      label = "This Week";
    } else if (i === 1) {
      label = "Next Week";
    } else {
      const month = weekStart.toLocaleDateString("en-AU", { month: "short" });
      label = `Week of ${weekStart.getDate()} ${month}`;
    }

    weeks.push({ label, startDate: weekStart, endDate: weekEnd });
  }

  return weeks;
}

function formatDateRange(start: Date, end: Date) {
  const startMonth = start.toLocaleDateString("en-AU", { month: "short" });
  const endMonth = end.toLocaleDateString("en-AU", { month: "short" });

  if (startMonth === endMonth) {
    return `${start.getDate()} - ${end.getDate()} ${startMonth}`;
  }
  return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
}

export default function UpcomingPage() {
  const upcomingWeeks = getUpcomingWeeks();

  const { data: monthlyGoalsData } = useGoals("monthly");
  const { data: yearlyGoalsData } = useGoals("oneYear");

  const monthlyGoals = (monthlyGoalsData?.goals || []) as Array<{
    id: string;
    title: string;
    status: string;
    targetMonth?: string;
  }>;

  const yearlyGoals = (yearlyGoalsData?.goals || []) as Array<{
    id: string;
    title: string;
    status: string;
  }>;

  const activeMonthlyGoals = monthlyGoals.filter(g => g.status === "ACTIVE");
  const activeYearlyGoals = yearlyGoals.filter(g => g.status === "ACTIVE");

  return (
    <AppShell>
      <PageHeader
        title="Upcoming"
        subtitle="Plan ahead and stay on track"
      />

      {/* Upcoming Weeks */}
      <div className="space-y-4 mb-8">
        {upcomingWeeks.map((week, index) => (
          <Link
            key={index}
            href="/week"
            className="block bg-night border border-night-mist rounded-2xl p-5 hover:border-night-glow transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  index === 0 ? "bg-lantern-soft" : "bg-night-soft"
                )}>
                  <CalendarDays className={cn(
                    "w-6 h-6",
                    index === 0 ? "text-lantern" : "text-moon-soft"
                  )} />
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium",
                    index === 0 ? "text-lantern" : "text-moon"
                  )}>
                    {week.label}
                  </h3>
                  <p className="text-sm text-moon-dim">
                    {formatDateRange(week.startDate, week.endDate)}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-moon-faint group-hover:text-moon-soft transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Goals */}
        <div className="bg-night border border-night-mist rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center">
              <Calendar className="w-5 h-5 text-lantern" />
            </div>
            <div>
              <h3 className="font-medium text-moon">Monthly Goals</h3>
              <p className="text-sm text-moon-dim">
                {activeMonthlyGoals.length} active goal{activeMonthlyGoals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {activeMonthlyGoals.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-moon-faint mx-auto mb-2" />
              <p className="text-moon-dim text-sm">No active monthly goals</p>
              <Link href="/goals?level=monthly">
                <Button
                  variant="link"
                  className="text-lantern hover:text-lantern/80 mt-1 text-sm"
                >
                  Create one
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeMonthlyGoals.slice(0, 3).map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="flex items-center gap-3 p-3 bg-night-soft rounded-xl hover:bg-night-mist transition-colors"
                >
                  <Target className="w-4 h-4 text-moon-faint flex-shrink-0" />
                  <span className="text-sm text-moon flex-1 truncate">
                    {goal.title}
                  </span>
                </Link>
              ))}
              {activeMonthlyGoals.length > 3 && (
                <Link
                  href="/goals?level=monthly"
                  className="text-sm text-lantern hover:text-lantern/80 block text-center pt-2"
                >
                  View all {activeMonthlyGoals.length} goals
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Yearly Goals */}
        <div className="bg-night border border-night-mist rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center">
              <Target className="w-5 h-5 text-zen-green" />
            </div>
            <div>
              <h3 className="font-medium text-moon">1-Year Goals</h3>
              <p className="text-sm text-moon-dim">
                {activeYearlyGoals.length} active goal{activeYearlyGoals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {activeYearlyGoals.length === 0 ? (
            <div className="text-center py-6">
              <Target className="w-8 h-8 text-moon-faint mx-auto mb-2" />
              <p className="text-moon-dim text-sm">No active yearly goals</p>
              <Link href="/goals">
                <Button
                  variant="link"
                  className="text-lantern hover:text-lantern/80 mt-1 text-sm"
                >
                  Create one
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeYearlyGoals.slice(0, 3).map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="flex items-center gap-3 p-3 bg-night-soft rounded-xl hover:bg-night-mist transition-colors"
                >
                  <Target className="w-4 h-4 text-moon-faint flex-shrink-0" />
                  <span className="text-sm text-moon flex-1 truncate">
                    {goal.title}
                  </span>
                </Link>
              ))}
              {activeYearlyGoals.length > 3 && (
                <Link
                  href="/goals"
                  className="text-sm text-lantern hover:text-lantern/80 block text-center pt-2"
                >
                  View all {activeYearlyGoals.length} goals
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Planning Tip */}
      <div className="mt-8 bg-night-soft border border-night-mist rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-lantern-soft flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-lantern" />
          </div>
          <div>
            <h3 className="font-medium text-moon mb-1">Planning Tip</h3>
            <p className="text-sm text-moon-dim leading-relaxed">
              Break down your monthly goals into weekly goals, then create daily tasks
              from those weekly goals. This cascading approach ensures every task
              contributes to your bigger vision.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

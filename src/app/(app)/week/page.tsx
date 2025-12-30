"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Target,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import Link from "next/link";

// Get dates for the current week
function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay; // Start from Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + (weekOffset * 7));

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatWeekRange(dates: Date[]) {
  const start = dates[0];
  const end = dates[6];
  const startMonth = start.toLocaleDateString("en-AU", { month: "short" });
  const endMonth = end.toLocaleDateString("en-AU", { month: "short" });

  if (startMonth === endMonth) {
    return `${start.getDate()} - ${end.getDate()} ${startMonth}`;
  }
  return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
}

function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export default function WeekPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  const { data: goalsData } = useGoals("weekly");
  const { data: tasksData } = useTasks();

  const weeklyGoals = (goalsData?.goals || []) as Array<{
    id: string;
    title: string;
    status: string;
    category: string;
  }>;

  const tasks = tasksData?.tasks || [];

  const goToThisWeek = () => setWeekOffset(0);
  const goToPrevWeek = () => setWeekOffset(weekOffset - 1);
  const goToNextWeek = () => setWeekOffset(weekOffset + 1);

  return (
    <AppShell>
      <PageHeader
        title="Week View"
        subtitle={formatWeekRange(weekDates)}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevWeek}
            className="h-9 w-9 p-0 border-night-mist bg-night-soft hover:bg-night-mist"
          >
            <ChevronLeft className="w-4 h-4 text-moon-soft" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToThisWeek}
            disabled={weekOffset === 0}
            className="h-9 px-3 border-night-mist bg-night-soft hover:bg-night-mist text-moon-soft text-sm"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="h-9 w-9 p-0 border-night-mist bg-night-soft hover:bg-night-mist"
          >
            <ChevronRight className="w-4 h-4 text-moon-soft" />
          </Button>
        </div>
      </PageHeader>

      {/* Week Calendar Strip */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekDates.map((date, index) => {
          const dayName = date.toLocaleDateString("en-AU", { weekday: "short" });
          const dayNum = date.getDate();
          const today = isToday(date);

          return (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center py-3 rounded-xl border transition-colors",
                today
                  ? "bg-lantern-soft border-lantern"
                  : "bg-night-soft border-night-mist"
              )}
            >
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider mb-1",
                today ? "text-lantern" : "text-moon-faint"
              )}>
                {dayName}
              </span>
              <span className={cn(
                "text-lg font-semibold",
                today ? "text-lantern" : "text-moon"
              )}>
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Goals */}
        <div className="bg-night border border-night-mist rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center">
                <Target className="w-5 h-5 text-lantern" />
              </div>
              <div>
                <h3 className="font-medium text-moon">Weekly Goals</h3>
                <p className="text-sm text-moon-dim">
                  {weeklyGoals.filter(g => g.status === "COMPLETED").length} of {weeklyGoals.length} completed
                </p>
              </div>
            </div>
            <Link href="/goals?level=weekly">
              <Button
                variant="outline"
                size="sm"
                className="border-night-mist bg-night-soft hover:bg-night-mist text-moon-soft"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </Link>
          </div>

          {weeklyGoals.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-moon-faint mx-auto mb-3" />
              <p className="text-moon-dim text-sm">No weekly goals yet</p>
              <Link href="/goals?level=weekly">
                <Button
                  variant="link"
                  className="text-lantern hover:text-lantern/80 mt-2"
                >
                  Create your first weekly goal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyGoals.slice(0, 5).map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="flex items-center gap-3 p-3 bg-night-soft rounded-xl hover:bg-night-mist transition-colors"
                >
                  {goal.status === "COMPLETED" ? (
                    <CheckCircle className="w-5 h-5 text-zen-green flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-moon-faint flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm flex-1",
                    goal.status === "COMPLETED" ? "text-moon-dim line-through" : "text-moon"
                  )}>
                    {goal.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Week Tasks Summary */}
        <div className="bg-night border border-night-mist rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-zen-green" />
              </div>
              <div>
                <h3 className="font-medium text-moon">Tasks This Week</h3>
                <p className="text-sm text-moon-dim">
                  {tasks.filter(t => t.status === "COMPLETED").length} of {tasks.length} completed
                </p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-night-mist bg-night-soft hover:bg-night-mist text-moon-soft"
              >
                View All
              </Button>
            </Link>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-night-soft rounded-xl p-3 text-center">
              <div className="text-2xl font-semibold text-lantern">
                {tasks.filter(t => t.priority === "MIT" && t.status === "COMPLETED").length}
              </div>
              <div className="text-xs text-moon-faint uppercase tracking-wider">MITs Done</div>
            </div>
            <div className="bg-night-soft rounded-xl p-3 text-center">
              <div className="text-2xl font-semibold text-zen-green">
                {tasks.filter(t => t.status === "COMPLETED").length}
              </div>
              <div className="text-xs text-moon-faint uppercase tracking-wider">Completed</div>
            </div>
            <div className="bg-night-soft rounded-xl p-3 text-center">
              <div className="text-2xl font-semibold text-moon">
                {tasks.filter(t => t.status === "PENDING").length}
              </div>
              <div className="text-xs text-moon-faint uppercase tracking-wider">Remaining</div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="space-y-2">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg"
              >
                {task.status === "COMPLETED" ? (
                  <CheckCircle className="w-4 h-4 text-zen-green flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-moon-faint flex-shrink-0" />
                )}
                <span className={cn(
                  "text-sm flex-1 truncate",
                  task.status === "COMPLETED" ? "text-moon-dim line-through" : "text-moon-soft"
                )}>
                  {task.title}
                </span>
                {task.priority === "MIT" && (
                  <span className="text-[0.625rem] px-2 py-0.5 bg-lantern-soft text-lantern rounded-full font-medium">
                    MIT
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Review CTA */}
      <div className="mt-8 bg-night border border-night-mist rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-moon mb-1">Ready for your weekly review?</h3>
            <p className="text-sm text-moon-dim">
              Reflect on your progress and plan for next week
            </p>
          </div>
          <Link href="/review/weekly">
            <Button className="bg-lantern text-void hover:bg-lantern/90">
              Start Review
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

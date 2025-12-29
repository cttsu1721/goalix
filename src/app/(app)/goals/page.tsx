"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GoalCard, DreamCard, GoalCreateModal } from "@/components/goals";
import { Button } from "@/components/ui/button";
import { useGoals, useDreams } from "@/hooks";
import type { GoalLevel } from "@/types/goals";
import type { GoalCategory, GoalStatus } from "@prisma/client";
import {
  Plus,
  Target,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type UIGoalLevel = "dreams" | "5-year" | "1-year" | "monthly" | "weekly";

const levelConfig: Record<
  UIGoalLevel,
  { label: string; color: string; icon: React.ReactNode; apiLevel: GoalLevel }
> = {
  dreams: {
    label: "10-Year Dreams",
    color: "bg-lantern",
    icon: <Sparkles className="w-4 h-4" />,
    apiLevel: "dream",
  },
  "5-year": {
    label: "5-Year Goals",
    color: "bg-lantern",
    icon: <Target className="w-4 h-4" />,
    apiLevel: "fiveYear",
  },
  "1-year": {
    label: "1-Year Goals",
    color: "bg-moon-soft",
    icon: <Calendar className="w-4 h-4" />,
    apiLevel: "oneYear",
  },
  monthly: {
    label: "Monthly Goals",
    color: "bg-moon-soft",
    icon: <Layers className="w-4 h-4" />,
    apiLevel: "monthly",
  },
  weekly: {
    label: "Weekly Goals",
    color: "bg-moon-dim",
    icon: <CheckCircle2 className="w-4 h-4" />,
    apiLevel: "weekly",
  },
};

function EmptyState({ onCreateDream }: { onCreateDream: () => void }) {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-12 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-lantern/10 flex items-center justify-center mx-auto mb-6">
        <Target className="w-10 h-10 text-lantern" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-medium text-moon mb-3">Start with a Dream</h3>
      <p className="text-moon-dim max-w-md mx-auto mb-8 leading-relaxed">
        Create your first 10-year dream and cascade it down into achievable
        milestones. The journey of a thousand miles begins with a single step.
      </p>

      {/* CTA */}
      <Button
        onClick={onCreateDream}
        className="bg-lantern text-void hover:bg-lantern/90 font-medium px-6 h-11 rounded-xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Dream
      </Button>
    </div>
  );
}

function LevelTabs({
  activeLevel,
  onLevelChange,
}: {
  activeLevel: UIGoalLevel;
  onLevelChange: (level: UIGoalLevel) => void;
}) {
  const levels: UIGoalLevel[] = ["dreams", "5-year", "1-year", "monthly", "weekly"];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
      {levels.map((level) => {
        const config = levelConfig[level];
        const isActive = activeLevel === level;

        return (
          <button
            key={level}
            onClick={() => onLevelChange(level)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              whitespace-nowrap transition-all duration-200
              ${
                isActive
                  ? "bg-lantern text-void"
                  : "bg-night-soft text-moon-dim hover:text-moon hover:bg-night-glow"
              }
            `}
          >
            {config.icon}
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

// Transform API goal data to display format
interface DisplayGoal {
  id: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  childrenCount: number;
  completedChildren: number;
  parentTitle?: string;
  targetDate?: string | null;
}

function transformGoals(goals: unknown[], level: GoalLevel): DisplayGoal[] {
  if (!Array.isArray(goals)) return [];

  return goals.map((goal: Record<string, unknown>) => {
    // Calculate children count based on level
    let childrenCount = 0;
    let completedChildren = 0;
    let parentTitle: string | undefined;

    switch (level) {
      case "dream":
        childrenCount = (goal.fiveYearGoals as unknown[])?.length || 0;
        break;
      case "fiveYear":
        childrenCount = (goal.oneYearGoals as unknown[])?.length || 0;
        parentTitle = (goal.dream as { title?: string })?.title;
        break;
      case "oneYear":
        childrenCount = (goal.monthlyGoals as unknown[])?.length || 0;
        parentTitle = (goal.fiveYearGoal as { title?: string })?.title;
        break;
      case "monthly":
        childrenCount = (goal.weeklyGoals as unknown[])?.length || 0;
        parentTitle = (goal.oneYearGoal as { title?: string })?.title;
        break;
      case "weekly":
        const tasks = (goal.dailyTasks as { status: string }[]) || [];
        childrenCount = tasks.length;
        completedChildren = tasks.filter((t) => t.status === "COMPLETED").length;
        parentTitle = (goal.monthlyGoal as { title?: string })?.title;
        break;
    }

    // Calculate progress (simplified - real implementation would be more sophisticated)
    const progress =
      childrenCount > 0
        ? Math.round((completedChildren / childrenCount) * 100)
        : (goal.progress as number) || 0;

    return {
      id: goal.id as string,
      title: goal.title as string,
      description: goal.description as string | null | undefined,
      category: goal.category as GoalCategory,
      status: (goal.status as GoalStatus) || "ACTIVE",
      progress,
      childrenCount,
      completedChildren,
      parentTitle,
      targetDate: goal.targetDate as string | null | undefined,
    };
  });
}

export default function GoalsPage() {
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<UIGoalLevel>("dreams");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const apiLevel = levelConfig[activeLevel].apiLevel;

  // Fetch goals for the current level
  const { data, isLoading, refetch } = useGoals(apiLevel);
  const { data: dreamsData } = useDreams();

  const goals = transformGoals(data?.goals || [], apiLevel);
  const hasDreams = (dreamsData?.goals?.length || 0) > 0;

  const handleGoalClick = (id: string) => {
    router.push(`/goals/${id}`);
  };

  const handleCreateGoal = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <AppShell>
      <PageHeader
        title="Goal Hierarchy"
        subtitle="Your 1/5/10 cascade from dreams to daily tasks"
      />

      {/* Level Tabs */}
      <div className="mb-6">
        <LevelTabs activeLevel={activeLevel} onLevelChange={setActiveLevel} />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${levelConfig[activeLevel].color}`} />
          <h2 className="text-lg font-medium text-moon">
            {levelConfig[activeLevel].label}
          </h2>
          <span className="text-moon-faint text-sm">({goals.length})</span>
        </div>
        <Button
          onClick={handleCreateGoal}
          variant="outline"
          className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern/5 rounded-xl h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          New {activeLevel === "dreams" ? "Dream" : "Goal"}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      ) : !hasDreams && activeLevel === "dreams" ? (
        <EmptyState onCreateDream={handleCreateGoal} />
      ) : goals.length === 0 ? (
        <div className="bg-night border border-night-mist rounded-2xl p-8 text-center">
          <p className="text-moon-dim">
            No {levelConfig[activeLevel].label.toLowerCase()} yet.
          </p>
          <Button
            onClick={handleCreateGoal}
            variant="link"
            className="text-lantern hover:text-lantern/80 mt-2"
          >
            Create your first one
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) =>
            activeLevel === "dreams" ? (
              <DreamCard
                key={goal.id}
                {...goal}
                onClick={() => handleGoalClick(goal.id)}
              />
            ) : (
              <GoalCard
                key={goal.id}
                {...goal}
                onClick={() => handleGoalClick(goal.id)}
              />
            )
          )}
        </div>
      )}

      {/* Cascade Visualization Hint */}
      {hasDreams && goals.length > 0 && (
        <div className="mt-8 p-4 bg-night-soft border border-night-mist rounded-xl">
          <div className="flex items-start gap-3">
            <Layers className="w-5 h-5 text-lantern flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-moon-soft">
                <span className="text-lantern font-medium">Tip:</span> Click on any
                goal to see its sub-goals and cascade down the hierarchy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      <GoalCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        level={apiLevel}
        onSuccess={() => refetch()}
      />
    </AppShell>
  );
}

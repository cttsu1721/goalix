"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GoalCard, DreamCard, GoalCreateModal, DreamBuilderModal } from "@/components/goals";
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
  Wand2,
  Star,
} from "lucide-react";

type UIGoalLevel = "dreams" | "5-year" | "1-year" | "monthly" | "weekly";
type GoalsOnlyLevel = Exclude<UIGoalLevel, "dreams">;

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

function EmptyState({ onCreateDream, onDreamBuilder }: { onCreateDream: () => void; onDreamBuilder: () => void }) {
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

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={onDreamBuilder}
          className="bg-gradient-to-r from-lantern to-lantern/80 text-void hover:from-lantern/90 hover:to-lantern/70 font-medium px-6 h-11 rounded-xl shadow-lg shadow-lantern/20"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Dream Builder
        </Button>
        <span className="text-moon-faint text-sm">or</span>
        <Button
          onClick={onCreateDream}
          variant="outline"
          className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern/5 font-medium px-6 h-11 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Manually
        </Button>
      </div>
    </div>
  );
}

function LevelTabs({
  activeLevel,
  onLevelChange,
  hideDreams = false,
}: {
  activeLevel: UIGoalLevel;
  onLevelChange: (level: UIGoalLevel) => void;
  hideDreams?: boolean;
}) {
  const allLevels: UIGoalLevel[] = ["dreams", "5-year", "1-year", "monthly", "weekly"];
  const levels = hideDreams ? allLevels.filter((l) => l !== "dreams") : allLevels;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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

  return (goals as Array<Record<string, unknown>>).map((goal) => {
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

// Dreams Page - Inspirational, no tabs
function DreamsPageContent() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDreamBuilderOpen, setIsDreamBuilderOpen] = useState(false);

  const { data, isLoading, refetch } = useDreams();
  const dreams = transformGoals(data?.goals || [], "dream");

  const handleDreamClick = (id: string) => {
    router.push(`/goals/${id}`);
  };

  return (
    <AppShell>
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lantern/20 to-lantern/5 border border-lantern/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-lantern" />
          </div>
          <h1 className="text-2xl font-semibold text-moon tracking-tight">
            Your 10-Year Vision
          </h1>
        </div>
        <p className="text-moon-dim ml-[52px]">
          Dream big. These are the destinations that shape your journey.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-moon-faint text-sm">
          {dreams.length} {dreams.length === 1 ? "dream" : "dreams"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDreamBuilderOpen(true)}
            className="bg-gradient-to-r from-lantern to-lantern/80 text-void hover:from-lantern/90 hover:to-lantern/70 font-medium rounded-xl h-10 shadow-lg shadow-lantern/20"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Dream Builder
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern/5 rounded-xl h-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Dream
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      ) : dreams.length === 0 ? (
        <EmptyState
          onCreateDream={() => setIsCreateModalOpen(true)}
          onDreamBuilder={() => setIsDreamBuilderOpen(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {dreams.map((dream) => (
            <DreamCard
              key={dream.id}
              {...dream}
              onClick={() => handleDreamClick(dream.id)}
            />
          ))}
        </div>
      )}

      {/* Create Dream Modal */}
      <GoalCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        level="dream"
        onSuccess={() => refetch()}
      />

      {/* Dream Builder Modal */}
      <DreamBuilderModal
        open={isDreamBuilderOpen}
        onOpenChange={setIsDreamBuilderOpen}
      />
    </AppShell>
  );
}

// Goals Page - Operational, 4 tabs
function GoalsOnlyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  // Get initial level from URL or default to 1-year
  const getInitialLevel = (): GoalsOnlyLevel => {
    const validLevels: GoalsOnlyLevel[] = ["5-year", "1-year", "monthly", "weekly"];
    if (viewParam && validLevels.includes(viewParam as GoalsOnlyLevel)) {
      return viewParam as GoalsOnlyLevel;
    }
    return "1-year"; // Default to 1-year (most actionable)
  };

  const [activeLevel, setActiveLevel] = useState<GoalsOnlyLevel>(getInitialLevel);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Update active level when URL changes
  useEffect(() => {
    const newLevel = getInitialLevel();
    if (newLevel !== activeLevel) {
      setActiveLevel(newLevel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewParam]);

  const apiLevel = levelConfig[activeLevel].apiLevel;

  // Fetch goals for the current level
  const { data, isLoading, refetch } = useGoals(apiLevel);
  const goals = transformGoals(data?.goals || [], apiLevel);

  const handleGoalClick = (id: string) => {
    router.push(`/goals/${id}`);
  };

  return (
    <AppShell>
      <PageHeader
        title="Goals"
        subtitle="Your milestones from 5-year targets to weekly actions"
      />

      {/* Level Tabs (without Dreams) */}
      <div className="mb-6">
        <LevelTabs
          activeLevel={activeLevel}
          onLevelChange={(level) => setActiveLevel(level as GoalsOnlyLevel)}
          hideDreams
        />
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
          onClick={() => setIsCreateModalOpen(true)}
          variant="outline"
          className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern/5 rounded-xl h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-night border border-night-mist rounded-2xl p-8 text-center">
          <p className="text-moon-dim">
            No {levelConfig[activeLevel].label.toLowerCase()} yet.
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="link"
            className="text-lantern hover:text-lantern/80 mt-2"
          >
            Create your first one
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 min-w-0 w-full" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              {...goal}
              onClick={() => handleGoalClick(goal.id)}
            />
          ))}
        </div>
      )}

      {/* Cascade Tip */}
      {goals.length > 0 && (
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

// Router - decides which view to show based on URL
function GoalsPageContent() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  // Show Dreams page for view=dreams, Goals page for everything else
  if (viewParam === "dreams") {
    return <DreamsPageContent />;
  }

  return <GoalsOnlyPageContent />;
}

function GoalsPageFallback() {
  return (
    <AppShell>
      <PageHeader
        title="Goal Hierarchy"
        subtitle="Your 1/5/10 cascade from dreams to daily tasks"
      />
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-lantern" />
      </div>
    </AppShell>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<GoalsPageFallback />}>
      <GoalsPageContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GoalCard, VisionCard, GoalCreateModal, VisionBuilderModal } from "@/components/goals";
import { Button } from "@/components/ui/button";
import { useGoals, useVisions } from "@/hooks";
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
  Archive,
  Play,
} from "lucide-react";
import { ContextualTip } from "@/components/onboarding";
import { toast } from "sonner";
import { GoalCardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { UnlinkedGoalsWarning } from "@/components/goals";

type UIGoalLevel = "vision" | "3-year" | "1-year" | "monthly" | "weekly";
type GoalsOnlyLevel = Exclude<UIGoalLevel, "vision">;

const levelConfig: Record<
  UIGoalLevel,
  { label: string; color: string; icon: React.ReactNode; apiLevel: GoalLevel; childLevel: GoalLevel | null; childLabel: string }
> = {
  vision: {
    label: "7-Year Vision",
    color: "bg-lantern",
    icon: <Sparkles className="w-4 h-4" />,
    apiLevel: "sevenYear",
    childLevel: "threeYear",
    childLabel: "3-Year Goal",
  },
  "3-year": {
    label: "3-Year Goals",
    color: "bg-lantern",
    icon: <Target className="w-4 h-4" />,
    apiLevel: "threeYear",
    childLevel: "oneYear",
    childLabel: "1-Year Goal",
  },
  "1-year": {
    label: "1-Year Goals",
    color: "bg-moon-soft",
    icon: <Calendar className="w-4 h-4" />,
    apiLevel: "oneYear",
    childLevel: "monthly",
    childLabel: "Monthly Goal",
  },
  monthly: {
    label: "Monthly Goals",
    color: "bg-moon-soft",
    icon: <Layers className="w-4 h-4" />,
    apiLevel: "monthly",
    childLevel: "weekly",
    childLabel: "Weekly Goal",
  },
  weekly: {
    label: "Weekly Goals",
    color: "bg-moon-dim",
    icon: <CheckCircle2 className="w-4 h-4" />,
    apiLevel: "weekly",
    childLevel: null,
    childLabel: "Daily Task",
  },
};

function EmptyState({ onCreateVision, onVisionBuilder, onTrySamples }: { onCreateVision: () => void; onVisionBuilder: () => void; onTrySamples: () => void }) {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-12 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-lantern/10 flex items-center justify-center mx-auto mb-6">
        <Target className="w-10 h-10 text-lantern" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-medium text-moon mb-3">Start with a Vision</h3>
      <p className="text-moon-dim max-w-md mx-auto mb-8 leading-relaxed">
        Create your first 7-year vision and cascade it down into achievable
        milestones. The journey of a thousand miles begins with a single step.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <Button
          onClick={onVisionBuilder}
          className="bg-gradient-to-r from-lantern to-lantern/80 text-void hover:from-lantern/90 hover:to-lantern/70 font-medium px-6 h-11 rounded-xl shadow-lg shadow-lantern/20"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Vision Builder
        </Button>
        <span className="text-moon-faint text-sm">or</span>
        <Button
          onClick={onCreateVision}
          variant="outline"
          className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern/5 font-medium px-6 h-11 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Manually
        </Button>
      </div>

      {/* Sample Goals Option */}
      <div className="pt-6 border-t border-night-mist">
        <p className="text-moon-faint text-sm mb-3">Want to explore the app first?</p>
        <Button
          onClick={onTrySamples}
          variant="ghost"
          className="text-moon-dim hover:text-moon hover:bg-night-soft"
        >
          <Play className="w-4 h-4 mr-2" />
          Try with Sample Goals
        </Button>
      </div>
    </div>
  );
}

function LevelTabs({
  activeLevel,
  onLevelChange,
  hideVision = false,
}: {
  activeLevel: UIGoalLevel;
  onLevelChange: (level: UIGoalLevel) => void;
  hideVision?: boolean;
}) {
  const allLevels: UIGoalLevel[] = ["vision", "3-year", "1-year", "monthly", "weekly"];
  const levels = hideVision ? allLevels.filter((l) => l !== "vision") : allLevels;

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

    // Helper to count completed goals from an array with status
    const countCompleted = (items: { status: string }[] | undefined) => {
      if (!items) return 0;
      return items.filter((item) => item.status === "COMPLETED").length;
    };

    switch (level) {
      case "sevenYear":
        const threeYearGoals = (goal.threeYearGoals as { status: string }[]) || [];
        childrenCount = threeYearGoals.length;
        completedChildren = countCompleted(threeYearGoals);
        break;
      case "threeYear":
        const oneYearGoals = (goal.oneYearGoals as { status: string }[]) || [];
        childrenCount = oneYearGoals.length;
        completedChildren = countCompleted(oneYearGoals);
        parentTitle = (goal.sevenYearVision as { title?: string })?.title;
        break;
      case "oneYear":
        const monthlyGoals = (goal.monthlyGoals as { status: string }[]) || [];
        childrenCount = monthlyGoals.length;
        completedChildren = countCompleted(monthlyGoals);
        parentTitle = (goal.threeYearGoal as { title?: string })?.title;
        break;
      case "monthly":
        const weeklyGoals = (goal.weeklyGoals as { status: string }[]) || [];
        childrenCount = weeklyGoals.length;
        completedChildren = countCompleted(weeklyGoals);
        parentTitle = (goal.oneYearGoal as { title?: string })?.title;
        break;
      case "weekly":
        const tasks = (goal.dailyTasks as { status: string }[]) || [];
        childrenCount = tasks.length;
        completedChildren = tasks.filter((t) => t.status === "COMPLETED").length;
        parentTitle = (goal.monthlyGoal as { title?: string })?.title;
        break;
    }

    // Calculate progress based on completed children
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

// Vision Page - Inspirational, no tabs
function VisionPageContent() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVisionBuilderOpen, setIsVisionBuilderOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  // For creating 3-year goals from vision cards
  const [createChildTarget, setCreateChildTarget] = useState<{
    parentId: string;
    parentTitle: string;
  } | null>(null);

  const { data, isLoading, refetch } = useVisions(undefined, showArchived);
  const visions = transformGoals(data?.goals || [], "sevenYear");

  const handleVisionClick = (id: string) => {
    router.push(`/goals/${id}`);
  };

  const handleCreateChild = (vision: DisplayGoal) => {
    setCreateChildTarget({
      parentId: vision.id,
      parentTitle: vision.title,
    });
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleTrySamples = async () => {
    setIsLoadingSamples(true);
    try {
      const response = await fetch("/api/sample-goals", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sample goals created! Explore the app with real examples.");
        await refetch();
        router.refresh();
      } else {
        toast.error(data.error?.message || "Failed to create sample goals");
      }
    } catch (error) {
      toast.error("Failed to create sample goals");
    } finally {
      setIsLoadingSamples(false);
    }
  };

  return (
    <AppShell onRefresh={handleRefresh}>
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lantern/20 to-lantern/5 border border-lantern/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-lantern" />
          </div>
          <h1 className="text-2xl font-semibold text-moon tracking-tight">
            Your 7-Year Vision
          </h1>
        </div>
        <p className="text-moon-dim ml-[52px]">
          Think big. These are the destinations that shape your journey.
        </p>
      </div>

      {/* Goal hierarchy tip for new users */}
      <ContextualTip tipId="goal_hierarchy" variant="inline" className="mb-6" />

      {/* Unlinked Goals Warning - show on Vision page too */}
      <UnlinkedGoalsWarning className="mb-6" />

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="text-moon-faint text-sm">
            {visions.length} {visions.length === 1 ? "vision" : "visions"}
          </span>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              showArchived
                ? "bg-moon-faint/20 text-moon-soft"
                : "text-moon-faint hover:text-moon-soft hover:bg-night-soft"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsVisionBuilderOpen(true)}
            className="bg-gradient-to-r from-lantern to-lantern/80 text-void hover:from-lantern/90 hover:to-lantern/70 font-medium rounded-xl h-10 shadow-lg shadow-lantern/20"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Vision Builder
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern/5 rounded-xl h-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vision
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-night via-night to-night-soft border border-lantern/20 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-night-mist" />
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-night-mist rounded mb-2" />
                  <div className="h-3 w-1/2 bg-night-mist rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-night-mist rounded mb-2" />
              <div className="h-4 w-2/3 bg-night-mist rounded mb-4" />
              <div className="h-2 w-full bg-night-mist rounded-full" />
            </div>
          ))}
        </div>
      ) : visions.length === 0 ? (
        <EmptyState
          onCreateVision={() => setIsCreateModalOpen(true)}
          onVisionBuilder={() => setIsVisionBuilderOpen(true)}
          onTrySamples={handleTrySamples}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {visions.map((vision) => (
            <VisionCard
              key={vision.id}
              {...vision}
              onClick={() => handleVisionClick(vision.id)}
              onCreateChild={() => handleCreateChild(vision)}
            />
          ))}
        </div>
      )}

      {/* Create Vision Modal */}
      <GoalCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        level="sevenYear"
        onSuccess={() => refetch()}
      />

      {/* Vision Builder Modal */}
      <VisionBuilderModal
        open={isVisionBuilderOpen}
        onOpenChange={setIsVisionBuilderOpen}
      />

      {/* Create 3-Year Goal Modal (from vision card's + button) */}
      {createChildTarget && (
        <GoalCreateModal
          open={!!createChildTarget}
          onOpenChange={(open) => !open && setCreateChildTarget(null)}
          level="threeYear"
          parentId={createChildTarget.parentId}
          parentTitle={createChildTarget.parentTitle}
          onSuccess={() => {
            refetch();
            setCreateChildTarget(null);
          }}
        />
      )}
    </AppShell>
  );
}

// Goals Page - Operational, 4 tabs
function GoalsOnlyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  // Get initial level from URL or default to 3-year
  const getInitialLevel = (): GoalsOnlyLevel => {
    const validLevels: GoalsOnlyLevel[] = ["3-year", "1-year", "monthly", "weekly"];
    if (viewParam && validLevels.includes(viewParam as GoalsOnlyLevel)) {
      return viewParam as GoalsOnlyLevel;
    }
    return "3-year"; // Default to 3-year (top of hierarchy)
  };

  const [activeLevel, setActiveLevel] = useState<GoalsOnlyLevel>(getInitialLevel);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  // For creating child goals from goal cards
  const [createChildTarget, setCreateChildTarget] = useState<{
    parentId: string;
    parentTitle: string;
    level: GoalLevel;
  } | null>(null);

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
  const { data, isLoading, refetch } = useGoals(apiLevel, undefined, undefined, showArchived);
  const goals = transformGoals(data?.goals || [], apiLevel);

  const handleGoalClick = (id: string) => {
    router.push(`/goals/${id}`);
  };

  const handleCreateChild = (goal: DisplayGoal) => {
    const childLevel = levelConfig[activeLevel].childLevel;
    if (!childLevel) return;

    setCreateChildTarget({
      parentId: goal.id,
      parentTitle: goal.title,
      level: childLevel,
    });
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <AppShell onRefresh={handleRefresh}>
      <PageHeader
        title="Goals"
        subtitle="Your milestones from 3-year targets to weekly actions"
      />

      {/* Level Tabs (without Vision) */}
      <div className="mb-6">
        <LevelTabs
          activeLevel={activeLevel}
          onLevelChange={(level) => setActiveLevel(level as GoalsOnlyLevel)}
          hideVision
        />
      </div>

      {/* Goal hierarchy tip for new users */}
      <ContextualTip tipId="goal_hierarchy" variant="inline" className="mb-6" />

      {/* Unlinked Goals Warning */}
      <UnlinkedGoalsWarning className="mb-6" />

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${levelConfig[activeLevel].color}`} />
          <h2 className="text-lg font-medium text-moon">
            {levelConfig[activeLevel].label}
          </h2>
          <span className="text-moon-faint text-sm">({goals.length})</span>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ml-2 ${
              showArchived
                ? "bg-moon-faint/20 text-moon-soft"
                : "text-moon-faint hover:text-moon-soft hover:bg-night-soft"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showArchived ? "Hide archived" : "Show archived"}</span>
          </button>
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
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
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
              onCreateChild={levelConfig[activeLevel].childLevel ? () => handleCreateChild(goal) : undefined}
              childLabel={levelConfig[activeLevel].childLabel.toLowerCase()}
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

      {/* Create Goal Modal (new goal at current level) */}
      <GoalCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        level={apiLevel}
        onSuccess={() => refetch()}
      />

      {/* Create Child Goal Modal (from goal card's + button) */}
      {createChildTarget && (
        <GoalCreateModal
          open={!!createChildTarget}
          onOpenChange={(open) => !open && setCreateChildTarget(null)}
          level={createChildTarget.level}
          parentId={createChildTarget.parentId}
          parentTitle={createChildTarget.parentTitle}
          onSuccess={() => {
            refetch();
            setCreateChildTarget(null);
          }}
        />
      )}
    </AppShell>
  );
}

// Router - decides which view to show based on URL
function GoalsPageContent() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  // Show Vision page for view=vision, Goals page for everything else
  if (viewParam === "vision") {
    return <VisionPageContent />;
  }

  return <GoalsOnlyPageContent />;
}

function GoalsPageFallback() {
  return (
    <AppShell>
      <PageHeader
        title="Goal Hierarchy"
        subtitle="Your cascading goals from vision to daily tasks"
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

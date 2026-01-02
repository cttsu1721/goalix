"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GoalCard, GoalCategoryBadge, GoalCreateModal, GoalEditModal } from "@/components/goals";
import { Button } from "@/components/ui/button";
import { useGoal, useUpdateGoal, useDeleteGoal } from "@/hooks";
import { GOAL_CATEGORY_LABELS, GOAL_STATUS_LABELS } from "@/types/goals";
import type { GoalLevel } from "@/types/goals";
import type { GoalCategory, GoalStatus } from "@prisma/client";
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  Target,
  Calendar,
  Layers,
  CheckCircle2,
  Pause,
  Play,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<
  GoalLevel,
  {
    label: string;
    singularLabel: string;
    icon: React.ReactNode;
    childLevel: GoalLevel | null;
    childLabel: string;
  }
> = {
  sevenYear: {
    label: "7-Year Visions",
    singularLabel: "Vision",
    icon: <Sparkles className="w-5 h-5" />,
    childLevel: "threeYear",
    childLabel: "3-Year Goals",
  },
  threeYear: {
    label: "3-Year Goals",
    singularLabel: "3-Year Goal",
    icon: <Target className="w-5 h-5" />,
    childLevel: "oneYear",
    childLabel: "1-Year Goals",
  },
  oneYear: {
    label: "1-Year Goals",
    singularLabel: "1-Year Goal",
    icon: <Calendar className="w-5 h-5" />,
    childLevel: "monthly",
    childLabel: "Monthly Goals",
  },
  monthly: {
    label: "Monthly Goals",
    singularLabel: "Monthly Goal",
    icon: <Layers className="w-5 h-5" />,
    childLevel: "weekly",
    childLabel: "Weekly Goals",
  },
  weekly: {
    label: "Weekly Goals",
    singularLabel: "Weekly Goal",
    icon: <CheckCircle2 className="w-5 h-5" />,
    childLevel: null,
    childLabel: "Daily Tasks",
  },
};

// Helper to get children from goal based on level
function getChildren(goal: Record<string, unknown>, level: GoalLevel): unknown[] {
  switch (level) {
    case "sevenYear":
      return (goal.threeYearGoals as unknown[]) || [];
    case "threeYear":
      return (goal.oneYearGoals as unknown[]) || [];
    case "oneYear":
      return (goal.monthlyGoals as unknown[]) || [];
    case "monthly":
      return (goal.weeklyGoals as unknown[]) || [];
    case "weekly":
      return (goal.dailyTasks as unknown[]) || [];
    default:
      return [];
  }
}

// Transform child goal for display
function transformChild(child: Record<string, unknown>) {
  return {
    id: child.id as string,
    title: child.title as string,
    description: child.description as string | null,
    category: child.category as GoalCategory,
    status: (child.status as GoalStatus) || "ACTIVE",
    progress: (child.progress as number) || 0,
    childrenCount: 0,
    completedChildren: 0,
  };
}

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGoal(id);
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const goal = data?.goal as Record<string, unknown> | undefined;
  const level = data?.level as GoalLevel | undefined;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      </AppShell>
    );
  }

  if (!goal || !level) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-moon-dim mb-4">Goal not found</p>
          <Button
            onClick={() => router.push("/goals")}
            variant="outline"
            className="border-night-mist text-moon"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
        </div>
      </AppShell>
    );
  }

  const config = LEVEL_CONFIG[level];
  const children = getChildren(goal, level) as Array<Record<string, unknown>>;
  const status = (goal.status as GoalStatus) || "ACTIVE";
  const progress = (goal.progress as number) || 0;

  const handleBack = () => {
    router.push("/goals");
  };

  const handleChildClick = (childId: string) => {
    router.push(`/goals/${childId}`);
  };

  const handleStatusChange = async (newStatus: GoalStatus) => {
    try {
      await updateGoal.mutateAsync({ id, status: newStatus });
      toast.success(`Status updated to ${GOAL_STATUS_LABELS[newStatus]}`);
      refetch();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${config.singularLabel}? This will also delete all sub-goals.`)) {
      return;
    }

    try {
      await deleteGoal.mutateAsync(id);
      toast.success(`${config.singularLabel} deleted`);
      router.push("/goals");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-moon-dim hover:text-moon transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Goals</span>
        </button>

        {/* Level badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-lantern/10 flex items-center justify-center text-lantern">
            {config.icon}
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-moon-faint">
            {config.singularLabel}
          </span>
        </div>

        {/* Title and actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-moon mb-2">
              {goal.title as string}
            </h1>
            {(goal.description as string) && (
              <p className="text-moon-dim leading-relaxed">
                {goal.description as string}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-moon-dim hover:text-moon"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-night border-night-glow"
            >
              <DropdownMenuItem
                onClick={() => setIsEditModalOpen(true)}
                className="text-moon hover:text-moon"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-night-glow" />
              {status === "ACTIVE" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("PAUSED")}
                  className="text-moon hover:text-moon"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              )}
              {status === "PAUSED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("ACTIVE")}
                  className="text-moon hover:text-moon"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </DropdownMenuItem>
              )}
              {status !== "COMPLETED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("COMPLETED")}
                  className="text-zen-green hover:text-zen-green"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-night-glow" />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-zen-red hover:text-zen-red"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <GoalCategoryBadge category={goal.category as GoalCategory} size="md" />
        <div
          className={cn(
            "text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full",
            status === "ACTIVE" && "bg-zen-green/10 text-zen-green",
            status === "COMPLETED" && "bg-zen-green/20 text-zen-green",
            status === "PAUSED" && "bg-moon-dim/20 text-moon-dim",
            status === "ABANDONED" && "bg-zen-red/20 text-zen-red"
          )}
        >
          {GOAL_STATUS_LABELS[status]}
        </div>
      </div>

      {/* Progress section */}
      <div className="bg-night border border-night-mist rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-moon-soft">Overall Progress</h3>
          <span className="text-2xl font-medium text-lantern">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-night-mist rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              status === "COMPLETED"
                ? "bg-zen-green"
                : "bg-gradient-to-r from-lantern via-lantern to-zen-green"
            )}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-moon-faint">
          <span>{children.length} {config.childLabel}</span>
          <span>
            {children.filter((c) => c.status === "COMPLETED").length} completed
          </span>
        </div>
      </div>

      {/* Children section */}
      {config.childLevel && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-moon">{config.childLabel}</h2>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline"
              className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern/5 rounded-xl h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="bg-night border border-night-mist border-dashed rounded-2xl p-8 text-center">
              <p className="text-moon-dim mb-4">
                No {config.childLabel.toLowerCase()} yet. Break down this goal into smaller steps.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-lantern text-void hover:bg-lantern/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First {config.childLabel.replace(/s$/, "")}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {children.map((child) => (
                <GoalCard
                  key={child.id as string}
                  {...transformChild(child)}
                  onClick={() => handleChildClick(child.id as string)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly goal shows tasks instead */}
      {level === "weekly" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-moon">Daily Tasks</h2>
          </div>

          {children.length === 0 ? (
            <div className="bg-night border border-night-mist border-dashed rounded-2xl p-8 text-center">
              <p className="text-moon-dim">
                No tasks linked to this weekly goal yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((task) => (
                <div
                  key={task.id as string}
                  className={cn(
                    "flex items-center gap-3 p-4 bg-night border border-night-mist rounded-xl",
                    task.status === "COMPLETED" && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-lg border-2 flex items-center justify-center",
                      task.status === "COMPLETED"
                        ? "bg-zen-green border-zen-green"
                        : "border-night-glow"
                    )}
                  >
                    {task.status === "COMPLETED" && (
                      <CheckCircle2 className="w-3 h-3 text-void" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-moon",
                      task.status === "COMPLETED" && "line-through text-moon-dim"
                    )}
                  >
                    {task.title as string}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create child goal modal */}
      {config.childLevel && (
        <GoalCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          level={config.childLevel}
          parentId={id}
          parentTitle={goal.title as string}
          onSuccess={() => refetch()}
        />
      )}

      {/* Edit goal modal */}
      <GoalEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        goal={{
          id,
          title: goal.title as string,
          description: goal.description as string | null,
          category: goal.category as GoalCategory,
          targetDate: goal.targetDate as Date | null,
        }}
        level={level}
        onSuccess={() => refetch()}
      />
    </AppShell>
  );
}

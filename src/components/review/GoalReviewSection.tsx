"use client";

import { useState } from "react";
import { useGoals, useUpdateGoal } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Target,
  Edit2,
  Pause,
  XCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { GoalStatus } from "@prisma/client";

interface WeeklyGoal {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  progress: number;
  category: string;
}

type GoalLevel = "weekly" | "monthly";

interface GoalReviewSectionProps {
  className?: string;
  level?: GoalLevel;
}

export function GoalReviewSection({ className, level = "weekly" }: GoalReviewSectionProps) {
  const { data: goalsData, isLoading } = useGoals(level, undefined, "ACTIVE");
  const updateGoal = useUpdateGoal();
  const [expanded, setExpanded] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WeeklyGoal | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [statusAction, setStatusAction] = useState<{
    goal: WeeklyGoal;
    action: "PAUSED" | "ABANDONED";
  } | null>(null);

  const goals = (goalsData?.goals || []) as WeeklyGoal[];

  const handleEdit = (goal: WeeklyGoal) => {
    setEditingGoal(goal);
    setEditForm({
      title: goal.title,
      description: goal.description || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingGoal) return;

    try {
      await updateGoal.mutateAsync({
        id: editingGoal.id,
        title: editForm.title,
        description: editForm.description || undefined,
      });
      toast.success("Goal updated");
      setEditingGoal(null);
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const handleStatusChange = async () => {
    if (!statusAction) return;

    try {
      await updateGoal.mutateAsync({
        id: statusAction.goal.id,
        status: statusAction.action,
      });
      toast.success(
        statusAction.action === "PAUSED"
          ? "Goal paused — you can resume it later"
          : "Goal abandoned"
      );
      setStatusAction(null);
    } catch {
      toast.error("Failed to update goal");
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-night border border-night-mist rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-moon-faint" />
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`bg-night border border-night-mist rounded-2xl overflow-hidden ${className}`}>
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-night-soft transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zen-purple/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-zen-purple" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-moon">
                Review Your {level === "weekly" ? "Weekly" : "Monthly"} Goals
              </h3>
              <p className="text-xs text-moon-faint">
                {goals.length} active goal{goals.length !== 1 ? "s" : ""} — edit, pause, or abandon if needed
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-moon-faint" />
          ) : (
            <ChevronDown className="w-5 h-5 text-moon-faint" />
          )}
        </button>

        {/* Goal List */}
        {expanded && (
          <div className="border-t border-night-mist">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 border-b border-night-mist last:border-b-0 hover:bg-night-soft/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-moon truncate">
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p className="text-xs text-moon-faint mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-night-mist rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zen-purple rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-moon-faint">
                        {goal.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 sm:h-9 sm:w-9 p-0 text-moon-faint hover:text-moon hover:bg-night-mist rounded-xl"
                      onClick={() => handleEdit(goal)}
                      title="Edit goal"
                      aria-label="Edit goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 sm:h-9 sm:w-9 p-0 text-moon-faint hover:text-amber-400 hover:bg-amber-400/10 rounded-xl"
                      onClick={() => setStatusAction({ goal, action: "PAUSED" })}
                      title="Pause goal"
                      aria-label="Pause goal"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 sm:h-9 sm:w-9 p-0 text-moon-faint hover:text-zen-red hover:bg-zen-red/10 rounded-xl"
                      onClick={() => setStatusAction({ goal, action: "ABANDONED" })}
                      title="Abandon goal"
                      aria-label="Abandon goal"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent className="bg-void border-night-mist">
          <DialogHeader>
            <DialogTitle className="text-moon">Edit Goal</DialogTitle>
            <DialogDescription className="text-moon-faint">
              Update your goal details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-moon-faint block mb-2">
                Title
              </label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                className="bg-night border-night-mist text-moon"
                placeholder="Goal title"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-moon-faint block mb-2">
                Description (optional)
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="bg-night border-night-mist text-moon min-h-[100px]"
                placeholder="Goal description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingGoal(null)}
              className="border-night-mist text-moon"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateGoal.isPending || !editForm.title.trim()}
              className="bg-lantern text-void hover:bg-lantern/90"
            >
              {updateGoal.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={!!statusAction} onOpenChange={() => setStatusAction(null)}>
        <DialogContent className="bg-void border-night-mist">
          <DialogHeader>
            <DialogTitle className="text-moon">
              {statusAction?.action === "PAUSED" ? "Pause Goal" : "Abandon Goal"}
            </DialogTitle>
            <DialogDescription className="text-moon-faint">
              {statusAction?.action === "PAUSED"
                ? "This goal will be paused. You can resume it later from the Goals page."
                : "This goal will be marked as abandoned. You can still view it in your goal history."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-night rounded-xl border border-night-mist">
              <p className="text-sm text-moon">{statusAction?.goal.title}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusAction(null)}
              className="border-night-mist text-moon"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={updateGoal.isPending}
              className={
                statusAction?.action === "PAUSED"
                  ? "bg-amber-500 text-void hover:bg-amber-500/90"
                  : "bg-zen-red text-void hover:bg-zen-red/90"
              }
            >
              {updateGoal.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : statusAction?.action === "PAUSED" ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Goal
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Abandon Goal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

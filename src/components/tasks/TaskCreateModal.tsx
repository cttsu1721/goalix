"use client";

import { useState } from "react";
import { useCreateTask, useGoals } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatLocalDate } from "@/lib/utils";
import { Loader2, Sparkles, Clock, AlertCircle, Lightbulb } from "lucide-react";
import type { TaskPriority, GoalCategory } from "@prisma/client";
import { AiButton, TaskSuggestModal } from "@/components/ai";
// DecisionCompassDialog removed - flexible hierarchy allows standalone tasks
import { GoalSelector } from "@/components/goals";
import type { SuggestedTask } from "@/lib/ai/schemas";
import { toast } from "sonner";

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPriority?: TaskPriority;
  scheduledDate?: string;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; shortDesc: string; description: string; points: number; color: string }
> = {
  MIT: {
    label: "MIT",
    shortDesc: "1 per day",
    description: "The ONE thing that moves the needle most. If you only complete one task today, this is it.",
    points: 100,
    color: "text-lantern",
  },
  PRIMARY: {
    label: "Primary",
    shortDesc: "Max 3",
    description: "Core tasks that meaningfully advance your goals. Keep it focused — less is more.",
    points: 50,
    color: "text-zen-green",
  },
  SECONDARY: {
    label: "Secondary",
    shortDesc: "Unlimited",
    description: "Supporting tasks, quick wins, or admin work. Nice to complete, but won't derail your day.",
    points: 25,
    color: "text-moon-soft",
  },
};

const ESTIMATED_TIME_OPTIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
];

export function TaskCreateModal({
  open,
  onOpenChange,
  defaultPriority = "SECONDARY",
  scheduledDate,
}: TaskCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(defaultPriority);
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [weeklyGoalId, setWeeklyGoalId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const createTask = useCreateTask();
  const { data: weeklyGoalsData } = useGoals("weekly");

  const weeklyGoals = (weeklyGoalsData?.goals || []) as Array<{ id: string; title: string; description?: string; category: GoalCategory }>;

  // Get selected weekly goal details for AI suggest
  const selectedWeeklyGoal = weeklyGoals.find((g) => g.id === weeklyGoalId);

  // Handle applying AI suggestion to form
  const handleApplySuggestion = (tasks: SuggestedTask[], goalId?: string) => {
    if (tasks.length > 0) {
      const task = tasks[0]; // Apply first selected task
      setTitle(task.title);
      setPriority(task.priority as TaskPriority);
      if (task.estimated_minutes) {
        setEstimatedMinutes(String(task.estimated_minutes));
      }
      // Update goal if provided from modal
      if (goalId) {
        setWeeklyGoalId(goalId);
      }
      toast.success("AI suggestion applied!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    // Flexible hierarchy: allow creating tasks with or without goal links
    const goalId = weeklyGoalId && weeklyGoalId !== "none" ? weeklyGoalId : undefined;
    await createTaskWithGoal(goalId);
  };

  const createTaskWithGoal = async (goalId?: string) => {
    const date = scheduledDate || formatLocalDate();

    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        scheduledDate: date,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        weeklyGoalId: goalId && goalId !== "none" ? goalId : undefined,
      });

      // Reset form and close modal
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(defaultPriority);
    setEstimatedMinutes("");
    setWeeklyGoalId("");
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const selectedPriorityConfig = PRIORITY_CONFIG[priority];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-night border-night-mist sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-moon text-xl font-medium">
            Create Task
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            Add a new task to your daily focus
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-moon-soft text-sm">
              Task Title <span className="text-lantern">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="bg-night-soft border-night-mist text-moon placeholder:text-moon-faint focus:border-lantern focus:ring-lantern/20"
              autoFocus
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-moon-soft text-sm">Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
                const config = PRIORITY_CONFIG[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 p-3 rounded-xl border transition-all",
                      isSelected
                        ? "border-lantern bg-lantern/10"
                        : "border-night-mist bg-night-soft hover:border-night-glow"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-lantern" : config.color
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-[10px] text-moon-faint">
                      {config.shortDesc}
                    </span>
                    <span className="text-[10px] text-moon-faint/70">
                      +{config.points} pts
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Priority description - more prominent */}
            <div className={cn(
              "p-3 rounded-lg border text-xs leading-relaxed",
              priority === "MIT" && "bg-lantern/5 border-lantern/20 text-lantern/90",
              priority === "PRIMARY" && "bg-zen-green/5 border-zen-green/20 text-zen-green/90",
              priority === "SECONDARY" && "bg-night-soft border-night-mist text-moon-dim"
            )}>
              {selectedPriorityConfig.description}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-moon-soft text-sm">
              Description{" "}
              <span className="text-moon-faint font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details or notes..."
              rows={3}
              className="bg-night-soft border-night-mist text-moon placeholder:text-moon-faint focus:border-lantern focus:ring-lantern/20 resize-none"
            />
          </div>

          {/* Estimated Time & Weekly Goal */}
          <div className="grid grid-cols-2 gap-4">
            {/* Estimated Time */}
            <div className="space-y-2">
              <Label className="text-moon-soft text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Time Estimate
              </Label>
              <Select value={estimatedMinutes} onValueChange={setEstimatedMinutes}>
                <SelectTrigger className="bg-night-soft border-night-mist text-moon focus:ring-lantern/20">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-night border-night-mist">
                  {ESTIMATED_TIME_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-moon-soft focus:bg-night-mist focus:text-moon"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weekly Goal Link */}
            <div className="space-y-2">
              <Label className="text-moon-soft text-sm">Link to Goal</Label>
              <GoalSelector
                goals={weeklyGoals}
                value={weeklyGoalId}
                onChange={setWeeklyGoalId}
                placeholder="Select goal..."
              />
            </div>
          </div>

          {/* AI Suggest Button - shows when goal is selected but no title yet */}
          {selectedWeeklyGoal && !title.trim() && (
            <div className="p-4 bg-zen-purple/5 border border-zen-purple/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zen-purple/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-zen-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-moon font-medium">Need task ideas?</p>
                    <p className="text-xs text-moon-faint">
                      Let AI suggest tasks for your weekly goal
                    </p>
                  </div>
                </div>
                <AiButton
                  onClick={() => setShowSuggestModal(true)}
                  size="sm"
                  className="bg-zen-purple text-void hover:bg-zen-purple/90"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Suggest
                </AiButton>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="bg-transparent border-night-mist text-moon-soft hover:bg-night-soft hover:text-moon"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTask.isPending || !title.trim()}
              className="bg-lantern hover:bg-lantern-soft text-void font-medium"
            >
              {createTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* AI Task Suggest Modal */}
      <TaskSuggestModal
        open={showSuggestModal}
        onOpenChange={setShowSuggestModal}
        weeklyGoals={weeklyGoals}
        initialGoalId={weeklyGoalId}
        onApply={handleApplySuggestion}
      />
    </Dialog>
  );
}

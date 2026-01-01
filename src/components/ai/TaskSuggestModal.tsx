"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskSuggest } from "@/hooks/useAI";
import type { TaskSuggestResponse, SuggestedTask } from "@/lib/ai/schemas";
import {
  Sparkles,
  Loader2,
  Star,
  Clock,
  Info,
  CheckCircle2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyGoal {
  id: string;
  title: string;
  description?: string | null;
}

interface TaskSuggestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weeklyGoals: WeeklyGoal[];
  initialGoalId?: string;
  onApply: (tasks: SuggestedTask[], weeklyGoalId?: string) => void;
}

const PRIORITY_STYLES = {
  MIT: {
    bg: "bg-lantern/10",
    border: "border-lantern/30",
    text: "text-lantern",
    badge: "bg-lantern text-void",
  },
  PRIMARY: {
    bg: "bg-zen-blue/10",
    border: "border-zen-blue/30",
    text: "text-zen-blue",
    badge: "bg-zen-blue text-void",
  },
  SECONDARY: {
    bg: "bg-night-soft",
    border: "border-night-mist",
    text: "text-moon-dim",
    badge: "bg-moon-dim text-void",
  },
};

export function TaskSuggestModal({
  open,
  onOpenChange,
  weeklyGoals,
  initialGoalId,
  onApply,
}: TaskSuggestModalProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [result, setResult] = useState<TaskSuggestResponse | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const suggest = useTaskSuggest();

  // Set initial goal when modal opens
  useEffect(() => {
    if (open && weeklyGoals.length > 0) {
      const goalId = initialGoalId || weeklyGoals[0].id;
      setSelectedGoalId(goalId);
    }
  }, [open, weeklyGoals, initialGoalId]);

  // Reset when goal changes
  useEffect(() => {
    setResult(null);
    setSelectedTasks(new Set());
  }, [selectedGoalId]);

  const selectedGoal = weeklyGoals.find((g) => g.id === selectedGoalId);

  const handleSuggest = async () => {
    if (!selectedGoal) return;

    try {
      const response = await suggest.mutateAsync({
        weeklyGoalId: selectedGoal.id,
        weeklyGoalTitle: selectedGoal.title,
        weeklyGoalDescription: selectedGoal.description || undefined,
      });
      setResult(response.data);
      // Select all tasks by default
      setSelectedTasks(new Set(response.data.tasks.map((_, i) => i)));
    } catch (error) {
      // Error handled by mutation
    }
  };

  const toggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleApply = () => {
    if (result) {
      const tasksToApply = result.tasks.filter((_, i) => selectedTasks.has(i));
      onApply(tasksToApply, selectedGoalId || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setResult(null);
      setSelectedTasks(new Set());
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-night border-night-glow max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-zen-purple/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zen-purple" />
            </div>
            <div>
              <DialogTitle className="text-moon text-lg font-medium">
                AI Task Suggester
              </DialogTitle>
              <DialogDescription className="text-moon-faint text-sm">
                Generate tasks to achieve your weekly goal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Weekly Goal Selector */}
        <div className="mt-4 p-4 bg-night-soft border border-night-mist rounded-xl">
          <div className="text-xs font-medium uppercase tracking-wider text-moon-faint mb-2">
            Weekly Goal
          </div>
          {weeklyGoals.length > 1 ? (
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
              <SelectTrigger className="bg-night border-night-mist text-moon focus:ring-lantern/20">
                <SelectValue placeholder="Select a goal..." />
              </SelectTrigger>
              <SelectContent className="bg-night border-night-mist">
                {weeklyGoals.map((goal) => (
                  <SelectItem
                    key={goal.id}
                    value={goal.id}
                    className="text-moon-soft focus:bg-night-mist focus:text-moon"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-lantern flex-shrink-0" />
                      <span className="truncate">{goal.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-moon">{selectedGoal?.title || "No goals available"}</p>
          )}
          {selectedGoal?.description && (
            <p className="text-moon-dim text-sm mt-2">{selectedGoal.description}</p>
          )}
        </div>

        {/* Loading State */}
        {suggest.isPending && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-zen-purple mx-auto mb-4" />
            <p className="text-moon-soft">Generating task suggestions...</p>
            <p className="text-xs text-moon-faint mt-1">
              Analyzing goal and creating prioritized tasks
            </p>
          </div>
        )}

        {/* Error State */}
        {suggest.isError && !suggest.isPending && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-zen-red/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <p className="text-moon mb-2">Something went wrong</p>
            <p className="text-sm text-zen-red mb-4">{suggest.error.message}</p>
            <Button
              onClick={handleSuggest}
              variant="outline"
              className="border-zen-purple/30 text-zen-purple"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Result */}
        {result && !suggest.isPending && (
          <div className="space-y-4 mt-4">
            {/* MIT Rationale */}
            <div className="p-3 bg-lantern/5 border border-lantern/20 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-lantern flex-shrink-0 mt-0.5" />
                <p className="text-sm text-moon-soft">{result.mit_rationale}</p>
              </div>
            </div>

            {/* Suggested Tasks */}
            <div className="space-y-3">
              {result.tasks
                .sort((a, b) => {
                  const priorityOrder = { MIT: 0, PRIMARY: 1, SECONDARY: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((task, index) => {
                  const styles = PRIORITY_STYLES[task.priority];
                  const isSelected = selectedTasks.has(
                    result.tasks.indexOf(task)
                  );
                  const originalIndex = result.tasks.indexOf(task);

                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer",
                        styles.bg,
                        isSelected ? styles.border : "border-transparent opacity-50"
                      )}
                      onClick={() => toggleTask(originalIndex)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTask(originalIndex)}
                          className={cn(
                            "mt-0.5",
                            task.priority === "MIT" && "border-lantern data-[state=checked]:bg-lantern",
                            task.priority === "PRIMARY" && "border-zen-blue data-[state=checked]:bg-zen-blue"
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-[0.625rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded",
                                styles.badge
                              )}
                            >
                              {task.priority}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-moon-faint">
                              <Clock className="w-3 h-3" />
                              {task.estimated_minutes} min
                            </span>
                          </div>
                          <p className={cn("font-medium", styles.text)}>
                            {task.title}
                          </p>
                          <p className="text-xs text-moon-faint mt-1">
                            {task.reasoning}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Selection summary */}
            <div className="flex items-center justify-between text-sm text-moon-faint">
              <span>{selectedTasks.size} tasks selected</span>
              <button
                onClick={() => {
                  if (selectedTasks.size === result.tasks.length) {
                    setSelectedTasks(new Set());
                  } else {
                    setSelectedTasks(new Set(result.tasks.map((_, i) => i)));
                  }
                }}
                className="text-zen-purple hover:underline"
              >
                {selectedTasks.size === result.tasks.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-night-glow">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="text-moon-dim hover:text-moon"
          >
            Cancel
          </Button>

          {!result && !suggest.isPending && (
            <Button
              onClick={handleSuggest}
              disabled={suggest.isPending}
              className="bg-zen-purple text-void hover:bg-zen-purple/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Tasks
            </Button>
          )}

          {result && (
            <Button
              onClick={handleApply}
              disabled={selectedTasks.size === 0}
              className="bg-zen-green text-void hover:bg-zen-green/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Add {selectedTasks.size} Tasks
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

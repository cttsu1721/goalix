"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateGoal } from "@/hooks";
import { GOAL_CATEGORY_LABELS } from "@/types/goals";
import type { GoalLevel } from "@/types/goals";
import type { GoalCategory } from "@prisma/client";
import { Sparkles, Target, Calendar, Layers, CheckCircle2, Loader2, Pencil, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { GoalSharpenModal } from "@/components/ai";
import type { GoalSharpenResponse } from "@/lib/ai/schemas";

interface GoalEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    title: string;
    description?: string | null;
    category: GoalCategory;
    targetDate?: Date | string | null;
  };
  level: GoalLevel;
  onSuccess?: () => void;
}

const LEVEL_CONFIG: Record<
  GoalLevel,
  { label: string; singularLabel: string; icon: React.ReactNode }
> = {
  sevenYear: {
    label: "7-Year Vision",
    singularLabel: "Vision",
    icon: <Sparkles className="w-5 h-5" />,
  },
  threeYear: {
    label: "3-Year Goal",
    singularLabel: "3-Year Goal",
    icon: <Target className="w-5 h-5" />,
  },
  oneYear: {
    label: "1-Year Goal",
    singularLabel: "1-Year Goal",
    icon: <Calendar className="w-5 h-5" />,
  },
  monthly: {
    label: "Monthly Goal",
    singularLabel: "Monthly Goal",
    icon: <Layers className="w-5 h-5" />,
  },
  weekly: {
    label: "Weekly Goal",
    singularLabel: "Weekly Goal",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
};

const CATEGORIES = Object.entries(GOAL_CATEGORY_LABELS) as [GoalCategory, string][];

// Inner form component that resets when key changes
function GoalEditForm({
  goal,
  level,
  onSuccess,
  onClose,
}: {
  goal: GoalEditModalProps["goal"];
  level: GoalLevel;
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || "");
  const [category, setCategory] = useState<GoalCategory>(goal.category);
  const [targetDate, setTargetDate] = useState(() => {
    if (!goal.targetDate) return "";
    const date = new Date(goal.targetDate);
    return date.toISOString().split("T")[0];
  });
  const [showSharpenModal, setShowSharpenModal] = useState(false);

  const updateGoal = useUpdateGoal();
  const config = LEVEL_CONFIG[level];

  const handleApplySharpen = (result: GoalSharpenResponse) => {
    setTitle(result.sharpened_title);
    setDescription(result.description);
    toast.success("AI suggestions applied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetDate: targetDate || undefined,
      });

      toast.success(`${config.singularLabel} updated!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update goal"
      );
    }
  };

  return (
    <>
      {/* Header with gradient accent */}
      <div className="relative">
        {/* Subtle top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lantern/40 to-transparent" />

        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            {/* Icon container with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-lantern/20 blur-xl rounded-full" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-lantern/20 to-lantern/5 border border-lantern/20 flex items-center justify-center text-lantern">
                <Pencil className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-moon text-xl font-semibold tracking-tight">
                Edit {config.singularLabel}
              </DialogTitle>
              <p className="text-sm text-moon-dim mt-1 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-lantern/60" />
                Update goal details
              </p>
            </div>
          </div>
        </DialogHeader>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
        {/* Title Field */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="title" className="text-moon-soft text-sm font-medium">
              Title <span className="text-lantern">*</span>
            </Label>
            {title.trim() && (
              <button
                type="button"
                onClick={() => setShowSharpenModal(true)}
                className="flex items-center gap-1.5 text-xs text-zen-purple hover:text-zen-purple/80 transition-colors"
              >
                <Wand2 className="w-3 h-3" />
                <span>Sharpen with AI</span>
              </button>
            )}
          </div>
          <div className="relative group">
            <Input
              id="title"
              placeholder="Goal title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(
                "h-12 px-4 bg-night-soft/50 border-night-mist/50 text-moon",
                "placeholder:text-moon-faint/60 rounded-xl",
                "focus:border-lantern/50 focus:bg-night-soft focus:ring-1 focus:ring-lantern/20",
                "transition-all duration-200"
              )}
              autoFocus
            />
            {/* Focus glow effect */}
            <div className="absolute inset-0 rounded-xl bg-lantern/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2.5">
          <Label htmlFor="description" className="text-moon-soft text-sm font-medium">
            Description
            <span className="text-moon-faint font-normal ml-2">(optional)</span>
          </Label>
          <textarea
            id="description"
            placeholder="Add more details about this goal..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-night-soft/50 border border-night-mist/50 text-moon",
              "placeholder:text-moon-faint/60",
              "focus:outline-none focus:border-lantern/50 focus:bg-night-soft focus:ring-1 focus:ring-lantern/20",
              "resize-none text-sm leading-relaxed",
              "transition-all duration-200"
            )}
          />
        </div>

        {/* Category & Date Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2.5">
            <Label className="text-moon-soft text-sm font-medium">
              Category <span className="text-lantern">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as GoalCategory)}
            >
              <SelectTrigger
                className={cn(
                  "h-12 px-4 bg-night-soft/50 border-night-mist/50 text-moon rounded-xl",
                  "focus:border-lantern/50 focus:ring-1 focus:ring-lantern/20",
                  "transition-all duration-200"
                )}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-night border-night-mist/50 rounded-xl shadow-xl shadow-black/50">
                {CATEGORIES.map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="text-moon-soft focus:bg-night-glow focus:text-moon rounded-lg"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Date */}
          {(level === "sevenYear" || level === "threeYear" || level === "oneYear") && (
            <div className="space-y-2.5">
              <Label htmlFor="targetDate" className="text-moon-soft text-sm font-medium">
                Target Date
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={cn(
                  "h-12 px-4 bg-night-soft/50 border-night-mist/50 text-moon rounded-xl",
                  "focus:border-lantern/50 focus:ring-1 focus:ring-lantern/20",
                  "transition-all duration-200",
                  "[color-scheme:dark]"
                )}
              />
            </div>
          )}

          {/* Target Month (for monthly goals) */}
          {level === "monthly" && (
            <div className="space-y-2.5">
              <Label htmlFor="targetMonth" className="text-moon-soft text-sm font-medium">
                Target Month
              </Label>
              <Input
                id="targetMonth"
                type="month"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={cn(
                  "h-12 px-4 bg-night-soft/50 border-night-mist/50 text-moon rounded-xl",
                  "focus:border-lantern/50 focus:ring-1 focus:ring-lantern/20",
                  "transition-all duration-200",
                  "[color-scheme:dark]"
                )}
              />
            </div>
          )}

          {/* Week Start (for weekly goals) */}
          {level === "weekly" && (
            <div className="space-y-2.5">
              <Label htmlFor="weekStart" className="text-moon-soft text-sm font-medium">
                Week Starting
              </Label>
              <Input
                id="weekStart"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={cn(
                  "h-12 px-4 bg-night-soft/50 border-night-mist/50 text-moon rounded-xl",
                  "focus:border-lantern/50 focus:ring-1 focus:ring-lantern/20",
                  "transition-all duration-200",
                  "[color-scheme:dark]"
                )}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-night-mist/30">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-11 px-5 text-moon-dim hover:text-moon hover:bg-night-soft/50 rounded-xl transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateGoal.isPending || !title.trim()}
            className={cn(
              "h-11 px-6 rounded-xl font-medium",
              "bg-lantern hover:bg-lantern/90 text-void",
              "shadow-lg shadow-lantern/20 hover:shadow-lantern/30",
              "disabled:opacity-40 disabled:shadow-none",
              "transition-all duration-200"
            )}
          >
            {updateGoal.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </Button>
        </div>
      </form>

      {/* AI Goal Sharpener Modal */}
      <GoalSharpenModal
        open={showSharpenModal}
        onOpenChange={setShowSharpenModal}
        goalTitle={title}
        goalCategory={category}
        onApply={handleApplySharpen}
      />
    </>
  );
}

export function GoalEditModal({
  open,
  onOpenChange,
  goal,
  level,
  onSuccess,
}: GoalEditModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-night border-night-mist/50 max-w-lg p-0 overflow-hidden shadow-2xl shadow-black/50">
        {/* Use key to reset form state when goal changes */}
        <GoalEditForm
          key={goal.id}
          goal={goal}
          level={level}
          onSuccess={onSuccess}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

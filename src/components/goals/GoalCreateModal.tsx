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
import { useCreateGoal } from "@/hooks";
import { GOAL_CATEGORY_LABELS } from "@/types/goals";
import type { GoalLevel } from "@/types/goals";
import type { GoalCategory } from "@prisma/client";
import { Sparkles, Target, Calendar, Layers, CheckCircle2, Loader2, Wand2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { AiButton, GoalSharpenModal, GoalSuggestModal } from "@/components/ai";
import type { GoalSharpenResponse, SuggestedGoal } from "@/lib/ai/schemas";
import type { GoalLevelForSuggestion } from "@/lib/ai/prompts";

interface GoalCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: GoalLevel;
  parentId?: string;
  parentTitle?: string;
  onSuccess?: () => void;
}

const LEVEL_CONFIG: Record<
  GoalLevel,
  { label: string; singularLabel: string; icon: React.ReactNode; placeholder: string }
> = {
  dream: {
    label: "10-Year Dream",
    singularLabel: "Dream",
    icon: <Sparkles className="w-5 h-5" />,
    placeholder: "e.g., Achieve financial freedom with $2M net worth",
  },
  fiveYear: {
    label: "5-Year Goal",
    singularLabel: "5-Year Goal",
    icon: <Target className="w-5 h-5" />,
    placeholder: "e.g., Build a $500K investment portfolio",
  },
  oneYear: {
    label: "1-Year Goal",
    singularLabel: "1-Year Goal",
    icon: <Calendar className="w-5 h-5" />,
    placeholder: "e.g., Save $50K and max out retirement accounts",
  },
  monthly: {
    label: "Monthly Goal",
    singularLabel: "Monthly Goal",
    icon: <Layers className="w-5 h-5" />,
    placeholder: "e.g., Save $4,000 this month",
  },
  weekly: {
    label: "Weekly Goal",
    singularLabel: "Weekly Goal",
    icon: <CheckCircle2 className="w-5 h-5" />,
    placeholder: "e.g., Review budget and cut unnecessary expenses",
  },
};

const CATEGORIES = Object.entries(GOAL_CATEGORY_LABELS) as [GoalCategory, string][];

export function GoalCreateModal({
  open,
  onOpenChange,
  level,
  parentId,
  parentTitle,
  onSuccess,
}: GoalCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory | "">("");
  const [targetDate, setTargetDate] = useState("");
  const [showSharpenModal, setShowSharpenModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const createGoal = useCreateGoal();
  const config = LEVEL_CONFIG[level];

  // Map GoalLevel to GoalLevelForSuggestion (they're the same, but typed differently)
  const levelForSuggestion: GoalLevelForSuggestion = level as GoalLevelForSuggestion;

  // Determine parent level for cascading context
  const getParentLevel = (): GoalLevelForSuggestion | undefined => {
    switch (level) {
      case "fiveYear":
        return "dream";
      case "oneYear":
        return "fiveYear";
      case "monthly":
        return "oneYear";
      case "weekly":
        return "monthly";
      default:
        return undefined;
    }
  };

  const handleApplySharpen = (result: GoalSharpenResponse) => {
    setTitle(result.sharpened_title);
    setDescription(result.description);
    toast.success("AI suggestions applied!");
  };

  const handleApplySuggest = (suggestion: SuggestedGoal) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    toast.success("AI suggestion applied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createGoal.mutateAsync({
        level,
        parentId,
        title: title.trim(),
        description: description.trim() || undefined,
        category: category as GoalCategory,
        targetDate: targetDate || undefined,
        // For monthly/weekly, we'd need targetMonth/weekStart
        ...(level === "monthly" && targetDate && { targetMonth: targetDate }),
        ...(level === "weekly" && targetDate && { weekStart: targetDate }),
      });

      toast.success(`${config.singularLabel} created!`);
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create goal"
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after animation
    setTimeout(() => {
      setTitle("");
      setDescription("");
      setCategory("");
      setTargetDate("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-night border-night-glow max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-lantern/10 flex items-center justify-center text-lantern">
              {config.icon}
            </div>
            <div>
              <DialogTitle className="text-moon text-lg font-medium">
                Create {config.singularLabel}
              </DialogTitle>
              {parentTitle && (
                <p className="text-xs text-moon-faint mt-0.5">
                  Under: {parentTitle}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-moon-soft text-sm">
                Title <span className="text-zen-red">*</span>
              </Label>
              {title.trim() && (
                <AiButton
                  onClick={() => setShowSharpenModal(true)}
                  size="sm"
                  variant="ghost"
                  showUsage={false}
                  className="h-7 text-xs"
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Sharpen
                </AiButton>
              )}
            </div>
            <Input
              id="title"
              placeholder={config.placeholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-night-soft border-night-glow text-moon placeholder:text-moon-faint focus:border-lantern h-11"
              autoFocus
            />
          </div>

          {/* AI Suggest Button - shows when no title yet */}
          {!title.trim() && (
            <div className="p-4 bg-lantern/5 border border-lantern/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-lantern/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-lantern" />
                  </div>
                  <div>
                    <p className="text-sm text-moon font-medium">Need inspiration?</p>
                    <p className="text-xs text-moon-faint">
                      Let AI suggest {config.singularLabel.toLowerCase()}s for you
                    </p>
                  </div>
                </div>
                <AiButton
                  onClick={() => setShowSuggestModal(true)}
                  size="sm"
                  className="bg-lantern text-void hover:bg-lantern/90"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Suggest
                </AiButton>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-moon-soft text-sm">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Add more details about this goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                "w-full px-3 py-2 rounded-lg",
                "bg-night-soft border border-night-glow text-moon placeholder:text-moon-faint",
                "focus:outline-none focus:border-lantern",
                "resize-none text-sm"
              )}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-moon-soft text-sm">
              Category <span className="text-zen-red">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as GoalCategory)}
            >
              <SelectTrigger className="bg-night-soft border-night-glow text-moon h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-night-soft border-night-glow">
                {CATEGORIES.map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-moon">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Date (for dreams, 5-year, 1-year goals) */}
          {(level === "dream" || level === "fiveYear" || level === "oneYear") && (
            <div className="space-y-2">
              <Label htmlFor="targetDate" className="text-moon-soft text-sm">
                Target Date
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-night-soft border-night-glow text-moon focus:border-lantern h-11"
              />
            </div>
          )}

          {/* Target Month (for monthly goals) */}
          {level === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="targetMonth" className="text-moon-soft text-sm">
                Target Month <span className="text-zen-red">*</span>
              </Label>
              <Input
                id="targetMonth"
                type="month"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-night-soft border-night-glow text-moon focus:border-lantern h-11"
              />
            </div>
          )}

          {/* Week Start (for weekly goals) */}
          {level === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="weekStart" className="text-moon-soft text-sm">
                Week Starting <span className="text-zen-red">*</span>
              </Label>
              <Input
                id="weekStart"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-night-soft border-night-glow text-moon focus:border-lantern h-11"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-night-glow">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-moon-dim hover:text-moon"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGoal.isPending || !title.trim() || !category}
              className="bg-lantern text-void hover:bg-lantern/90"
            >
              {createGoal.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create {config.singularLabel}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* AI Goal Sharpener Modal */}
      <GoalSharpenModal
        open={showSharpenModal}
        onOpenChange={setShowSharpenModal}
        goalTitle={title}
        goalCategory={category || undefined}
        onApply={handleApplySharpen}
      />

      {/* AI Goal Suggest Modal */}
      <GoalSuggestModal
        open={showSuggestModal}
        onOpenChange={setShowSuggestModal}
        level={levelForSuggestion}
        category={category || "OTHER"}
        parentId={parentId}
        parentLevel={getParentLevel()}
        parentTitle={parentTitle}
        onSelect={handleApplySuggest}
      />
    </Dialog>
  );
}

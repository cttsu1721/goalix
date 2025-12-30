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
import { Sparkles, Target, Calendar, Layers, CheckCircle2, Loader2, Wand2, Stars } from "lucide-react";
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
  { label: string; singularLabel: string; icon: React.ReactNode; placeholder: string; accentColor: string }
> = {
  dream: {
    label: "10-Year Dream",
    singularLabel: "Dream",
    icon: <Sparkles className="w-5 h-5" />,
    placeholder: "e.g., Achieve financial freedom with $2M net worth",
    accentColor: "lantern",
  },
  fiveYear: {
    label: "5-Year Goal",
    singularLabel: "5-Year Goal",
    icon: <Target className="w-5 h-5" />,
    placeholder: "e.g., Build a $500K investment portfolio",
    accentColor: "zen-purple",
  },
  oneYear: {
    label: "1-Year Goal",
    singularLabel: "1-Year Goal",
    icon: <Calendar className="w-5 h-5" />,
    placeholder: "e.g., Save $50K and max out retirement accounts",
    accentColor: "zen-blue",
  },
  monthly: {
    label: "Monthly Goal",
    singularLabel: "Monthly Goal",
    icon: <Layers className="w-5 h-5" />,
    placeholder: "e.g., Save $4,000 this month",
    accentColor: "zen-green",
  },
  weekly: {
    label: "Weekly Goal",
    singularLabel: "Weekly Goal",
    icon: <CheckCircle2 className="w-5 h-5" />,
    placeholder: "e.g., Review budget and cut unnecessary expenses",
    accentColor: "moon-soft",
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
      <DialogContent className="bg-night border-night-mist/50 max-w-lg p-0 overflow-hidden shadow-2xl shadow-black/50">
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
                  {config.icon}
                </div>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-moon text-xl font-semibold tracking-tight">
                  Create {config.singularLabel}
                </DialogTitle>
                {parentTitle && (
                  <p className="text-sm text-moon-dim mt-1 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-lantern/60" />
                    {parentTitle}
                  </p>
                )}
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
                placeholder={config.placeholder}
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

          {/* AI Suggestion Card - Premium Design */}
          {!title.trim() && (
            <div className="relative overflow-hidden rounded-2xl">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-lantern/10 via-lantern/5 to-transparent" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-lantern/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative p-5 border border-lantern/20 rounded-2xl backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Animated stars icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-lantern/10 flex items-center justify-center">
                        <Stars className="w-5 h-5 text-lantern animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[15px] text-moon font-medium">
                        Need inspiration?
                      </p>
                      <p className="text-sm text-moon-dim leading-relaxed">
                        Let AI suggest {config.singularLabel.toLowerCase()}s based on your goals
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowSuggestModal(true)}
                    className={cn(
                      "h-9 px-4 rounded-xl font-medium text-sm",
                      "bg-lantern hover:bg-lantern/90 text-void",
                      "shadow-lg shadow-lantern/20 hover:shadow-lantern/30",
                      "transition-all duration-200"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Suggest
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                    "transition-all duration-200",
                    !category && "text-moon-faint/60"
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
            {(level === "dream" || level === "fiveYear" || level === "oneYear") && (
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
                  Target Month <span className="text-lantern">*</span>
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
                  Week Starting <span className="text-lantern">*</span>
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
              onClick={handleClose}
              className="h-11 px-5 text-moon-dim hover:text-moon hover:bg-night-soft/50 rounded-xl transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGoal.isPending || !title.trim() || !category}
              className={cn(
                "h-11 px-6 rounded-xl font-medium",
                "bg-lantern hover:bg-lantern/90 text-void",
                "shadow-lg shadow-lantern/20 hover:shadow-lantern/30",
                "disabled:opacity-40 disabled:shadow-none",
                "transition-all duration-200"
              )}
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

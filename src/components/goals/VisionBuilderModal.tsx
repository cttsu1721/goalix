"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVisionBuilder } from "@/hooks";
import { VisionBuilderPreview } from "./VisionBuilderPreview";
import { GOAL_CATEGORY_LABELS } from "@/types/goals";
import type { GoalCategory } from "@prisma/client";
import {
  Sparkles,
  Wand2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VisionBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = Object.entries(GOAL_CATEGORY_LABELS) as [GoalCategory, string][];

export function VisionBuilderModal({ open, onOpenChange }: VisionBuilderModalProps) {
  const router = useRouter();
  const {
    step,
    idea,
    setIdea,
    category,
    setCategory,
    hierarchy,
    createdVisionId,
    generateHierarchy,
    createAllGoals,
    updateGoal,
    removeThreeYearGoal,
    removeOneYearGoal,
    reset,
    goBackToInput,
    getTotalGoals,
    isGenerating,
    isCreating,
    generateError,
    createError,
  } = useVisionBuilder();

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Show errors
  useEffect(() => {
    if (generateError) {
      toast.error(generateError);
    }
    if (createError) {
      toast.error(createError);
    }
  }, [generateError, createError]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleViewVision = () => {
    if (createdVisionId) {
      router.push(`/goals/${createdVisionId}`);
      handleClose();
    }
  };

  const totalGoals = getTotalGoals();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "bg-night border-night-mist/50 p-0 overflow-hidden shadow-2xl shadow-black/50",
          step === "preview" || step === "creating" ? "max-w-4xl w-[95vw] max-h-[85vh]" : "max-w-lg"
        )}
      >
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lantern/40 to-transparent" />
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-lantern/20 blur-xl rounded-full" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-lantern/20 to-lantern/5 border border-lantern/20 flex items-center justify-center">
                  {step === "success" ? (
                    <PartyPopper className="w-5 h-5 text-lantern" />
                  ) : (
                    <Wand2 className="w-5 h-5 text-lantern" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-moon text-xl font-semibold tracking-tight">
                  {step === "success" ? "Vision Created!" : "Vision Builder"}
                </DialogTitle>
                <p className="text-sm text-moon-dim mt-1">
                  {step === "input" && "Describe your vision and AI will build your goal hierarchy"}
                  {step === "preview" && `Review and edit ${totalGoals} goals before creating`}
                  {step === "creating" && "Creating your goals..."}
                  {step === "success" && `${totalGoals} goals created successfully!`}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Step 1: Input */}
          {step === "input" && (
            <div className="space-y-5">
              {/* Vision Idea */}
              <div className="space-y-2.5">
                <Label className="text-moon-soft text-sm font-medium">
                  What&apos;s your vision? <span className="text-lantern">*</span>
                </Label>
                <div className="relative">
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your 7-year vision... e.g., 'I want to achieve financial freedom and travel the world while running a successful online business'"
                    rows={4}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl",
                      "bg-night-soft/50 border border-night-mist/50 text-moon",
                      "placeholder:text-moon-faint/60",
                      "focus:outline-none focus:border-lantern/50 focus:bg-night-soft focus:ring-1 focus:ring-lantern/20",
                      "resize-none text-sm leading-relaxed",
                      "transition-all duration-200"
                    )}
                    autoFocus
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-moon-faint">
                    {idea.length} / 500
                  </div>
                </div>
              </div>

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

              {/* Info Card */}
              <div className="p-4 rounded-xl bg-night-soft/30 border border-night-mist/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-lantern flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-moon font-medium">AI will generate:</p>
                    <ul className="text-xs text-moon-dim mt-1 space-y-0.5">
                      <li>• 1 refined 7-Year Vision</li>
                      <li>• 2-3 Three-Year Goals</li>
                      <li>• 2 One-Year Goals per 3-year</li>
                      <li>• Monthly & Weekly goals for each</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-night-mist/30">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="h-11 px-5 text-moon-dim hover:text-moon hover:bg-night-soft/50 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateHierarchy}
                  disabled={isGenerating || idea.trim().length < 10 || !category}
                  className={cn(
                    "h-11 px-6 rounded-xl font-medium",
                    "bg-lantern hover:bg-lantern/90 text-void",
                    "shadow-lg shadow-lantern/20 hover:shadow-lantern/30",
                    "disabled:opacity-40 disabled:shadow-none"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Hierarchy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {(step === "preview" || step === "creating") && hierarchy && (
            <div className="space-y-4">
              {/* Scrollable preview area */}
              <div className="max-h-[50vh] overflow-y-auto pr-2 -mr-2">
                <VisionBuilderPreview
                  hierarchy={hierarchy}
                  onUpdate={updateGoal}
                  onRemoveThreeYear={removeThreeYearGoal}
                  onRemoveOneYear={removeOneYearGoal}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-night-mist/30">
                <Button
                  variant="ghost"
                  onClick={goBackToInput}
                  disabled={isCreating}
                  className="h-11 px-5 text-moon-dim hover:text-moon hover:bg-night-soft/50 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      reset();
                      setIdea(idea);
                      setCategory(category);
                      generateHierarchy();
                    }}
                    disabled={isCreating}
                    className="h-11 px-5 text-moon-dim hover:text-moon hover:bg-night-soft/50 rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={createAllGoals}
                    disabled={isCreating}
                    className={cn(
                      "h-11 px-6 rounded-xl font-medium",
                      "bg-zen-green hover:bg-zen-green/90 text-void",
                      "shadow-lg shadow-zen-green/20 hover:shadow-zen-green/30",
                      "disabled:opacity-40 disabled:shadow-none"
                    )}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating {totalGoals} goals...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Create All ({totalGoals} goals)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="py-6 text-center space-y-6">
              {/* Success animation */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-zen-green/20 blur-xl rounded-full animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-zen-green/10 border border-zen-green/30 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-zen-green" />
                </div>
              </div>

              <div>
                <p className="text-lg font-semibold text-moon">
                  Your goal hierarchy is ready!
                </p>
                <p className="text-sm text-moon-dim mt-1">
                  {totalGoals} goals created across all levels
                </p>
              </div>

              {/* Quick summary */}
              {hierarchy && (
                <div className="p-4 rounded-xl bg-night-soft/30 border border-night-mist/30 text-left">
                  <p className="text-xs font-medium text-moon-dim mb-2">Created:</p>
                  <p className="text-sm text-moon font-medium">{hierarchy.vision.title}</p>
                  <p className="text-xs text-moon-dim mt-1">
                    + {hierarchy.threeYearGoals.length} three-year goals with full cascades
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="h-11 px-5 text-moon-dim hover:text-moon hover:bg-night-soft/50 rounded-xl"
                >
                  Close
                </Button>
                <Button
                  onClick={handleViewVision}
                  className={cn(
                    "h-11 px-6 rounded-xl font-medium",
                    "bg-lantern hover:bg-lantern/90 text-void",
                    "shadow-lg shadow-lantern/20 hover:shadow-lantern/30"
                  )}
                >
                  View Vision
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Backward compatibility alias
export const DreamBuilderModal = VisionBuilderModal;

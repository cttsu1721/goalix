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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Plus,
  X,
  Target,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ListTodo,
} from "lucide-react";
import { toast } from "sonner";

// Goal level types
type GoalLevel = "oneYear" | "monthly" | "weekly";

interface ParentGoal {
  id: string;
  title: string;
  description?: string | null;
  level: GoalLevel;
}

interface GeneratedGoal {
  title: string;
  description?: string;
  selected: boolean;
}

interface GoalCascadeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentGoal: ParentGoal | null;
  onComplete?: (createdCount: number) => void;
}

// Level info
const LEVEL_INFO: Record<GoalLevel, { name: string; child: string; childLevel: GoalLevel | "task"; icon: typeof Target }> = {
  oneYear: { name: "1-Year Goal", child: "Monthly Goals", childLevel: "monthly", icon: Target },
  monthly: { name: "Monthly Goal", child: "Weekly Goals", childLevel: "weekly", icon: Calendar },
  weekly: { name: "Weekly Goal", child: "Daily Tasks", childLevel: "task", icon: CalendarDays },
};

export function GoalCascadeWizard({
  open,
  onOpenChange,
  parentGoal,
  onComplete,
}: GoalCascadeWizardProps) {
  const [step, setStep] = useState<"suggest" | "review" | "creating" | "success">("suggest");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGoals, setGeneratedGoals] = useState<GeneratedGoal[]>([]);
  const [manualGoal, setManualGoal] = useState("");
  const [createdCount, setCreatedCount] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep("suggest");
      setIsGenerating(false);
      setGeneratedGoals([]);
      setManualGoal("");
      setCreatedCount(0);
    }
  }, [open]);

  if (!parentGoal) return null;

  const levelInfo = LEVEL_INFO[parentGoal.level];
  const isWeeklyGoal = parentGoal.level === "weekly";

  // Generate child goals/tasks using AI
  const handleGenerateSuggestions = async () => {
    if (!parentGoal) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/cascade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentGoalId: parentGoal.id,
          parentGoalTitle: parentGoal.title,
          parentGoalDescription: parentGoal.description,
          parentLevel: parentGoal.level,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate suggestions");
      }

      const data = await response.json();
      setGeneratedGoals(
        data.suggestions.map((s: { title: string; description?: string }) => ({
          ...s,
          selected: true,
        }))
      );
      setStep("review");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate suggestions";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Skip AI and go straight to manual entry
  const handleSkipToManual = () => {
    setGeneratedGoals([]);
    setStep("review");
  };

  // Add manual goal/task
  const handleAddManual = () => {
    if (!manualGoal.trim()) return;
    setGeneratedGoals((prev) => [
      ...prev,
      { title: manualGoal.trim(), selected: true },
    ]);
    setManualGoal("");
  };

  // Toggle goal selection
  const toggleGoalSelection = (index: number) => {
    setGeneratedGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, selected: !g.selected } : g))
    );
  };

  // Remove a goal from the list
  const removeGoal = (index: number) => {
    setGeneratedGoals((prev) => prev.filter((_, i) => i !== index));
  };

  // Create the selected goals/tasks
  const handleCreate = async () => {
    const selectedGoals = generatedGoals.filter((g) => g.selected);
    if (selectedGoals.length === 0) {
      toast.error("Select at least one item to create");
      return;
    }

    setStep("creating");

    try {
      const response = await fetch("/api/goals/cascade-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentGoalId: parentGoal.id,
          parentLevel: parentGoal.level,
          children: selectedGoals.map((g) => ({
            title: g.title,
            description: g.description,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create goals");
      }

      const data = await response.json();
      setCreatedCount(data.createdCount);
      setStep("success");
      toast.success(`Created ${data.createdCount} ${isWeeklyGoal ? "task" : "goal"}${data.createdCount !== 1 ? "s" : ""}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create goals";
      toast.error(message);
      setStep("review");
    } finally {
      // No cleanup needed
    }
  };

  const handleClose = () => {
    if (step === "success" && createdCount > 0) {
      onComplete?.(createdCount);
    }
    onOpenChange(false);
  };

  const selectedCount = generatedGoals.filter((g) => g.selected).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-night border-night-glow max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zen-purple/20 to-zen-indigo/20 flex items-center justify-center">
              <ChevronDown className="w-6 h-6 text-zen-purple" />
            </div>
            <div>
              <DialogTitle className="text-moon text-xl">
                Break Down Goal
              </DialogTitle>
              <DialogDescription className="text-moon-dim">
                Create {levelInfo.child.toLowerCase()} from your {levelInfo.name.toLowerCase()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Parent Goal Display */}
        <div className="p-3 bg-night-soft/50 rounded-xl border border-night-glow mb-4">
          <div className="flex items-center gap-2 text-xs text-moon-dim mb-1">
            <levelInfo.icon className="w-3.5 h-3.5" />
            {levelInfo.name}
          </div>
          <div className="text-moon font-medium">{parentGoal.title}</div>
          {parentGoal.description && (
            <div className="text-sm text-moon-dim mt-1 line-clamp-2">
              {parentGoal.description}
            </div>
          )}
        </div>

        {/* Step 1: Suggest */}
        {step === "suggest" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-zen-purple/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-zen-purple" />
              </div>
              <p className="text-moon mb-2">
                Let AI suggest {levelInfo.child.toLowerCase()} for you
              </p>
              <p className="text-sm text-moon-dim">
                Or skip and add your own manually
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipToManual}
                className="flex-1 border-night-glow text-moon hover:bg-night-soft"
                disabled={isGenerating}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manually
              </Button>
              <Button
                onClick={handleGenerateSuggestions}
                className="flex-1 bg-zen-purple text-void hover:bg-zen-purple/90"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Review & Edit */}
        {step === "review" && (
          <div className="space-y-4">
            {/* Manual input */}
            <div className="flex gap-2">
              <Input
                value={manualGoal}
                onChange={(e) => setManualGoal(e.target.value)}
                placeholder={`Add ${isWeeklyGoal ? "a task" : "a goal"}...`}
                className="bg-night-soft border-night-glow text-moon"
                onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
              />
              <Button
                size="icon"
                onClick={handleAddManual}
                disabled={!manualGoal.trim()}
                className="bg-zen-green text-void hover:bg-zen-green/90 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Goals list */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {generatedGoals.length === 0 ? (
                <div className="text-center py-8 text-moon-dim">
                  <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No {isWeeklyGoal ? "tasks" : "goals"} yet</p>
                  <p className="text-xs mt-1">Add some above or use AI suggestions</p>
                </div>
              ) : (
                generatedGoals.map((goal, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      goal.selected
                        ? "bg-zen-purple/10 border-zen-purple/30"
                        : "bg-night-soft/30 border-night-glow opacity-60"
                    )}
                  >
                    <button
                      onClick={() => toggleGoalSelection(index)}
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                        goal.selected
                          ? "bg-zen-purple border-zen-purple"
                          : "border-night-glow hover:border-zen-purple/50"
                      )}
                    >
                      {goal.selected && <CheckCircle2 className="w-3 h-3 text-void" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-moon truncate">{goal.title}</div>
                      {goal.description && (
                        <div className="text-xs text-moon-dim truncate">
                          {goal.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeGoal(index)}
                      className="p-1 rounded-lg hover:bg-night-glow text-moon-dim hover:text-zen-red shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-night-glow">
              <Button
                variant="ghost"
                onClick={() => setStep("suggest")}
                className="text-moon-dim hover:text-moon"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="bg-zen-purple/20 text-zen-purple">
                    {selectedCount} selected
                  </Badge>
                )}
                <Button
                  onClick={handleCreate}
                  disabled={selectedCount === 0}
                  className="bg-zen-green text-void hover:bg-zen-green/90"
                >
                  Create {selectedCount} {isWeeklyGoal ? "Task" : "Goal"}
                  {selectedCount !== 1 ? "s" : ""}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Creating */}
        {step === "creating" && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-zen-purple animate-spin" />
            <p className="text-moon">Creating {isWeeklyGoal ? "tasks" : "goals"}...</p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zen-green/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-zen-green" />
            </div>
            <div>
              <p className="text-lg text-moon font-medium">
                {createdCount} {isWeeklyGoal ? "Task" : "Goal"}
                {createdCount !== 1 ? "s" : ""} Created!
              </p>
              <p className="text-sm text-moon-dim mt-1">
                Your {levelInfo.name.toLowerCase()} now has actionable steps
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="bg-lantern text-void hover:bg-lantern/90"
            >
              Done
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

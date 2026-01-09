"use client";

import { useState } from "react";
import { cn, formatLocalDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoals, useCreateTask } from "@/hooks";
import { ArrowRight, ArrowLeft, Plus, X, Sparkles, Check, Star, CircleDot } from "lucide-react";
import type { TaskPriority } from "@prisma/client";

interface PlanDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: string;
  onComplete?: () => void;
}

interface TaskDraft {
  id: string;
  title: string;
  priority: TaskPriority;
  weeklyGoalId?: string;
}

const STEPS = [
  { id: 1, title: "Your MIT", subtitle: "Most Important Task" },
  { id: 2, title: "Primary Tasks", subtitle: "Up to 3 core tasks" },
  { id: 3, title: "Secondary Tasks", subtitle: "Optional extras" },
  { id: 4, title: "Review", subtitle: "Confirm your plan" },
];

export function PlanDayModal({
  open,
  onOpenChange,
  date,
  onComplete,
}: PlanDayModalProps) {
  const today = date || formatLocalDate();
  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState<TaskDraft[]>([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentGoalId, setCurrentGoalId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: goalsData } = useGoals("weekly");
  const createTask = useCreateTask();

  const weeklyGoals = (goalsData?.goals || []) as Array<{ id: string; title: string }>;

  const mitTask = tasks.find((t) => t.priority === "MIT");
  const primaryTasks = tasks.filter((t) => t.priority === "PRIMARY");
  const secondaryTasks = tasks.filter((t) => t.priority === "SECONDARY");

  const addTask = (priority: TaskPriority) => {
    if (!currentTitle.trim()) return;

    // For MIT, replace existing if any
    if (priority === "MIT") {
      setTasks((prev) => [
        ...prev.filter((t) => t.priority !== "MIT"),
        {
          id: crypto.randomUUID(),
          title: currentTitle.trim(),
          priority,
          weeklyGoalId: currentGoalId || undefined,
        },
      ]);
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: currentTitle.trim(),
          priority,
          weeklyGoalId: currentGoalId || undefined,
        },
      ]);
    }
    setCurrentTitle("");
    setCurrentGoalId("");
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!mitTask;
      case 2:
        return true; // Primary tasks are optional
      case 3:
        return true; // Secondary tasks are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create all tasks
      for (const task of tasks) {
        await createTask.mutateAsync({
          title: task.title,
          priority: task.priority,
          scheduledDate: today,
          weeklyGoalId: task.weeklyGoalId,
        });
      }
      onComplete?.();
      onOpenChange(false);
      // Reset state
      setStep(1);
      setTasks([]);
    } catch (error) {
      console.error("Failed to create tasks:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setTasks([]);
      setCurrentTitle("");
      setCurrentGoalId("");
    }, 200);
  };

  // Render task input form (inline to avoid component recreation)
  const renderTaskInput = (priority: TaskPriority) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder={
            priority === "MIT"
              ? "What's the ONE thing that will make today a success?"
              : "Add a task..."
          }
          value={currentTitle}
          onChange={(e) => setCurrentTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && currentTitle.trim()) {
              addTask(priority);
            }
          }}
          className="bg-night border-night-glow text-moon placeholder:text-moon-faint focus:border-lantern h-12"
        />
      </div>

      <div className="flex gap-3">
        <Select
          value={currentGoalId || "none"}
          onValueChange={(val) => setCurrentGoalId(val === "none" ? "" : val)}
        >
          <SelectTrigger className="flex-1 bg-night border-night-glow text-moon">
            <SelectValue placeholder="Link to weekly goal (optional)" />
          </SelectTrigger>
          <SelectContent className="bg-night-soft border-night-glow">
            <SelectItem value="none" className="text-moon-dim">
              No goal linked
            </SelectItem>
            {weeklyGoals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id} className="text-moon">
                {goal.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => addTask(priority)}
          disabled={!currentTitle.trim()}
          className="bg-lantern text-void hover:bg-lantern/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );

  // Render task preview (inline to avoid component recreation)
  const renderTaskPreview = (task: TaskDraft) => (
    <div
      key={task.id}
      className="flex items-center gap-3 p-3 bg-night-soft rounded-xl border border-night-glow group"
    >
      <div
        className="flex-shrink-0"
        title={task.priority === "MIT" ? "MIT" : task.priority === "PRIMARY" ? "Primary" : "Secondary"}
      >
        {task.priority === "MIT" ? (
          <Sparkles className="w-3.5 h-3.5 text-lantern" />
        ) : task.priority === "PRIMARY" ? (
          <Star className="w-3.5 h-3.5 text-zen-green" />
        ) : (
          <CircleDot className="w-3.5 h-3.5 text-moon-dim" />
        )}
      </div>
      <span className="flex-1 text-moon text-sm truncate">{task.title}</span>
      <button
        onClick={() => removeTask(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-moon-faint hover:text-zen-red transition-opacity flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-night border-night-glow max-w-lg overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-lantern" />
            <DialogTitle className="text-moon text-xl font-light">
              Plan Your Day
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors flex-shrink-0",
                  step === s.id && "bg-lantern text-void",
                  step > s.id && "bg-zen-green text-void",
                  step < s.id && "bg-night-soft text-moon-dim border border-night-glow"
                )}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-12 h-0.5 mx-1",
                    step > s.id ? "bg-zen-green" : "bg-night-glow"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div className="text-center mb-6">
          <h3 className="text-moon text-lg font-medium">{STEPS[step - 1].title}</h3>
          <p className="text-moon-dim text-sm">{STEPS[step - 1].subtitle}</p>
        </div>

        {/* Step Content */}
        <div className="min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4">
              {mitTask ? (
                <div className="space-y-4">
                  {renderTaskPreview(mitTask)}
                  <p className="text-moon-dim text-sm text-center">
                    Your MIT is set! You can change it above or proceed.
                  </p>
                </div>
              ) : (
                renderTaskInput("MIT")
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {primaryTasks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {primaryTasks.map((task) => renderTaskPreview(task))}
                </div>
              )}
              {primaryTasks.length < 3 ? (
                renderTaskInput("PRIMARY")
              ) : (
                <p className="text-moon-dim text-sm text-center py-4">
                  Maximum 3 primary tasks reached
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {secondaryTasks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {secondaryTasks.map((task) => renderTaskPreview(task))}
                </div>
              )}
              {renderTaskInput("SECONDARY")}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {/* MIT */}
              {mitTask && (
                <div>
                  <h4 className="text-xs font-medium uppercase tracking-wider text-lantern mb-2">
                    MIT (100 pts)
                  </h4>
                  {renderTaskPreview(mitTask)}
                </div>
              )}

              {/* Primary */}
              {primaryTasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase tracking-wider text-zen-green mb-2">
                    Primary ({primaryTasks.length} × 50 pts)
                  </h4>
                  <div className="space-y-2">
                    {primaryTasks.map((task) => renderTaskPreview(task))}
                  </div>
                </div>
              )}

              {/* Secondary */}
              {secondaryTasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase tracking-wider text-moon-dim mb-2">
                    Secondary ({secondaryTasks.length} × 25 pts)
                  </h4>
                  <div className="space-y-2">
                    {secondaryTasks.map((task) => renderTaskPreview(task))}
                  </div>
                </div>
              )}

              {/* Points Summary */}
              <div className="mt-6 p-4 bg-night-soft rounded-xl border border-night-glow">
                <div className="flex justify-between items-center">
                  <span className="text-moon-dim">Potential points today:</span>
                  <span className="text-lantern text-xl font-medium">
                    {(mitTask ? 100 : 0) +
                      primaryTasks.length * 50 +
                      secondaryTasks.length * 25}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-night-glow">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="text-moon-dim hover:text-moon"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="bg-lantern text-void hover:bg-lantern/90"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || tasks.length === 0}
              className="bg-zen-green text-void hover:bg-zen-green/90"
            >
              {isSubmitting ? "Creating..." : "Start Your Day"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

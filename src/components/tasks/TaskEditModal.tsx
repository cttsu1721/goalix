"use client";

import { useState, useEffect } from "react";
import { useUpdateTask, useDeleteTask, useGoals } from "@/hooks";
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
import { cn } from "@/lib/utils";
import { Loader2, Save, Trash2, Clock, Target, AlertCircle } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes?: number | null;
  weeklyGoalId?: string | null;
}

interface TaskEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; description: string; points: number; color: string }
> = {
  MIT: {
    label: "MIT",
    description: "Most Important Task (1 per day)",
    points: 100,
    color: "text-lantern",
  },
  PRIMARY: {
    label: "Primary",
    description: "Core tasks for the day (max 3)",
    points: 50,
    color: "text-zen-green",
  },
  SECONDARY: {
    label: "Secondary",
    description: "Bonus/supporting tasks",
    points: 25,
    color: "text-moon-soft",
  },
};

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "SKIPPED", label: "Skipped" },
];

const ESTIMATED_TIME_OPTIONS = [
  { value: "", label: "No estimate" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
];

export function TaskEditModal({ open, onOpenChange, task }: TaskEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("SECONDARY");
  const [status, setStatus] = useState<TaskStatus>("PENDING");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [weeklyGoalId, setWeeklyGoalId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: weeklyGoalsData } = useGoals("weekly");

  const weeklyGoals = (weeklyGoalsData?.goals || []) as Array<{ id: string; title: string }>;

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStatus(task.status);
      setEstimatedMinutes(task.estimatedMinutes?.toString() || "");
      setWeeklyGoalId(task.weeklyGoalId || "");
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!task) return;

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      await updateTask.mutateAsync({
        id: task.id,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        weeklyGoalId: weeklyGoalId || undefined,
      });

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      await deleteTask.mutateAsync(task.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowDeleteConfirm(false);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const selectedPriorityConfig = PRIORITY_CONFIG[priority];

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-night border-night-mist sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-moon text-xl font-medium">
            Edit Task
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            Update task details
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
            <Label htmlFor="edit-title" className="text-moon-soft text-sm">
              Task Title <span className="text-lantern">*</span>
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="bg-night-soft border-night-mist text-moon placeholder:text-moon-faint focus:border-lantern focus:ring-lantern/20"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-moon-soft text-sm">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-night-soft border-night-mist text-moon focus:ring-lantern/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-night border-night-mist">
                  {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                    <SelectItem
                      key={p}
                      value={p}
                      className="text-moon-soft focus:bg-night-mist focus:text-moon"
                    >
                      <span className={PRIORITY_CONFIG[p].color}>
                        {PRIORITY_CONFIG[p].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-moon-soft text-sm">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-night-soft border-night-mist text-moon focus:ring-lantern/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-night border-night-mist">
                  {STATUS_OPTIONS.map((option) => (
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-moon-soft text-sm">
              Description{" "}
              <span className="text-moon-faint font-normal">(optional)</span>
            </Label>
            <Textarea
              id="edit-description"
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
                      key={option.value || "none"}
                      value={option.value || "none"}
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
              <Label className="text-moon-soft text-sm flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Link to Goal
              </Label>
              <Select value={weeklyGoalId || "none"} onValueChange={(v) => setWeeklyGoalId(v === "none" ? "" : v)}>
                <SelectTrigger className="bg-night-soft border-night-mist text-moon focus:ring-lantern/20">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent className="bg-night border-night-mist max-h-48">
                  <SelectItem
                    value="none"
                    className="text-moon-faint focus:bg-night-mist focus:text-moon"
                  >
                    No goal
                  </SelectItem>
                  {weeklyGoals.map((goal) => (
                    <SelectItem
                      key={goal.id}
                      value={goal.id}
                      className="text-moon-soft focus:bg-night-mist focus:text-moon"
                    >
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm mb-3">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-transparent border-night-mist text-moon-soft hover:bg-night-soft"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteTask.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete Task"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
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
                disabled={updateTask.isPending || !title.trim()}
                className="bg-lantern hover:bg-lantern-soft text-void font-medium"
              >
                {updateTask.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
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
import { Loader2, Save, Trash2, Clock, AlertCircle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus, GoalCategory } from "@prisma/client";
import { GoalSelector } from "@/components/goals";
import { formatLocalDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes?: number | null;
  weeklyGoalId?: string | null;
  scheduledDate?: Date | string;
}

interface TaskEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; shortDesc: string; description: string; points: number; color: string }
> = {
  MIT: {
    label: "MIT",
    shortDesc: "1 per day",
    description: "The ONE thing that moves the needle most",
    points: 100,
    color: "text-lantern",
  },
  PRIMARY: {
    label: "Primary",
    shortDesc: "Max 3",
    description: "Core tasks that advance your goals",
    points: 50,
    color: "text-zen-green",
  },
  SECONDARY: {
    label: "Secondary",
    shortDesc: "Unlimited",
    description: "Supporting tasks and quick wins",
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

// Inner form component that takes initial values from task
// Using key={task.id} in parent ensures fresh state when task changes
function TaskEditForm({ task, onClose }: { task: Task; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(task.estimatedMinutes?.toString() || "");
  const [weeklyGoalId, setWeeklyGoalId] = useState<string>(task.weeklyGoalId || "");
  const [scheduledDate, setScheduledDate] = useState<string>(
    task.scheduledDate ? formatLocalDate(new Date(task.scheduledDate)) : formatLocalDate()
  );
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const today = formatLocalDate();
  const isOverdue = scheduledDate < today;

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: weeklyGoalsData } = useGoals("weekly");

  const weeklyGoals = (weeklyGoalsData?.goals || []) as Array<{ id: string; title: string; category: GoalCategory }>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        scheduledDate,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  return (
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
                  <div className="flex items-center gap-2">
                    <span className={PRIORITY_CONFIG[p].color}>
                      {PRIORITY_CONFIG[p].label}
                    </span>
                    <span className="text-moon-faint text-xs">
                      ({PRIORITY_CONFIG[p].shortDesc})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={cn(
            "text-[11px] leading-tight",
            priority === "MIT" && "text-lantern/70",
            priority === "PRIMARY" && "text-zen-green/70",
            priority === "SECONDARY" && "text-moon-faint"
          )}>
            {PRIORITY_CONFIG[priority].description}
          </p>
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

      {/* Scheduled Date */}
      <div className="space-y-2">
        <Label htmlFor="edit-scheduled-date" className="text-moon-soft text-sm flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          Scheduled Date
        </Label>
        <div className="relative">
          <Input
            id="edit-scheduled-date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="bg-night-soft border-night-mist text-moon focus:border-lantern focus:ring-lantern/20 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
          />
          {isOverdue && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-zen-red">
              <AlertCircle className="w-3.5 h-3.5" />
              This task is overdue. Change date to reschedule.
            </div>
          )}
        </div>
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
          <Label className="text-moon-soft text-sm">Link to Goal</Label>
          <GoalSelector
            goals={weeklyGoals}
            value={weeklyGoalId}
            onChange={setWeeklyGoalId}
            placeholder="Select goal..."
          />
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
            onClick={onClose}
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
  );
}

// Wrapper component that handles Dialog and remounts form when task changes
export function TaskEditModal({ open, onOpenChange, task }: TaskEditModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-night border-night-mist sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-moon text-xl font-medium">
            Edit Task
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            Update task details
          </DialogDescription>
        </DialogHeader>

        {/* Key forces form to remount with fresh state when task changes */}
        <TaskEditForm key={task.id} task={task} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

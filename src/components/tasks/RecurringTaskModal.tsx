"use client";

import { useState } from "react";
import { useCreateRecurringTemplate, useGoals } from "@/hooks";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatLocalDate } from "@/lib/utils";
import { Loader2, Repeat, Clock, AlertCircle, Calendar } from "lucide-react";
import type { TaskPriority, GoalCategory, RecurrencePattern } from "@prisma/client";
import { GoalSelector } from "@/components/goals";
import { toast } from "sonner";

interface RecurringTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const RECURRENCE_PATTERNS: Record<
  RecurrencePattern,
  { label: string; description: string }
> = {
  DAILY: {
    label: "Daily",
    description: "Every day",
  },
  WEEKDAYS: {
    label: "Weekdays",
    description: "Monday to Friday",
  },
  WEEKLY: {
    label: "Weekly",
    description: "Specific days of the week",
  },
  CUSTOM: {
    label: "Custom",
    description: "Every N days",
  },
};

const DAYS_OF_WEEK = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

const ESTIMATED_TIME_OPTIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

export function RecurringTaskModal({ open, onOpenChange }: RecurringTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("SECONDARY");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [weeklyGoalId, setWeeklyGoalId] = useState<string>("");
  const [pattern, setPattern] = useState<RecurrencePattern>("DAILY");
  const [selectedDays, setSelectedDays] = useState<string[]>(["MON", "WED", "FRI"]);
  const [customInterval, setCustomInterval] = useState<string>("2");
  const [startDate, setStartDate] = useState(formatLocalDate());
  const [endDate, setEndDate] = useState<string>("");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTemplate = useCreateRecurringTemplate();
  const { data: weeklyGoalsData } = useGoals("weekly");

  const weeklyGoals = (weeklyGoalsData?.goals || []) as Array<{
    id: string;
    title: string;
    description?: string;
    category: GoalCategory;
  }>;

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    if (pattern === "WEEKLY" && selectedDays.length === 0) {
      setError("Select at least one day of the week");
      return;
    }

    if (pattern === "CUSTOM" && (!customInterval || parseInt(customInterval) < 1)) {
      setError("Custom interval must be at least 1 day");
      return;
    }

    try {
      await createTemplate.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        weeklyGoalId: weeklyGoalId && weeklyGoalId !== "none" ? weeklyGoalId : undefined,
        pattern,
        daysOfWeek: pattern === "WEEKLY" ? selectedDays : undefined,
        customInterval: pattern === "CUSTOM" ? parseInt(customInterval) : undefined,
        startDate,
        endDate: hasEndDate && endDate ? endDate : undefined,
      });

      toast.success("Recurring task created!", {
        description: "Tasks will be generated automatically based on your schedule.",
      });

      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create recurring task");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("SECONDARY");
    setEstimatedMinutes("");
    setWeeklyGoalId("");
    setPattern("DAILY");
    setSelectedDays(["MON", "WED", "FRI"]);
    setCustomInterval("2");
    setStartDate(formatLocalDate());
    setEndDate("");
    setHasEndDate(false);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-night border-night-mist sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-moon text-xl font-medium flex items-center gap-2">
            <Repeat className="w-5 h-5 text-zen-green" />
            Create Recurring Task
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            Set up a task that repeats automatically on your schedule
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
              placeholder="e.g., Morning workout, Review emails"
              className="bg-night-soft border-night-mist text-moon placeholder:text-moon-faint focus:border-lantern focus:ring-lantern/20"
              autoFocus
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
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
                      "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div className="space-y-2">
            <Label className="text-moon-soft text-sm">Repeat</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(RECURRENCE_PATTERNS) as RecurrencePattern[]).map((p) => {
                const config = RECURRENCE_PATTERNS[p];
                const isSelected = pattern === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPattern(p)}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl border transition-all text-left",
                      isSelected
                        ? "border-zen-green bg-zen-green/10"
                        : "border-night-mist bg-night-soft hover:border-night-glow"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-zen-green" : "text-moon"
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs text-moon-faint">{config.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly: Day Selection */}
          {pattern === "WEEKLY" && (
            <div className="space-y-2">
              <Label className="text-moon-soft text-sm">Days of Week</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={cn(
                        "w-12 h-10 rounded-lg border text-sm font-medium transition-all",
                        isSelected
                          ? "border-zen-green bg-zen-green/20 text-zen-green"
                          : "border-night-mist bg-night-soft text-moon-dim hover:border-night-glow"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom: Interval */}
          {pattern === "CUSTOM" && (
            <div className="space-y-2">
              <Label className="text-moon-soft text-sm">Repeat Every</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(e.target.value)}
                  className="w-20 bg-night-soft border-night-mist text-moon focus:border-lantern"
                />
                <span className="text-moon-soft">days</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-moon-soft text-sm">
              Description <span className="text-moon-faint font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details or notes..."
              rows={2}
              className="bg-night-soft border-night-mist text-moon placeholder:text-moon-faint focus:border-lantern resize-none"
            />
          </div>

          {/* Time & Goal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-moon-soft text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Time Estimate
              </Label>
              <Select value={estimatedMinutes} onValueChange={setEstimatedMinutes}>
                <SelectTrigger className="bg-night-soft border-night-mist text-moon">
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

          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label className="text-moon-soft text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-night-soft border-night-mist text-moon"
                />
              </div>

              {hasEndDate && (
                <div className="flex-1 space-y-2">
                  <Label className="text-moon-soft text-sm">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="bg-night-soft border-night-mist text-moon"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="hasEndDate"
                checked={hasEndDate}
                onCheckedChange={(checked) => setHasEndDate(checked === true)}
                className="border-night-mist data-[state=checked]:bg-lantern data-[state=checked]:border-lantern"
              />
              <Label htmlFor="hasEndDate" className="text-sm text-moon-dim cursor-pointer">
                Set end date
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="bg-transparent border-night-mist text-moon-soft hover:bg-night-soft"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTemplate.isPending || !title.trim()}
              className="bg-zen-green hover:bg-zen-green/90 text-void font-medium"
            >
              {createTemplate.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Repeat className="w-4 h-4 mr-2" />
                  Create Recurring Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

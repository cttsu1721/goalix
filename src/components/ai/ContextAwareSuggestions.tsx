"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ExistingTask {
  id: string;
  title: string;
  priority: "MIT" | "PRIMARY" | "SECONDARY";
  completed: boolean;
  estimatedMinutes?: number | null;
}

interface ExistingGoal {
  id: string;
  title: string;
  level: "weekly" | "monthly" | "1year" | "3year" | "7year";
}

interface SuggestedTask {
  title: string;
  priority: "MIT" | "PRIMARY" | "SECONDARY";
  estimatedMinutes: number;
  reasoning: string;
  relatedGoalId?: string;
  confidence: number; // 0-100
}

interface ContextAwareSuggestionsProps {
  existingTasks: ExistingTask[];
  existingGoals: ExistingGoal[];
  weeklyGoalId?: string;
  onSelectSuggestion: (suggestion: SuggestedTask) => void;
  className?: string;
}

/**
 * Context-aware AI suggestions that consider existing tasks (9.2)
 * Avoids duplicates and suggests complementary tasks
 */
export function ContextAwareSuggestions({
  existingTasks,
  existingGoals,
  weeklyGoalId,
  onSelectSuggestion,
  className,
}: ContextAwareSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Analyze existing tasks for context
  const taskContext = useMemo(() => {
    const hasMit = existingTasks.some((t) => t.priority === "MIT" && !t.completed);
    const completedCount = existingTasks.filter((t) => t.completed).length;
    const totalTime = existingTasks
      .filter((t) => !t.completed)
      .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    const taskTitles = existingTasks.map((t) => t.title.toLowerCase());

    return {
      hasMit,
      completedCount,
      pendingCount: existingTasks.length - completedCount,
      totalTime,
      taskTitles,
    };
  }, [existingTasks]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/suggest-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyGoalId,
          existingTasks: existingTasks.map((t) => ({
            title: t.title,
            priority: t.priority,
            completed: t.completed,
          })),
          existingGoals: existingGoals.map((g) => ({
            id: g.id,
            title: g.title,
            level: g.level,
          })),
          context: {
            hasMit: taskContext.hasMit,
            pendingTaskCount: taskContext.pendingCount,
            totalEstimatedTime: taskContext.totalTime,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setHasLoaded(true);
    } catch {
      setError("Unable to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out suggestions that are too similar to existing tasks
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((suggestion) => {
      const suggestionWords = suggestion.title.toLowerCase().split(/\s+/);
      const isTooSimilar = taskContext.taskTitles.some((existingTitle) => {
        const existingWords = existingTitle.split(/\s+/);
        const commonWords = suggestionWords.filter((w) =>
          existingWords.some((ew) => w.includes(ew) || ew.includes(w))
        );
        return commonWords.length >= 2;
      });
      return !isTooSimilar;
    });
  }, [suggestions, taskContext.taskTitles]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Context Summary */}
      <div className="p-3 bg-night-soft rounded-lg border border-night-mist">
        <p className="text-xs text-moon-dim mb-2">Current context</p>
        <div className="flex flex-wrap gap-2">
          <ContextBadge
            icon={taskContext.hasMit ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            label={taskContext.hasMit ? "MIT set" : "No MIT"}
            variant={taskContext.hasMit ? "success" : "warning"}
          />
          <ContextBadge
            icon={<Target className="w-3 h-3" />}
            label={`${taskContext.pendingCount} pending`}
            variant="default"
          />
          {taskContext.totalTime > 0 && (
            <ContextBadge
              icon={<Clock className="w-3 h-3" />}
              label={`${Math.round(taskContext.totalTime / 60)}h planned`}
              variant="default"
            />
          )}
        </div>
      </div>

      {/* Get Suggestions Button */}
      {!hasLoaded && !isLoading && (
        <Button
          onClick={fetchSuggestions}
          className="w-full bg-lantern text-void hover:bg-lantern/90"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get Smart Suggestions
        </Button>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-lantern animate-spin mb-3" />
          <p className="text-sm text-moon-dim">Analyzing your context...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-zen-red mb-2">{error}</p>
          <Button variant="ghost" onClick={fetchSuggestions} className="text-lantern">
            Try Again
          </Button>
        </div>
      )}

      {/* Suggestions List */}
      {hasLoaded && !isLoading && (
        <div className="space-y-2">
          {filteredSuggestions.length === 0 ? (
            <p className="text-sm text-moon-dim text-center py-4">
              No new suggestions — your task list looks comprehensive!
            </p>
          ) : (
            <>
              <p className="text-xs text-moon-faint">
                Suggestions based on your context:
              </p>
              {filteredSuggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  suggestion={suggestion}
                  onSelect={() => onSelectSuggestion(suggestion)}
                  isDisabled={
                    suggestion.priority === "MIT" && taskContext.hasMit
                  }
                  disabledReason={
                    suggestion.priority === "MIT" && taskContext.hasMit
                      ? "You already have an MIT"
                      : undefined
                  }
                />
              ))}
              <Button
                variant="ghost"
                onClick={fetchSuggestions}
                className="w-full text-moon-dim"
              >
                Get More Suggestions
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ContextBadge({
  icon,
  label,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  variant: "success" | "warning" | "default";
}) {
  const variantStyles = {
    success: "bg-zen-green/10 text-zen-green",
    warning: "bg-lantern/10 text-lantern",
    default: "bg-night text-moon-dim",
  };

  return (
    <span
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
        variantStyles[variant]
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function SuggestionCard({
  suggestion,
  onSelect,
  isDisabled,
  disabledReason,
}: {
  suggestion: SuggestedTask;
  onSelect: () => void;
  isDisabled?: boolean;
  disabledReason?: string;
}) {
  const priorityStyles = {
    MIT: "border-l-lantern bg-lantern/5",
    PRIMARY: "border-l-zen-blue bg-zen-blue/5",
    SECONDARY: "border-l-night-glow bg-night",
  };

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={cn(
        "w-full text-left p-3 rounded-lg border-l-4 transition-all",
        priorityStyles[suggestion.priority],
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-night-soft cursor-pointer"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-moon">
              {suggestion.title}
            </span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                suggestion.priority === "MIT"
                  ? "bg-lantern/10 text-lantern"
                  : suggestion.priority === "PRIMARY"
                  ? "bg-zen-blue/10 text-zen-blue"
                  : "bg-night-mist text-moon-dim"
              )}
            >
              {suggestion.priority}
            </span>
          </div>
          <p className="text-xs text-moon-dim mb-2">{suggestion.reasoning}</p>
          <div className="flex items-center gap-3 text-xs text-moon-faint">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {suggestion.estimatedMinutes}m
            </span>
            <span>{suggestion.confidence}% match</span>
          </div>
          {isDisabled && disabledReason && (
            <p className="text-xs text-zen-red mt-2">{disabledReason}</p>
          )}
        </div>
        {!isDisabled && (
          <ArrowRight className="w-4 h-4 text-moon-faint flex-shrink-0 mt-1" />
        )}
      </div>
    </button>
  );
}

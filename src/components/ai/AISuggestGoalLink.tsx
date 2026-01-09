"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Link2, Target, Loader2, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedGoal {
  id: string;
  title: string;
  level: "3year" | "1year" | "monthly" | "weekly";
  confidence: number; // 0-100
  reason: string;
}

interface AISuggestGoalLinkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  taskDescription?: string;
  onSelect: (goalId: string) => void;
}

const LEVEL_LABELS: Record<string, string> = {
  "3year": "3-Year Goal",
  "1year": "1-Year Goal",
  monthly: "Monthly Goal",
  weekly: "Weekly Goal",
};

const LEVEL_COLORS: Record<string, string> = {
  "3year": "text-zen-purple",
  "1year": "text-lantern",
  monthly: "text-zen-green",
  weekly: "text-zen-blue",
};

export function AISuggestGoalLink({
  open,
  onOpenChange,
  taskTitle,
  taskDescription,
  onSelect,
}: AISuggestGoalLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedGoal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/suggest-goal-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle,
          taskDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setError("Unable to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedGoalId) {
      onSelect(selectedGoalId);
      onOpenChange(false);
    }
  };

  // Fetch suggestions when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-night border-night-mist">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-moon">
            <Sparkles className="w-5 h-5 text-lantern" />
            AI Goal Suggestions
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            Based on your task: &quot;{taskTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-lantern animate-spin mb-3" />
              <p className="text-sm text-moon-dim">Analyzing your goals...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-zen-red mb-4">{error}</p>
              <Button
                variant="ghost"
                onClick={fetchSuggestions}
                className="text-lantern"
              >
                Try Again
              </Button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Link2 className="w-12 h-12 text-moon-faint/50 mx-auto mb-3" />
              <p className="text-sm text-moon-dim mb-2">
                No matching goals found
              </p>
              <p className="text-xs text-moon-faint">
                This task might need a new goal to support it
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => setSelectedGoalId(suggestion.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    selectedGoalId === suggestion.id
                      ? "border-lantern bg-lantern/10"
                      : "border-night-mist bg-night-soft hover:bg-night hover:border-night-glow"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                        selectedGoalId === suggestion.id
                          ? "border-lantern bg-lantern"
                          : "border-night-glow"
                      )}
                    >
                      {selectedGoalId === suggestion.id && (
                        <Check className="w-3 h-3 text-void" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Target
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            LEVEL_COLORS[suggestion.level]
                          )}
                        />
                        <span className="text-sm font-medium text-moon truncate">
                          {suggestion.title}
                        </span>
                      </div>
                      <p className="text-xs text-moon-dim mb-2">
                        {suggestion.reason}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs",
                            LEVEL_COLORS[suggestion.level]
                          )}
                        >
                          {LEVEL_LABELS[suggestion.level]}
                        </span>
                        <span className="text-xs text-moon-faint">•</span>
                        <span className="text-xs text-moon-faint">
                          {suggestion.confidence}% match
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-night-mist">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-moon-dim hover:text-moon"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedGoalId || isLoading}
            className="bg-lantern text-void hover:bg-lantern/90"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Link to Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Inline button to trigger AI goal suggestions
 */
export function AISuggestGoalLinkButton({
  taskTitle,
  taskDescription,
  onSelect,
  className,
}: {
  taskTitle: string;
  taskDescription?: string;
  onSelect: (goalId: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "text-xs text-lantern hover:text-lantern/80 h-7",
          className
        )}
      >
        <Sparkles className="w-3 h-3 mr-1" />
        Suggest Goal
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
      <AISuggestGoalLink
        open={isOpen}
        onOpenChange={setIsOpen}
        taskTitle={taskTitle}
        taskDescription={taskDescription}
        onSelect={onSelect}
      />
    </>
  );
}

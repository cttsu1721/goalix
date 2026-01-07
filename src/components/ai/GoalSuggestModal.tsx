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
import { useGoalSuggest } from "@/hooks/useAI";
import type { GoalSuggestResponse, SuggestedGoal } from "@/lib/ai/schemas";
import type { GoalLevelForSuggestion } from "@/lib/ai/prompts";
import {
  Sparkles,
  Loader2,
  Target,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  Star,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalSuggestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: GoalLevelForSuggestion;
  category: string;
  parentId?: string;
  parentLevel?: GoalLevelForSuggestion;
  parentTitle?: string;
  onSelect: (suggestion: SuggestedGoal) => void;
}

const levelLabels: Record<GoalLevelForSuggestion, string> = {
  sevenYear: "7-Year Visions",
  threeYear: "3-Year Goals",
  oneYear: "1-Year Goals",
  monthly: "Monthly Goals",
  weekly: "Weekly Goals",
};

const levelIcons: Record<GoalLevelForSuggestion, React.ReactNode> = {
  sevenYear: <Star className="w-4 h-4" />,
  threeYear: <Target className="w-4 h-4" />,
  oneYear: <Calendar className="w-4 h-4" />,
  monthly: <Layers className="w-4 h-4" />,
  weekly: <CheckCircle2 className="w-4 h-4" />,
};

export function GoalSuggestModal({
  open,
  onOpenChange,
  level,
  category,
  parentId,
  parentLevel,
  parentTitle,
  onSelect,
}: GoalSuggestModalProps) {
  const [result, setResult] = useState<GoalSuggestResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const suggest = useGoalSuggest();

  // Auto-fetch suggestions when modal opens
  useEffect(() => {
    if (open && !result && !suggest.isPending) {
      handleSuggest();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSuggest = async () => {
    try {
      const response = await suggest.mutateAsync({
        level,
        category,
        parentId,
        parentLevel,
      });
      setResult(response.data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSelect = () => {
    if (result && selectedIndex !== null) {
      onSelect(result.suggestions[selectedIndex]);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setResult(null);
      setSelectedIndex(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-night border-night-glow max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-lantern/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-lantern" />
            </div>
            <div>
              <DialogTitle className="text-moon text-lg font-medium">
                AI Goal Suggestions
              </DialogTitle>
              <DialogDescription className="text-moon-faint text-sm">
                Suggestions for {levelLabels[level]}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Context Info */}
        <div className="mt-4 p-4 bg-night-soft border border-night-mist rounded-xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-moon-faint mb-2">
            {levelIcons[level]}
            <span>Creating {levelLabels[level]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-night-mist text-moon-soft">
              {category}
            </span>
            {parentTitle && (
              <>
                <ChevronRight className="w-3 h-3 text-moon-faint" />
                <span className="text-sm text-moon truncate">
                  {parentTitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {suggest.isPending && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-lantern mx-auto mb-4" />
            <p className="text-moon-soft">Analyzing your goal hierarchy...</p>
            <p className="text-xs text-moon-faint mt-1">
              Generating suggestions aligned with your vision
            </p>
          </div>
        )}

        {/* Error State */}
        {suggest.isError && !suggest.isPending && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-zen-red/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <p className="text-moon mb-2">Something went wrong</p>
            <p className="text-sm text-zen-red mb-4">{suggest.error.message}</p>
            <Button
              onClick={handleSuggest}
              variant="outline"
              className="border-lantern/30 text-lantern"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Results */}
        {result && !suggest.isPending && (
          <div className="space-y-4 mt-4">
            {/* Strategy Note */}
            <div className="p-3 bg-lantern/5 border border-lantern/20 rounded-xl">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-lantern flex-shrink-0 mt-0.5" />
                <p className="text-sm text-moon-soft">{result.strategy_note}</p>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-moon-faint mb-3">
                Select a suggestion
              </div>
              {result.suggestions
                .sort((a, b) => a.priority - b.priority)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      selectedIndex === index
                        ? "bg-lantern/10 border-lantern"
                        : "bg-night-soft border-night-mist hover:border-night-glow"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          selectedIndex === index
                            ? "bg-lantern text-void"
                            : "bg-night-mist text-moon-faint"
                        )}
                      >
                        {selectedIndex === index ? (
                          <Target className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">{suggestion.priority}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium mb-1",
                            selectedIndex === index
                              ? "text-lantern"
                              : "text-moon"
                          )}
                        >
                          {suggestion.title}
                        </p>
                        <p className="text-sm text-moon-dim line-clamp-2">
                          {suggestion.description}
                        </p>
                        <p className="text-xs text-moon-faint mt-2 italic">
                          {suggestion.reasoning}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-night-glow">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="text-moon-dim hover:text-moon"
          >
            Cancel
          </Button>

          {result && (
            <>
              <Button
                onClick={handleSuggest}
                disabled={suggest.isPending}
                variant="outline"
                className="border-lantern/30 text-lantern hover:bg-lantern/10"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", suggest.isPending && "animate-spin")} />
                Regenerate
              </Button>
              <Button
                onClick={handleSelect}
                disabled={selectedIndex === null}
                className="bg-lantern text-void hover:bg-lantern/90 disabled:opacity-50"
              >
                Use This Suggestion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

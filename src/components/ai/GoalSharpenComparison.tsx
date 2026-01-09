"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Loader2,
  Target,
  Clock,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SharpenedGoal {
  title: string;
  description: string;
  measurableOutcomes: string[];
  suggestedTimeframe: string;
  firstStep: string;
}

interface GoalSharpenComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalTitle: string;
  originalDescription?: string;
  onAccept: (sharpened: SharpenedGoal) => void;
  onReject: () => void;
  className?: string;
}

/**
 * Before/after comparison for Goal Sharpener (9.3)
 * Shows original vs sharpened goal side by side
 */
export function GoalSharpenComparison({
  open,
  onOpenChange,
  originalTitle,
  originalDescription,
  onAccept,
  onReject,
  className,
}: GoalSharpenComparisonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sharpened, setSharpened] = useState<SharpenedGoal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSharpened = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/sharpen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: originalTitle,
          description: originalDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sharpen goal");
      }

      const data = await res.json();
      setSharpened(data);
    } catch {
      setError("Unable to sharpen goal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on open
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && !sharpened && !isLoading) {
      fetchSharpened();
    }
  };

  const handleAccept = () => {
    if (sharpened) {
      onAccept(sharpened);
      onOpenChange(false);
    }
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("max-w-2xl bg-night border-night-mist p-0", className)}>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-moon">
            <Sparkles className="w-5 h-5 text-lantern" />
            AI Goal Sharpener
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-lantern animate-spin mb-4" />
              <p className="text-sm text-moon-dim">Sharpening your goal...</p>
              <p className="text-xs text-moon-faint mt-1">
                Making it specific, measurable, and actionable
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-zen-red mb-4">{error}</p>
              <Button variant="ghost" onClick={fetchSharpened} className="text-lantern">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : sharpened ? (
            <div className="space-y-6">
              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="p-4 bg-night-soft rounded-lg border border-night-mist">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 bg-moon-faint/20 text-moon-dim rounded">
                      Before
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-moon-dim mb-2">
                    {originalTitle}
                  </h4>
                  {originalDescription && (
                    <p className="text-xs text-moon-faint">
                      {originalDescription}
                    </p>
                  )}
                  {!originalDescription && (
                    <p className="text-xs text-moon-faint italic">
                      No description provided
                    </p>
                  )}
                </div>

                {/* After */}
                <div className="p-4 bg-lantern/5 rounded-lg border border-lantern/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 bg-lantern/20 text-lantern rounded">
                      After
                    </span>
                    <Sparkles className="w-3 h-3 text-lantern" />
                  </div>
                  <h4 className="text-sm font-medium text-moon mb-2">
                    {sharpened.title}
                  </h4>
                  <p className="text-xs text-moon-dim">
                    {sharpened.description}
                  </p>
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="hidden md:flex justify-center -my-2">
                <ArrowRight className="w-6 h-6 text-lantern" />
              </div>

              {/* Improvements added */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-moon flex items-center gap-2">
                  <Target className="w-4 h-4 text-zen-green" />
                  What's improved
                </h4>

                {/* Measurable outcomes */}
                <div className="p-3 bg-night-soft rounded-lg">
                  <p className="text-xs text-moon-dim mb-2 flex items-center gap-1">
                    <List className="w-3 h-3" />
                    Measurable Outcomes
                  </p>
                  <ul className="space-y-1">
                    {sharpened.measurableOutcomes.map((outcome, index) => (
                      <li
                        key={index}
                        className="text-sm text-moon flex items-start gap-2"
                      >
                        <Check className="w-4 h-4 text-zen-green flex-shrink-0 mt-0.5" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeframe and first step */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-night-soft rounded-lg">
                    <p className="text-xs text-moon-dim mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Suggested Timeframe
                    </p>
                    <p className="text-sm text-moon">{sharpened.suggestedTimeframe}</p>
                  </div>
                  <div className="p-3 bg-night-soft rounded-lg">
                    <p className="text-xs text-moon-dim mb-1 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      First Step
                    </p>
                    <p className="text-sm text-moon">{sharpened.firstStep}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-night-mist">
                <Button
                  variant="ghost"
                  onClick={handleReject}
                  className="text-moon-dim hover:text-moon"
                >
                  <X className="w-4 h-4 mr-2" />
                  Keep Original
                </Button>
                <Button
                  variant="ghost"
                  onClick={fetchSharpened}
                  className="text-lantern hover:text-lantern/80"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleAccept}
                  className="bg-lantern text-void hover:bg-lantern/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use Sharpened Goal
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Inline comparison view for embedding in forms
 */
export function GoalSharpenInlineComparison({
  original,
  sharpened,
  onAccept,
  onReject,
  className,
}: {
  original: { title: string; description?: string };
  sharpened: SharpenedGoal;
  onAccept: () => void;
  onReject: () => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Visual diff */}
      <div className="flex items-center gap-3">
        <div className="flex-1 p-3 bg-night-soft rounded-lg">
          <p className="text-xs text-moon-faint mb-1">Original</p>
          <p className="text-sm text-moon-dim line-through">{original.title}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-lantern flex-shrink-0" />
        <div className="flex-1 p-3 bg-lantern/5 rounded-lg border border-lantern/20">
          <p className="text-xs text-lantern mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Sharpened
          </p>
          <p className="text-sm text-moon font-medium">{sharpened.title}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReject}
          className="flex-1 text-moon-dim"
        >
          Keep Original
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          className="flex-1 bg-lantern text-void hover:bg-lantern/90"
        >
          <Check className="w-3 h-3 mr-1" />
          Apply
        </Button>
      </div>
    </div>
  );
}

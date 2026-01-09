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
import { useGoalSharpen } from "@/hooks/useAI";
import type { GoalSharpenResponse } from "@/lib/ai/schemas";
import {
  Sparkles,
  Loader2,
  Check,
  Target,
  ListChecks,
  Clock,
  Footprints,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIFeedback } from "./AIFeedback";
import { PremiumUpsell } from "./PremiumUpsell";

interface GoalSharpenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalTitle: string;
  goalContext?: string;
  goalCategory?: string;
  onApply: (result: GoalSharpenResponse) => void;
}

export function GoalSharpenModal({
  open,
  onOpenChange,
  goalTitle,
  goalContext,
  goalCategory,
  onApply,
}: GoalSharpenModalProps) {
  const [result, setResult] = useState<GoalSharpenResponse | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const sharpen = useGoalSharpen();

  // Check if the error is a rate limit error
  const isRateLimited = sharpen.error?.message?.includes("Daily AI limit") ||
    sharpen.error?.message?.includes("limit reached");

  const handleSharpen = async () => {
    try {
      const response = await sharpen.mutateAsync({
        title: goalTitle,
        context: goalContext,
        category: goalCategory,
      });
      setResult(response.data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => setResult(null), 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-night border-night-glow max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-zen-purple/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zen-purple" />
            </div>
            <div>
              <DialogTitle className="text-moon text-lg font-medium">
                AI Goal Sharpener
              </DialogTitle>
              <DialogDescription className="text-moon-faint text-sm">
                Transform your goal into a SMART objective
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Before/After Comparison - Side by side when result available */}
        {result ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before (Original) */}
            <div className="p-4 bg-night-soft border border-night-mist rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 bg-moon-faint/20 text-moon-dim rounded font-medium uppercase tracking-wider">
                  Before
                </span>
              </div>
              <p className="text-moon-dim">{goalTitle}</p>
              {goalContext && (
                <p className="text-sm text-moon-faint mt-2">{goalContext}</p>
              )}
            </div>

            {/* After (Sharpened) */}
            <div className="p-4 bg-zen-purple/5 border border-zen-purple/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 bg-zen-purple/20 text-zen-purple rounded font-medium uppercase tracking-wider">
                  After
                </span>
                <Sparkles className="w-3 h-3 text-zen-purple" />
              </div>
              <p className="text-moon font-medium">{result.sharpened_title}</p>
              {result.description && (
                <p className="text-sm text-moon-soft mt-2">{result.description}</p>
              )}
            </div>
          </div>
        ) : (
          /* Original Goal - when no result yet */
          <div className="mt-4 p-4 bg-night-soft border border-night-mist rounded-xl">
            <div className="text-xs font-medium uppercase tracking-wider text-moon-faint mb-2">
              Your Goal
            </div>
            <p className="text-moon">{goalTitle}</p>
          </div>
        )}

        {/* Loading State */}
        {sharpen.isPending && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-zen-purple mx-auto mb-4" />
            <p className="text-moon-soft">Analyzing your goal...</p>
            <p className="text-xs text-moon-faint mt-1">
              Making it Specific, Measurable, Achievable, Relevant, and Time-bound
            </p>
          </div>
        )}

        {/* Error State */}
        {sharpen.isError && !sharpen.isPending && (
          <div className="py-8 text-center">
            {isRateLimited ? (
              <>
                <div className="w-12 h-12 rounded-full bg-lantern/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-lantern" />
                </div>
                <p className="text-moon mb-2">Daily limit reached</p>
                <p className="text-sm text-moon-dim mb-4">
                  You&apos;ve used all your AI credits for today
                </p>
                <Button
                  onClick={() => setShowUpsell(true)}
                  className="bg-gradient-to-r from-lantern to-zen-purple text-void"
                >
                  Unlock Unlimited AI
                </Button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-zen-red/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">😕</span>
                </div>
                <p className="text-moon mb-2">Something went wrong</p>
                <p className="text-sm text-zen-red mb-4">{sharpen.error.message}</p>
                <Button
                  onClick={handleSharpen}
                  variant="outline"
                  className="border-zen-purple/30 text-zen-purple"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        )}

        {/* Result Details */}
        {result && !sharpen.isPending && (
          <div className="space-y-4 mt-4">
            {/* What's Improved Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-moon">
              <Target className="w-4 h-4 text-zen-green" />
              What&apos;s improved
            </div>

            {/* Measurable Outcomes */}
            <div className="p-4 bg-night-soft border border-night-mist rounded-xl">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-moon-faint mb-3">
                <ListChecks className="w-3 h-3" />
                Measurable Outcomes
              </div>
              <ul className="space-y-2">
                {result.measurable_outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-zen-green flex-shrink-0 mt-0.5" />
                    <span className="text-moon-soft">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeframe & First Step */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-night-soft border border-night-mist rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-moon-faint mb-2">
                  <Clock className="w-3 h-3" />
                  Timeframe
                </div>
                <p className="text-moon text-sm">{result.suggested_timeframe}</p>
              </div>
              <div className="p-4 bg-night-soft border border-night-mist rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-moon-faint mb-2">
                  <Footprints className="w-3 h-3" />
                  First Step
                </div>
                <p className="text-moon text-sm">{result.first_step}</p>
              </div>
            </div>

            {/* AI Feedback */}
            <div className="pt-3 border-t border-night-mist">
              <AIFeedback context="goal_sharpen" />
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

          {!result && !sharpen.isPending && (
            <Button
              onClick={handleSharpen}
              disabled={sharpen.isPending}
              className="bg-zen-purple text-void hover:bg-zen-purple/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sharpen Goal
            </Button>
          )}

          {result && (
            <>
              <Button
                onClick={handleSharpen}
                disabled={sharpen.isPending}
                variant="outline"
                className="border-zen-purple/30 text-zen-purple hover:bg-zen-purple/10"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", sharpen.isPending && "animate-spin")} />
                Regenerate
              </Button>
              <Button
                onClick={handleApply}
                className="bg-zen-green text-void hover:bg-zen-green/90"
              >
                Apply Changes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>

      {/* Premium Upsell Modal */}
      <PremiumUpsell
        open={showUpsell}
        onOpenChange={setShowUpsell}
        feature="goal_sharpener"
        usesRemaining={0}
        dailyLimit={5}
      />
    </Dialog>
  );
}

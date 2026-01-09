"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Target,
  TrendingUp,
  Calendar,
  Lightbulb,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewData {
  wins?: string;
  challenges?: string;
  learnings?: string;
  rating?: number;
}

interface PlanData {
  focusAreas?: string;
  priorities?: string;
  habits?: string;
}

interface ReviewPlanSplitProps {
  periodLabel: string; // e.g., "Week 2, 2026" or "January 2026"
  type: "weekly" | "monthly";
  existingReview?: ReviewData;
  existingPlan?: PlanData;
  onSaveReview: (data: ReviewData) => void;
  onSavePlan: (data: PlanData) => void;
  className?: string;
}

/**
 * Separate "Review" (past) from "Plan" (future) flows (8.5)
 * Clear distinction between reflection and intention-setting
 */
export function ReviewPlanSplit({
  periodLabel,
  type,
  existingReview,
  existingPlan,
  onSaveReview,
  onSavePlan,
  className,
}: ReviewPlanSplitProps) {
  const [activeTab, setActiveTab] = useState<"review" | "plan">("review");
  const [reviewData, setReviewData] = useState<ReviewData>(existingReview || {});
  const [planData, setPlanData] = useState<PlanData>(existingPlan || {});
  const [reviewRating, setReviewRating] = useState(existingReview?.rating || 0);

  const handleSaveReview = () => {
    onSaveReview({ ...reviewData, rating: reviewRating });
  };

  const handleSavePlan = () => {
    onSavePlan(planData);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "review" | "plan")}
      >
        <TabsList className="grid w-full grid-cols-2 bg-night">
          <TabsTrigger
            value="review"
            className="data-[state=active]:bg-lantern data-[state=active]:text-void flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Review Past
          </TabsTrigger>
          <TabsTrigger
            value="plan"
            className="data-[state=active]:bg-lantern data-[state=active]:text-void flex items-center gap-2"
          >
            Plan Ahead
            <ArrowRight className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        {/* Review (Past) Tab */}
        <TabsContent value="review" className="mt-4 space-y-6">
          <div className="p-4 bg-night-soft rounded-lg border border-night-mist">
            <p className="text-sm text-moon-dim mb-2">
              Reflect on {periodLabel}
            </p>
            <p className="text-xs text-moon-faint">
              Looking back helps you identify patterns and celebrate progress.
            </p>
          </div>

          {/* Wins */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-moon flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zen-green" />
              What went well?
            </label>
            <Textarea
              value={reviewData.wins || ""}
              onChange={(e) =>
                setReviewData({ ...reviewData, wins: e.target.value })
              }
              placeholder="List your wins and accomplishments..."
              className="min-h-[100px] bg-night border-night-mist text-moon"
            />
          </div>

          {/* Challenges */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-moon flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zen-blue" />
              What was challenging?
            </label>
            <Textarea
              value={reviewData.challenges || ""}
              onChange={(e) =>
                setReviewData({ ...reviewData, challenges: e.target.value })
              }
              placeholder="Describe obstacles you faced..."
              className="min-h-[100px] bg-night border-night-mist text-moon"
            />
          </div>

          {/* Learnings */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-moon flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-lantern" />
              What did you learn?
            </label>
            <Textarea
              value={reviewData.learnings || ""}
              onChange={(e) =>
                setReviewData({ ...reviewData, learnings: e.target.value })
              }
              placeholder="Key insights and lessons..."
              className="min-h-[100px] bg-night border-night-mist text-moon"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-moon">
              Rate this {type === "weekly" ? "week" : "month"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "w-6 h-6",
                      star <= reviewRating
                        ? "text-lantern fill-lantern"
                        : "text-night-glow"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-night-mist">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("plan")}
              className="text-moon-dim"
            >
              Skip to Planning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleSaveReview}
              className="bg-lantern text-void hover:bg-lantern/90"
            >
              Save Review
            </Button>
          </div>
        </TabsContent>

        {/* Plan (Future) Tab */}
        <TabsContent value="plan" className="mt-4 space-y-6">
          <div className="p-4 bg-night-soft rounded-lg border border-night-mist">
            <p className="text-sm text-moon-dim mb-2">
              Plan the next {type === "weekly" ? "week" : "month"}
            </p>
            <p className="text-xs text-moon-faint">
              Set clear intentions to guide your actions.
            </p>
          </div>

          {/* Focus Areas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-moon flex items-center gap-2">
              <Target className="w-4 h-4 text-lantern" />
              Focus areas
            </label>
            <Textarea
              value={planData.focusAreas || ""}
              onChange={(e) =>
                setPlanData({ ...planData, focusAreas: e.target.value })
              }
              placeholder="What will you focus on?"
              className="min-h-[100px] bg-night border-night-mist text-moon"
            />
          </div>

          {/* Priorities */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-moon flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zen-green" />
              Top priorities
            </label>
            <Textarea
              value={planData.priorities || ""}
              onChange={(e) =>
                setPlanData({ ...planData, priorities: e.target.value })
              }
              placeholder="What must get done?"
              className="min-h-[100px] bg-night border-night-mist text-moon"
            />
          </div>

          {/* Habits */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-moon flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zen-blue" />
              Habits to maintain
            </label>
            <Textarea
              value={planData.habits || ""}
              onChange={(e) =>
                setPlanData({ ...planData, habits: e.target.value })
              }
              placeholder="Daily habits to keep up..."
              className="min-h-[100px] bg-night border-night-mist text-moon"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-night-mist">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("review")}
              className="text-moon-dim"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Review
            </Button>
            <Button
              onClick={handleSavePlan}
              className="bg-lantern text-void hover:bg-lantern/90"
            >
              Save Plan
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Quick review/plan toggle for the dashboard
 */
export function ReviewPlanQuickToggle({
  hasReview,
  hasPlan,
  onReviewClick,
  onPlanClick,
  className,
}: {
  hasReview: boolean;
  hasPlan: boolean;
  onReviewClick: () => void;
  onPlanClick: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", className)}>
      <button
        onClick={onReviewClick}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors",
          hasReview
            ? "bg-zen-green/10 border-zen-green/30 text-zen-green"
            : "bg-night-soft border-night-mist text-moon-dim hover:bg-night hover:border-night-glow"
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Review</span>
        {hasReview && <CheckCircle2 className="w-4 h-4" />}
      </button>
      <button
        onClick={onPlanClick}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors",
          hasPlan
            ? "bg-zen-green/10 border-zen-green/30 text-zen-green"
            : "bg-night-soft border-night-mist text-moon-dim hover:bg-night hover:border-night-glow"
        )}
      >
        <span className="text-sm">Plan</span>
        <ArrowRight className="w-4 h-4" />
        {hasPlan && <CheckCircle2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

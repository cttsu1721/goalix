"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewTimeline } from "@/components/review";
import { useAllReviewHistory } from "@/hooks";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Past Reviews Timeline Page (8.4)
 * Shows historical reviews in chronological order
 */
export default function ReviewHistoryPage() {
  const { weeklyReviews, monthlyReviews, isLoading, error } = useAllReviewHistory(50);

  // Transform weekly reviews to match ReviewTimeline format
  const formattedWeeklyReviews = weeklyReviews.map((review) => ({
    id: review.id,
    weekNumber: review.weekNumber || 0,
    year: review.year,
    createdAt: review.createdAt,
    completedAt: review.completedAt,
    wins: review.wins,
    challenges: review.challenges,
    focusAreas: review.focusAreas,
    rating: review.rating,
  }));

  // Transform monthly reviews to match ReviewTimeline format
  const formattedMonthlyReviews = monthlyReviews.map((review) => ({
    id: review.id,
    month: review.month || 0,
    year: review.year,
    createdAt: review.createdAt,
    completedAt: review.completedAt,
    reflections: review.reflections,
    insights: review.insights,
    rating: review.rating,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with back link */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/review/weekly">
            <Button
              variant="ghost"
              size="sm"
              className="text-moon-dim hover:text-moon"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Review
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Past Reviews"
          subtitle="Look back at your journey and see how far you've come"
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-lantern" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-zen-red mb-2">Failed to load review history</p>
            <p className="text-sm text-moon-faint">Please try again later</p>
          </div>
        )}

        {/* Timeline */}
        {!isLoading && !error && (
          <ReviewTimeline
            weeklyReviews={formattedWeeklyReviews}
            monthlyReviews={formattedMonthlyReviews}
          />
        )}
      </div>
    </AppShell>
  );
}

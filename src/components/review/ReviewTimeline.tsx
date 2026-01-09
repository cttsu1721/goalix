"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileText,
  TrendingUp,
  Star,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface WeeklyReview {
  id: string;
  weekNumber: number;
  year: number;
  createdAt: string;
  completedAt?: string | null;
  wins?: string | null;
  challenges?: string | null;
  focusAreas?: string | null;
  rating?: number | null;
}

interface MonthlyReview {
  id: string;
  month: number;
  year: number;
  createdAt: string;
  completedAt?: string | null;
  reflections?: string | null;
  insights?: string | null;
  rating?: number | null;
}

interface ReviewTimelineProps {
  weeklyReviews: WeeklyReview[];
  monthlyReviews: MonthlyReview[];
  className?: string;
}

/**
 * Past reviews timeline view (8.4)
 * Shows historical reviews in chronological order with expandable details
 */
export function ReviewTimeline({
  weeklyReviews,
  monthlyReviews,
  className,
}: ReviewTimelineProps) {
  const [filter, setFilter] = useState<"all" | "weekly" | "monthly">("all");

  // Combine and sort reviews by date
  const combinedReviews = useMemo(() => {
    const items: Array<{
      type: "weekly" | "monthly";
      date: Date;
      data: WeeklyReview | MonthlyReview;
    }> = [];

    weeklyReviews.forEach((review) => {
      items.push({
        type: "weekly",
        date: parseISO(review.createdAt),
        data: review,
      });
    });

    monthlyReviews.forEach((review) => {
      items.push({
        type: "monthly",
        date: parseISO(review.createdAt),
        data: review,
      });
    });

    // Sort by date, newest first
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [weeklyReviews, monthlyReviews]);

  const filteredReviews = combinedReviews.filter(
    (item) => filter === "all" || item.type === filter
  );

  // Group by month for visual organization
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof filteredReviews> = {};

    filteredReviews.forEach((item) => {
      const monthKey = format(item.date, "yyyy-MM");
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(item);
    });

    return Object.entries(groups).map(([key, items]) => ({
      monthKey: key,
      monthLabel: format(parseISO(`${key}-01`), "MMMM yyyy"),
      items,
    }));
  }, [filteredReviews]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All Reviews" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              filter === tab.value
                ? "bg-lantern text-void"
                : "bg-night-soft text-moon-dim hover:bg-night hover:text-moon"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {groupedByMonth.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-moon-faint/50 mx-auto mb-3" />
          <p className="text-moon-dim">No reviews found</p>
          <p className="text-sm text-moon-faint">
            Complete your first weekly review to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByMonth.map((group) => (
            <div key={group.monthKey}>
              <h3 className="text-sm font-medium text-moon-dim mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {group.monthLabel}
              </h3>
              <div className="space-y-2 ml-2 border-l-2 border-night-mist pl-4">
                {group.items.map((item) => (
                  <ReviewTimelineItem
                    key={`${item.type}-${item.data.id}`}
                    type={item.type}
                    data={item.data}
                    date={item.date}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewTimelineItem({
  type,
  data,
  date,
}: {
  type: "weekly" | "monthly";
  data: WeeklyReview | MonthlyReview;
  date: Date;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isWeekly = type === "weekly";
  const weeklyData = isWeekly ? (data as WeeklyReview) : null;
  const monthlyData = !isWeekly ? (data as MonthlyReview) : null;

  const title = isWeekly
    ? `Week ${weeklyData!.weekNumber}, ${weeklyData!.year}`
    : format(new Date(monthlyData!.year, monthlyData!.month - 1), "MMMM yyyy");

  const isCompleted = data.completedAt !== null;
  const rating = data.rating;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
            "bg-night-soft hover:bg-night border border-night-mist"
          )}
        >
          {/* Timeline dot */}
          <div
            className={cn(
              "w-3 h-3 rounded-full flex-shrink-0 -ml-[22px]",
              isCompleted ? "bg-zen-green" : "bg-moon-faint"
            )}
          />

          {/* Icon */}
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              isWeekly ? "bg-zen-blue/10" : "bg-zen-purple/10"
            )}
          >
            {isWeekly ? (
              <Calendar className="w-4 h-4 text-zen-blue" />
            ) : (
              <TrendingUp className="w-4 h-4 text-zen-purple" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-moon">{title}</span>
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  isWeekly
                    ? "bg-zen-blue/10 text-zen-blue"
                    : "bg-zen-purple/10 text-zen-purple"
                )}
              >
                {type}
              </span>
            </div>
            <p className="text-xs text-moon-faint mt-0.5">
              {format(date, "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>

          {/* Rating */}
          {rating !== null && rating !== undefined && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-3 h-3",
                    star <= rating ? "text-lantern fill-lantern" : "text-night-glow"
                  )}
                />
              ))}
            </div>
          )}

          {/* Expand indicator */}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-moon-faint flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-moon-faint flex-shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 p-4 bg-night rounded-lg border border-night-mist ml-6 space-y-3">
          {isWeekly && weeklyData && (
            <>
              {weeklyData.wins && (
                <ReviewSection title="Wins" content={weeklyData.wins} icon="✓" />
              )}
              {weeklyData.challenges && (
                <ReviewSection
                  title="Challenges"
                  content={weeklyData.challenges}
                  icon="⚡"
                />
              )}
              {weeklyData.focusAreas && (
                <ReviewSection
                  title="Focus Areas"
                  content={weeklyData.focusAreas}
                  icon="🎯"
                />
              )}
            </>
          )}
          {!isWeekly && monthlyData && (
            <>
              {monthlyData.reflections && (
                <ReviewSection
                  title="Reflections"
                  content={monthlyData.reflections}
                  icon="💭"
                />
              )}
              {monthlyData.insights && (
                <ReviewSection
                  title="Insights"
                  content={monthlyData.insights}
                  icon="💡"
                />
              )}
            </>
          )}

          {/* View full review link */}
          <Link
            href={
              isWeekly
                ? `/review/weekly/${data.id}`
                : `/review/monthly/${data.id}`
            }
            className="text-xs text-lantern hover:underline flex items-center gap-1"
          >
            View full review
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ReviewSection({
  title,
  content,
  icon,
}: {
  title: string;
  content: string;
  icon: string;
}) {
  return (
    <div>
      <p className="text-xs text-moon-dim mb-1 flex items-center gap-1">
        <span>{icon}</span>
        {title}
      </p>
      <p className="text-sm text-moon whitespace-pre-wrap line-clamp-3">
        {content}
      </p>
    </div>
  );
}

/**
 * Compact review history list for sidebar/widget
 */
export function ReviewHistoryCompact({
  weeklyReviews,
  className,
}: {
  weeklyReviews: WeeklyReview[];
  className?: string;
}) {
  const recentReviews = weeklyReviews.slice(0, 4);

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-xs text-moon-dim font-medium">Recent Reviews</h4>
      {recentReviews.length === 0 ? (
        <p className="text-xs text-moon-faint">No reviews yet</p>
      ) : (
        <ul className="space-y-1">
          {recentReviews.map((review) => (
            <li key={review.id}>
              <Link
                href={`/review/weekly/${review.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-night-soft transition-colors"
              >
                <span className="text-xs text-moon-dim">
                  Week {review.weekNumber}
                </span>
                {review.completedAt ? (
                  <CheckCircle2 className="w-3 h-3 text-zen-green" />
                ) : (
                  <Clock className="w-3 h-3 text-moon-faint" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Target, Loader2 } from "lucide-react";

interface WeeklyAlignment {
  weekStart: string;
  weekEnd: string;
  alignmentRate: number;
  linkedCompleted: number;
  totalCompleted: number;
}

interface AlignmentData {
  weeks: WeeklyAlignment[];
  summary: {
    overallAverage: number;
    recentAverage: number;
    trend: number;
    trendLabel: "improving" | "declining" | "stable";
  };
}

async function fetchAlignmentData(weeks: number = 12): Promise<AlignmentData> {
  const res = await fetch(`/api/stats/alignment?weeks=${weeks}`);
  if (!res.ok) throw new Error("Failed to fetch alignment data");
  return res.json();
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
}

function WeeklySparkline({
  data,
  width = 280,
  height = 48,
  strokeColor = "#7dd3a8",
  fillColor = "rgba(125, 211, 168, 0.15)",
}: SparklineProps) {
  if (data.length < 2) return null;

  const maxValue = Math.max(...data, 100);
  const minValue = 0;
  const range = maxValue - minValue || 1;

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y, value };
  });

  // Create SVG path for smooth curve
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // Create SVG path for fill (area under line)
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* 50% reference line */}
      <line
        x1={padding}
        y1={padding + chartHeight / 2}
        x2={width - padding}
        y2={padding + chartHeight / 2}
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeDasharray="4,4"
        className="text-moon-faint"
      />
      {/* Fill area */}
      <path d={fillPath} fill={fillColor} />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 4 : 2}
          fill={i === points.length - 1 ? strokeColor : "transparent"}
          stroke={strokeColor}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

interface AlignmentTrendCardProps {
  weeks?: number;
  className?: string;
}

export function AlignmentTrendCard({ weeks = 12, className }: AlignmentTrendCardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["alignmentTrend", weeks],
    queryFn: () => fetchAlignmentData(weeks),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6",
          className
        )}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-moon-faint" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  // Only show weeks with data
  const weeksWithData = data.weeks.filter((w) => w.totalCompleted > 0);
  if (weeksWithData.length < 2) {
    return (
      <div
        className={cn(
          "bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-zen-green/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-zen-green" />
          </div>
          <div>
            <h3 className="text-[0.625rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
              Goal Alignment Trend
            </h3>
            <p className="text-sm text-moon-dim">Complete tasks for 2+ weeks to see trend</p>
          </div>
        </div>
      </div>
    );
  }

  const alignmentValues = data.weeks.map((w) => w.alignmentRate);
  const { summary } = data;

  // Determine trend icon and color
  const TrendIcon =
    summary.trendLabel === "improving"
      ? TrendingUp
      : summary.trendLabel === "declining"
      ? TrendingDown
      : Minus;

  const trendColor =
    summary.trendLabel === "improving"
      ? "text-zen-green"
      : summary.trendLabel === "declining"
      ? "text-zen-red"
      : "text-moon-faint";

  const sparklineColor =
    summary.recentAverage >= 70
      ? "#7dd3a8" // zen-green
      : summary.recentAverage >= 50
      ? "#e8a857" // lantern
      : "#e87c7c"; // zen-red

  const sparklineFill =
    summary.recentAverage >= 70
      ? "rgba(125, 211, 168, 0.15)"
      : summary.recentAverage >= 50
      ? "rgba(232, 168, 87, 0.15)"
      : "rgba(232, 124, 124, 0.15)";

  return (
    <div
      className={cn(
        "bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zen-green/10 flex items-center justify-center">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-zen-green" />
          </div>
          <div>
            <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
              Goal Alignment Trend
            </h3>
            <p className="text-lg sm:text-xl font-semibold text-moon">
              {summary.recentAverage}% recent
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium",
            {
              "bg-zen-green/10 text-zen-green": summary.trendLabel === "improving",
              "bg-zen-red/10 text-zen-red": summary.trendLabel === "declining",
              "bg-night-soft text-moon-faint": summary.trendLabel === "stable",
            }
          )}
        >
          <TrendIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="capitalize hidden sm:inline">{summary.trendLabel}</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-3 overflow-hidden">
        <WeeklySparkline
          data={alignmentValues}
          width={280}
          height={56}
          strokeColor={sparklineColor}
          fillColor={sparklineFill}
        />
      </div>

      {/* Week labels */}
      <div className="flex justify-between text-xs text-moon-faint mb-4">
        <span>{weeks} weeks ago</span>
        <span>This week</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-night-mist">
        <div className="text-center">
          <p className="text-base sm:text-lg font-semibold text-moon">
            {summary.overallAverage}%
          </p>
          <p className="text-[0.625rem] sm:text-xs text-moon-faint">Overall avg</p>
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg font-semibold text-moon">
            {summary.recentAverage}%
          </p>
          <p className="text-[0.625rem] sm:text-xs text-moon-faint">Last 4 weeks</p>
        </div>
        <div className="text-center">
          <p className={cn("text-base sm:text-lg font-semibold", trendColor)}>
            {summary.trend > 0 ? "+" : ""}
            {summary.trend}%
          </p>
          <p className="text-[0.625rem] sm:text-xs text-moon-faint">Trend</p>
        </div>
      </div>
    </div>
  );
}

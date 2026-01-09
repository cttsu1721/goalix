"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DayData {
  date: string;
  alignment: number; // 0-100
  tasksCompleted: number;
}

interface AlignmentSparklineProps {
  data: DayData[];
  className?: string;
  height?: number;
  showTrend?: boolean;
  showAverage?: boolean;
}

export function AlignmentSparkline({
  data,
  className,
  height = 40,
  showTrend = true,
  showAverage = true,
}: AlignmentSparklineProps) {
  // Calculate stats
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const alignments = data.map((d) => d.alignment);
    const average = Math.round(
      alignments.reduce((a, b) => a + b, 0) / alignments.length
    );

    // Calculate trend (compare last 3 days to previous 3 days)
    let trend: "up" | "down" | "stable" = "stable";
    if (data.length >= 6) {
      const recent = alignments.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const previous = alignments.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
      const diff = recent - previous;
      if (diff > 5) trend = "up";
      else if (diff < -5) trend = "down";
    }

    const max = Math.max(...alignments);
    const min = Math.min(...alignments);

    return { average, trend, max, min };
  }, [data]);

  // Generate SVG path (moved before early return to follow hooks rules)
  const pathData = useMemo(() => {
    if (data.length === 0) return "";
    const width = 100; // Percentage width
    const padding = 2;
    const usableHeight = height - padding * 2;
    const stepX = width / (data.length - 1 || 1);

    const points = data.map((d, i) => {
      const x = i * stepX;
      // Invert Y (SVG y=0 is top)
      const y = padding + usableHeight - (d.alignment / 100) * usableHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [data, height]);

  // Generate area path (filled)
  const areaPath = useMemo(() => {
    if (data.length === 0) return "";
    const width = 100;
    const padding = 2;
    const usableHeight = height - padding * 2;
    const stepX = width / (data.length - 1 || 1);

    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = padding + usableHeight - (d.alignment / 100) * usableHeight;
      return `${x},${y}`;
    });

    // Close the path to create filled area
    return `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`;
  }, [data, height]);

  if (!stats || data.length === 0) {
    return (
      <div className={cn("text-xs text-moon-faint", className)}>
        No alignment data yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Sparkline SVG */}
      <div className="relative">
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height }}
        >
          {/* 50% line */}
          <line
            x1="0"
            y1={height / 2}
            x2="100"
            y2={height / 2}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeDasharray="2,2"
          />

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#alignmentGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current point */}
          <circle
            cx="100"
            cy={height - 2 - ((data[data.length - 1]?.alignment || 0) / 100) * (height - 4)}
            r="3"
            fill={stats.average >= 70 ? "#7dd3a8" : stats.average >= 40 ? "#e8a857" : "#ef6461"}
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="alignmentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7dd3a8" />
              <stop offset="100%" stopColor="#7dd3a8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e8a857" />
              <stop offset="100%" stopColor="#7dd3a8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs">
        {showAverage && (
          <div className="flex items-center gap-1">
            <span className="text-moon-faint">Avg:</span>
            <span
              className={cn(
                "font-medium",
                stats.average >= 70
                  ? "text-zen-green"
                  : stats.average >= 40
                  ? "text-lantern"
                  : "text-zen-red"
              )}
            >
              {stats.average}%
            </span>
          </div>
        )}

        {showTrend && (
          <div
            className={cn(
              "flex items-center gap-1",
              stats.trend === "up"
                ? "text-zen-green"
                : stats.trend === "down"
                ? "text-zen-red"
                : "text-moon-faint"
            )}
          >
            {stats.trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : stats.trend === "down" ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span className="text-xs">
              {stats.trend === "up"
                ? "Improving"
                : stats.trend === "down"
                ? "Declining"
                : "Stable"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mini version for compact display
 */
export function AlignmentSparklineMini({
  data,
  className,
}: {
  data: DayData[];
  className?: string;
}) {
  return (
    <AlignmentSparkline
      data={data}
      height={24}
      showTrend={false}
      showAverage={false}
      className={className}
    />
  );
}

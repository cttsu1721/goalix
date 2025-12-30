"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";

interface KaizenCheckin {
  checkinDate: string;
  health: boolean;
  relationships: boolean;
  wealth: boolean;
  career: boolean;
  personalGrowth: boolean;
  lifestyle: boolean;
}

interface KaizenHeatmapProps {
  days?: number;
}

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function getIntensityClass(areasChecked: number): string {
  if (areasChecked === 0) return "bg-night-mist/30";
  if (areasChecked <= 2) return "bg-lantern/20";
  if (areasChecked <= 4) return "bg-lantern/40";
  if (areasChecked <= 5) return "bg-lantern/60";
  return "bg-lantern"; // All 6 areas
}

function countAreas(checkin: KaizenCheckin): number {
  return [
    checkin.health,
    checkin.relationships,
    checkin.wealth,
    checkin.career,
    checkin.personalGrowth,
    checkin.lifestyle,
  ].filter(Boolean).length;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function KaizenHeatmap({ days = 91 }: KaizenHeatmapProps) {
  const [checkins, setCheckins] = useState<KaizenCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    areas: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    async function fetchCheckins() {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const res = await fetch(
          `/api/kaizen?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}&limit=${days}`
        );
        if (res.ok) {
          const data = await res.json();
          setCheckins(data.checkins || []);
        }
      } catch (error) {
        console.error("Failed to fetch kaizen checkins:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCheckins();
  }, [days]);

  if (isLoading) {
    return (
      <div className="bg-night border border-night-mist rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-lantern" />
        </div>
      </div>
    );
  }

  // Build a map of date -> checkin
  const checkinMap = new Map<string, KaizenCheckin>();
  checkins.forEach((c) => {
    const dateKey = new Date(c.checkinDate).toISOString().split("T")[0];
    checkinMap.set(dateKey, c);
  });

  // Generate grid data (last N days, organized by week)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gridDays: Array<{ date: Date; areas: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const checkin = checkinMap.get(dateKey);
    gridDays.push({
      date,
      areas: checkin ? countAreas(checkin) : 0,
    });
  }

  // Calculate stats
  const totalCheckins = checkins.length;
  const balancedDays = checkins.filter((c) => countAreas(c) === 6).length;
  const avgAreas =
    checkins.length > 0
      ? (checkins.reduce((sum, c) => sum + countAreas(c), 0) / checkins.length).toFixed(1)
      : "0";

  // Organize into weeks (columns)
  const weeks: Array<Array<{ date: Date; areas: number } | null>> = [];
  let currentWeek: Array<{ date: Date; areas: number } | null> = [];

  // Pad the first week with nulls if needed
  const firstDayOfWeek = gridDays[0]?.date.getDay() || 0;
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  gridDays.forEach((day) => {
    currentWeek.push(day);
    if (day.date.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Push the last incomplete week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zen-green/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-zen-green" />
        </div>
        <div>
          <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Kaizen Activity
          </h3>
          <p className="text-xl font-semibold text-moon">Last {days} Days</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-night-soft rounded-xl">
          <p className="text-xl font-bold text-moon">{totalCheckins}</p>
          <p className="text-xs text-moon-faint">Check-ins</p>
        </div>
        <div className="text-center p-3 bg-night-soft rounded-xl">
          <p className="text-xl font-bold text-zen-green">{balancedDays}</p>
          <p className="text-xs text-moon-faint">Balanced Days</p>
        </div>
        <div className="text-center p-3 bg-night-soft rounded-xl">
          <p className="text-xl font-bold text-lantern">{avgAreas}</p>
          <p className="text-xs text-moon-faint">Avg. Areas</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        {/* Day labels */}
        <div className="flex flex-col gap-1 absolute -left-5 top-0">
          {DAYS_OF_WEEK.map((day, i) => (
            <div
              key={i}
              className="h-3 w-3 flex items-center justify-center text-[10px] text-moon-faint"
            >
              {i % 2 === 0 ? day : ""}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 overflow-x-auto pb-2 ml-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm transition-colors cursor-pointer ${
                    day ? getIntensityClass(day.areas) : "bg-transparent"
                  } ${day ? "hover:ring-1 hover:ring-lantern" : ""}`}
                  onMouseEnter={(e) => {
                    if (day) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredDay({
                        date: day.date,
                        areas: day.areas,
                        x: rect.left,
                        y: rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 px-3 py-2 bg-night-glow border border-night-mist rounded-lg text-xs text-moon shadow-xl pointer-events-none"
            style={{
              left: hoveredDay.x,
              top: hoveredDay.y - 40,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-medium">{formatDate(hoveredDay.date)}</p>
            <p className="text-moon-faint">
              {hoveredDay.areas === 0
                ? "No check-in"
                : `${hoveredDay.areas} area${hoveredDay.areas > 1 ? "s" : ""} improved`}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-moon-faint">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-night-mist/30" />
          <div className="w-3 h-3 rounded-sm bg-lantern/20" />
          <div className="w-3 h-3 rounded-sm bg-lantern/40" />
          <div className="w-3 h-3 rounded-sm bg-lantern/60" />
          <div className="w-3 h-3 rounded-sm bg-lantern" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

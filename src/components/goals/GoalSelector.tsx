"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, ChevronsUpDown, Search, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import type { GoalCategory } from "@prisma/client";

// Category configuration with colors and icons
const CATEGORY_CONFIG: Record<GoalCategory, { label: string; emoji: string; color: string }> = {
  HEALTH: { label: "Health", emoji: "💪", color: "text-green-400" },
  WEALTH: { label: "Wealth", emoji: "💰", color: "text-yellow-400" },
  RELATIONSHIPS: { label: "Relationships", emoji: "❤️", color: "text-pink-400" },
  CAREER: { label: "Career", emoji: "💼", color: "text-blue-400" },
  PERSONAL_GROWTH: { label: "Growth", emoji: "📚", color: "text-purple-400" },
  LIFESTYLE: { label: "Lifestyle", emoji: "🌿", color: "text-emerald-400" },
  OTHER: { label: "Other", emoji: "⭐", color: "text-moon-dim" },
};

// Local storage key for recent goals
const RECENT_GOALS_KEY = "goalix-recent-goals";
const MAX_RECENT_GOALS = 3;

interface WeeklyGoal {
  id: string;
  title: string;
  category: GoalCategory;
  description?: string;
}

interface GoalSelectorProps {
  goals: WeeklyGoal[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function GoalSelector({
  goals,
  value,
  onChange,
  placeholder = "Select goal...",
  className,
}: GoalSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentGoalIds, setRecentGoalIds] = useState<string[]>([]);

  // Load recent goals from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_GOALS_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecentGoalIds(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("");
    }
  }, [open]);

  // Save to recent goals when selection changes
  const handleSelect = (goalId: string) => {
    onChange(goalId);
    setOpen(false);

    // Update recent goals (only for actual goals, not "none")
    if (goalId && goalId !== "none") {
      const updated = [goalId, ...recentGoalIds.filter((id) => id !== goalId)].slice(
        0,
        MAX_RECENT_GOALS
      );
      setRecentGoalIds(updated);
      try {
        localStorage.setItem(RECENT_GOALS_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  // Get recent goals that still exist
  const recentGoals = useMemo(() => {
    return recentGoalIds
      .map((id) => goals.find((g) => g.id === id))
      .filter((g): g is WeeklyGoal => g !== undefined);
  }, [recentGoalIds, goals]);

  // Filter goals by search
  const filteredGoals = useMemo(() => {
    if (!search.trim()) return goals;
    const searchLower = search.toLowerCase();
    return goals.filter((g) => g.title.toLowerCase().includes(searchLower));
  }, [goals, search]);

  // Group filtered goals by category
  const groupedGoals = useMemo(() => {
    const groups: Record<GoalCategory, WeeklyGoal[]> = {
      HEALTH: [],
      WEALTH: [],
      RELATIONSHIPS: [],
      CAREER: [],
      PERSONAL_GROWTH: [],
      LIFESTYLE: [],
      OTHER: [],
    };

    filteredGoals.forEach((goal) => {
      groups[goal.category].push(goal);
    });

    // Return only non-empty groups
    return Object.entries(groups)
      .filter(([, goals]) => goals.length > 0)
      .map(([category, goals]) => ({
        category: category as GoalCategory,
        goals,
        config: CATEGORY_CONFIG[category as GoalCategory],
      }));
  }, [filteredGoals]);

  // Get selected goal for display
  const selectedGoal = goals.find((g) => g.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-night-soft border-night-mist text-moon hover:bg-night-mist hover:text-moon",
            "focus:ring-lantern/20 focus:border-lantern",
            !value && "text-moon-faint",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedGoal ? (
              <>
                <span>{CATEGORY_CONFIG[selectedGoal.category].emoji}</span>
                <span className="truncate">{selectedGoal.title}</span>
              </>
            ) : value === "none" ? (
              <span className="text-moon-faint">No goal</span>
            ) : (
              <span className="text-moon-faint">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 bg-night border-night-mist"
        align="start"
        sideOffset={4}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-night-mist px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 text-moon-faint" />
          <Input
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 bg-transparent text-moon placeholder:text-moon-faint focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          />
        </div>

        {/* Scrollable List */}
        <div className="max-h-[300px] overflow-y-scroll overscroll-contain">
          {/* No Goal Option */}
          <button
            type="button"
            onClick={() => handleSelect("none")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-left text-sm",
              "hover:bg-night-mist transition-colors",
              value === "none" ? "text-lantern" : "text-moon-faint"
            )}
          >
            <Check className={cn("h-4 w-4 shrink-0", value === "none" ? "opacity-100" : "opacity-0")} />
            <Target className="h-4 w-4 shrink-0 opacity-50" />
            <span>No goal</span>
          </button>

          {/* Recent Goals */}
          {!search && recentGoals.length > 0 && (
            <div className="border-t border-night-mist">
              <div className="px-3 py-1.5 text-xs text-moon-faint flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Recent
              </div>
              {recentGoals.map((goal) => (
                <button
                  key={`recent-${goal.id}`}
                  type="button"
                  onClick={() => handleSelect(goal.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-left text-sm",
                    "hover:bg-night-mist transition-colors",
                    value === goal.id ? "text-lantern" : "text-moon-soft"
                  )}
                >
                  <Check className={cn("h-4 w-4 shrink-0", value === goal.id ? "opacity-100" : "opacity-0")} />
                  <span className="shrink-0">{CATEGORY_CONFIG[goal.category].emoji}</span>
                  <span className="leading-snug">{goal.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Goals Grouped by Category */}
          {groupedGoals.length > 0 ? (
            groupedGoals.map(({ category, goals: categoryGoals, config }) => (
              <div key={category} className="border-t border-night-mist">
                <div className={cn("px-3 py-1.5 text-xs flex items-center gap-1.5", config.color)}>
                  <span>{config.emoji}</span>
                  {config.label}
                  <span className="text-moon-faint font-normal">({categoryGoals.length})</span>
                </div>
                {categoryGoals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleSelect(goal.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 pl-6 text-left text-sm",
                      "hover:bg-night-mist transition-colors",
                      value === goal.id ? "text-lantern" : "text-moon-soft"
                    )}
                  >
                    <Check className={cn("h-4 w-4 shrink-0", value === goal.id ? "opacity-100" : "opacity-0")} />
                    <span className="leading-snug">{goal.title}</span>
                  </button>
                ))}
              </div>
            ))
          ) : search ? (
            <div className="py-6 text-center text-sm text-moon-faint">
              No goals found.
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

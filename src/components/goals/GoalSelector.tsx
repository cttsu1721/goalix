"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, ChevronsUpDown, Search, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [recentGoalIds, setRecentGoalIds] = useState<string[]>([]);

  // Load recent goals from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_GOALS_KEY);
      if (stored) {
        setRecentGoalIds(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

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

  // Group goals by category
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

    goals.forEach((goal) => {
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
  }, [goals]);

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
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-night-mist px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-moon-faint" />
            <CommandInput
              placeholder="Search goals..."
              className="h-10 bg-transparent text-moon placeholder:text-moon-faint border-0 focus:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-night-soft [&::-webkit-scrollbar-thumb]:bg-night-mist [&::-webkit-scrollbar-thumb]:rounded-full">
            <CommandEmpty className="py-6 text-center text-sm text-moon-faint">
              No goals found.
            </CommandEmpty>

            {/* No Goal Option */}
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => handleSelect("none")}
                className="text-moon-faint hover:bg-night-mist hover:text-moon cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "none" ? "opacity-100" : "opacity-0"
                  )}
                />
                <Target className="mr-2 h-4 w-4 opacity-50" />
                No goal
              </CommandItem>
            </CommandGroup>

            {/* Recent Goals */}
            {recentGoals.length > 0 && (
              <>
                <CommandSeparator className="bg-night-mist" />
                <CommandGroup
                  heading={
                    <span className="flex items-center gap-1.5 text-moon-faint">
                      <Clock className="h-3 w-3" />
                      Recent
                    </span>
                  }
                >
                  {recentGoals.map((goal) => (
                    <CommandItem
                      key={`recent-${goal.id}`}
                      value={`recent-${goal.title}`}
                      onSelect={() => handleSelect(goal.id)}
                      className="text-moon-soft hover:bg-night-mist hover:text-moon cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === goal.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="mr-2 shrink-0">{CATEGORY_CONFIG[goal.category].emoji}</span>
                      <span className="text-sm leading-snug">{goal.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Goals Grouped by Category */}
            {groupedGoals.map(({ category, goals, config }) => (
              <CommandGroup
                key={category}
                heading={
                  <span className={cn("flex items-center gap-1.5", config.color)}>
                    <span>{config.emoji}</span>
                    {config.label}
                    <span className="text-moon-faint font-normal">({goals.length})</span>
                  </span>
                }
              >
                {goals.map((goal) => (
                  <CommandItem
                    key={goal.id}
                    value={goal.title}
                    onSelect={() => handleSelect(goal.id)}
                    className="text-moon-soft hover:bg-night-mist hover:text-moon cursor-pointer pl-6"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === goal.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-sm leading-snug">{goal.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  CheckCircle,
  Target,
  Star,
  TrendingUp,
  Settings,
  CalendarDays,
  Plus,
  Sparkles,
  CalendarRange,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Minimal goal type for search
interface SearchableGoal {
  id: string;
  title: string;
  type: "vision" | "three_year" | "one_year" | "monthly" | "weekly";
  category?: string;
}

interface CommandPaletteProps {
  onCreateTask?: () => void;
  onCreateGoal?: () => void;
}

export function CommandPalette({ onCreateTask, onCreateGoal }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Fetch all goals for search (only when palette is open)
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["goals-search"],
    queryFn: async () => {
      const res = await fetch("/api/goals/search");
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json() as Promise<{ success: boolean; data: SearchableGoal[] }>;
    },
    enabled: open, // Only fetch when palette is open
    staleTime: 30000, // Cache for 30 seconds
  });

  // Filter goals based on search query
  const filteredGoals = useMemo(() => {
    if (!goalsData?.data || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return goalsData.data
      .filter((goal) => goal.title.toLowerCase().includes(query))
      .slice(0, 8); // Limit to 8 results
  }, [goalsData?.data, searchQuery]);

  const GOAL_TYPE_LABELS: Record<SearchableGoal["type"], string> = {
    vision: "Vision",
    three_year: "3-Year",
    one_year: "1-Year",
    monthly: "Monthly",
    weekly: "Weekly",
  };

  const GOAL_TYPE_ICONS: Record<SearchableGoal["type"], typeof Star> = {
    vision: Star,
    three_year: Target,
    one_year: Target,
    monthly: CalendarRange,
    weekly: CalendarDays,
  };

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems = [
    {
      icon: CheckCircle,
      label: "Today",
      shortcut: "D",
      action: () => router.push("/dashboard"),
    },
    {
      icon: CalendarRange,
      label: "Month View",
      shortcut: "M",
      action: () => router.push("/month"),
    },
    {
      icon: CalendarDays,
      label: "This Week",
      shortcut: "W",
      action: () => router.push("/week"),
    },
    {
      icon: Star,
      label: "Visions",
      shortcut: "V",
      action: () => router.push("/goals?view=vision"),
    },
    {
      icon: Target,
      label: "Goals",
      shortcut: "G",
      action: () => router.push("/goals?view=goals"),
    },
    {
      icon: TrendingUp,
      label: "Progress",
      shortcut: "P",
      action: () => router.push("/progress"),
    },
    {
      icon: Settings,
      label: "Settings",
      shortcut: "S",
      action: () => router.push("/settings"),
    },
  ];

  const actionItems = [
    {
      icon: Plus,
      label: "Create Task",
      shortcut: "T",
      action: onCreateTask || (() => router.push("/dashboard")),
    },
    {
      icon: Sparkles,
      label: "Create Vision",
      action: () => router.push("/goals?view=vision&action=create"),
    },
    {
      icon: Target,
      label: "Create Goal",
      action: onCreateGoal || (() => router.push("/goals?view=goals&action=create")),
    },
  ];

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const navigateToGoal = (goal: SearchableGoal) => {
    const routes: Record<SearchableGoal["type"], string> = {
      vision: `/goals/${goal.id}?type=vision`,
      three_year: `/goals/${goal.id}?type=three_year`,
      one_year: `/goals/${goal.id}?type=one_year`,
      monthly: `/goals/${goal.id}?type=monthly`,
      weekly: `/goals/${goal.id}?type=weekly`,
    };
    runCommand(() => router.push(routes[goal.type]));
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search and navigate quickly"
    >
      <CommandInput
        placeholder="Type a command or search goals..."
        className="border-0 focus:ring-0 text-moon placeholder:text-moon-faint"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList className="bg-night text-moon">
        <CommandEmpty className="text-moon-dim">
          {goalsLoading ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            "No results found."
          )}
        </CommandEmpty>

        {/* Goal Search Results */}
        {filteredGoals.length > 0 && (
          <>
            <CommandGroup heading="Goals" className="text-moon-faint">
              {filteredGoals.map((goal) => {
                const Icon = GOAL_TYPE_ICONS[goal.type];
                return (
                  <CommandItem
                    key={`${goal.type}-${goal.id}`}
                    onSelect={() => navigateToGoal(goal)}
                    className="text-moon hover:bg-night-soft data-[selected=true]:bg-night-soft data-[selected=true]:text-moon"
                  >
                    <Icon className="mr-2 h-4 w-4 text-lantern" />
                    <span className="flex-1 truncate">{goal.title}</span>
                    <span className="text-[0.625rem] px-1.5 py-0.5 rounded bg-night-mist text-moon-faint ml-2">
                      {GOAL_TYPE_LABELS[goal.type]}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator className="bg-night-mist" />
          </>
        )}

        <CommandGroup heading="Navigation" className="text-moon-faint">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
              className="text-moon hover:bg-night-soft data-[selected=true]:bg-night-soft data-[selected=true]:text-moon"
            >
              <item.icon className="mr-2 h-4 w-4 text-moon-dim" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-night-mist bg-night-mist/50 px-1.5 font-mono text-[10px] font-medium text-moon-faint">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="bg-night-mist" />

        <CommandGroup heading="Quick Actions" className="text-moon-faint">
          {actionItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
              className="text-moon hover:bg-night-soft data-[selected=true]:bg-night-soft data-[selected=true]:text-moon"
            >
              <item.icon className="mr-2 h-4 w-4 text-lantern" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-night-mist bg-night-mist/50 px-1.5 font-mono text-[10px] font-medium text-moon-faint">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

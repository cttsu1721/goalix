"use client";

import { useEffect, useState, useCallback } from "react";
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
  Search,
  Sparkles,
  Calendar,
  Moon,
  Layers,
  CalendarRange,
} from "lucide-react";

interface CommandPaletteProps {
  onCreateTask?: () => void;
  onCreateGoal?: () => void;
}

export function CommandPalette({ onCreateTask, onCreateGoal }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
      label: "Today's Focus",
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
      label: "Week View",
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

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search and navigate quickly"
    >
      <CommandInput
        placeholder="Type a command or search..."
        className="border-0 focus:ring-0 text-moon placeholder:text-moon-faint"
      />
      <CommandList className="bg-night text-moon">
        <CommandEmpty className="text-moon-dim">
          No results found.
        </CommandEmpty>

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

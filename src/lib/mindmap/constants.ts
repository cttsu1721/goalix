import type { MindMapLevel } from "@/types/mindmap";

export const NODE_DIMENSIONS: Record<
  MindMapLevel,
  { width: number; height: number }
> = {
  dream: { width: 220, height: 100 },
  fiveYear: { width: 200, height: 90 },
  oneYear: { width: 180, height: 80 },
  monthly: { width: 160, height: 70 },
  weekly: { width: 150, height: 65 },
  task: { width: 140, height: 60 },
};

export const MOBILE_NODE_DIMENSIONS: Record<
  MindMapLevel,
  { width: number; height: number }
> = {
  dream: { width: 180, height: 90 },
  fiveYear: { width: 160, height: 80 },
  oneYear: { width: 150, height: 70 },
  monthly: { width: 140, height: 65 },
  weekly: { width: 130, height: 60 },
  task: { width: 120, height: 55 },
};

export const LEVEL_LABELS: Record<MindMapLevel, string> = {
  dream: "Dream",
  fiveYear: "5-Year",
  oneYear: "1-Year",
  monthly: "Monthly",
  weekly: "Weekly",
  task: "Task",
};

export const LEVEL_COLORS: Record<MindMapLevel, string> = {
  dream: "border-lantern/50",
  fiveYear: "border-zen-purple/40",
  oneYear: "border-zen-blue/40",
  monthly: "border-zen-green/40",
  weekly: "border-moon-dim/30",
  task: "border-night-mist/30",
};

export const LEVEL_BG: Record<MindMapLevel, string> = {
  dream: "bg-gradient-to-br from-lantern/10 to-night",
  fiveYear: "bg-gradient-to-br from-zen-purple/10 to-night",
  oneYear: "bg-gradient-to-br from-zen-blue/10 to-night",
  monthly: "bg-gradient-to-br from-zen-green/10 to-night",
  weekly: "bg-night",
  task: "bg-night-soft",
};

export const LAYOUT_CONFIG = {
  horizontal: {
    rankdir: "LR" as const,
    nodesep: 40,
    ranksep: 100,
  },
  vertical: {
    rankdir: "TB" as const,
    nodesep: 30,
    ranksep: 80,
  },
};

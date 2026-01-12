"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  Star,
  Target,
  Flag,
  Calendar,
  ListChecks,
  CheckCircle2,
  PauseCircle,
  Circle,
} from "lucide-react";
import Link from "next/link";

// Level-specific styling
const LEVEL_CONFIG = {
  sevenYear: {
    icon: Star,
    label: "7-Year Vision",
    bgClass: "bg-gradient-to-br from-violet-500 to-purple-600",
    borderClass: "border-violet-400",
    size: "w-56 h-24",
  },
  threeYear: {
    icon: Target,
    label: "3-Year Goal",
    bgClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
    borderClass: "border-blue-400",
    size: "w-52 h-20",
  },
  oneYear: {
    icon: Flag,
    label: "1-Year Goal",
    bgClass: "bg-gradient-to-br from-emerald-500 to-teal-600",
    borderClass: "border-emerald-400",
    size: "w-48 h-20",
  },
  monthly: {
    icon: Calendar,
    label: "Monthly",
    bgClass: "bg-gradient-to-br from-amber-500 to-orange-600",
    borderClass: "border-amber-400",
    size: "w-44 h-18",
  },
  weekly: {
    icon: ListChecks,
    label: "Weekly",
    bgClass: "bg-gradient-to-br from-rose-500 to-pink-600",
    borderClass: "border-rose-400",
    size: "w-40 h-16",
  },
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  HEALTH: "ring-green-400/50",
  WEALTH: "ring-yellow-400/50",
  RELATIONSHIPS: "ring-pink-400/50",
  CAREER: "ring-blue-400/50",
  PERSONAL_GROWTH: "ring-purple-400/50",
  LIFESTYLE: "ring-cyan-400/50",
  LIFE_MAINTENANCE: "ring-slate-400/50",
  OTHER: "ring-gray-400/50",
};

// Status icons
const STATUS_ICONS = {
  ACTIVE: Circle,
  COMPLETED: CheckCircle2,
  PAUSED: PauseCircle,
};

export interface GoalNodeData extends Record<string, unknown> {
  id: string;
  title: string;
  level: keyof typeof LEVEL_CONFIG;
  category: string;
  status: string;
  progress: number;
  childCount: number;
}

export type GoalNode = Node<GoalNodeData>;

function GoalTreeNodeComponent({ data }: NodeProps<GoalNode>) {
  const config = LEVEL_CONFIG[data.level];
  const Icon = config.icon;
  const StatusIcon = STATUS_ICONS[data.status as keyof typeof STATUS_ICONS] || Circle;
  const categoryRing = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.OTHER;

  const isCompleted = data.status === "COMPLETED";
  const isPaused = data.status === "PAUSED";

  return (
    <>
      {/* Top handle for parent connection */}
      {data.level !== "sevenYear" && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-white/80 !border-2 !border-slate-400"
        />
      )}

      <Link href={`/goals/${data.id}`}>
        <div
          className={cn(
            "rounded-xl shadow-lg transition-all duration-200",
            "hover:scale-105 hover:shadow-xl cursor-pointer",
            "ring-2 ring-offset-2 ring-offset-slate-900",
            categoryRing,
            config.size,
            isCompleted && "opacity-75",
            isPaused && "opacity-60 grayscale"
          )}
        >
          {/* Background */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl",
              config.bgClass,
              isCompleted && "opacity-80"
            )}
          />

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
            <div
              className="h-full bg-white/60 transition-all duration-500"
              style={{ width: `${data.progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="relative p-3 h-full flex flex-col text-white">
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="h-3.5 w-3.5 opacity-80" />
              <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">
                {config.label}
              </span>
              <StatusIcon
                className={cn(
                  "h-3 w-3 ml-auto",
                  isCompleted && "text-green-200",
                  isPaused && "text-yellow-200"
                )}
              />
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold leading-tight line-clamp-2">
              {data.title}
            </h3>

            {/* Footer info */}
            <div className="mt-auto flex items-center justify-between text-[10px] opacity-70">
              <span>{data.progress}%</span>
              {data.childCount > 0 && (
                <span>{data.childCount} child{data.childCount !== 1 ? "ren" : ""}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Bottom handle for children */}
      {data.level !== "weekly" && data.childCount > 0 && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-white/80 !border-2 !border-slate-400"
        />
      )}
    </>
  );
}

export const GoalTreeNode = memo(GoalTreeNodeComponent);

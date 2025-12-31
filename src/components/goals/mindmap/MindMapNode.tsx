"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Target,
  Calendar,
  Layers,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import type { MindMapNodeData, MindMapLevel } from "@/types/mindmap";
import { LEVEL_COLORS, LEVEL_BG, LEVEL_LABELS } from "@/lib/mindmap/constants";
import type { GoalCategory } from "@prisma/client";

const LEVEL_ICONS: Record<MindMapLevel, React.ComponentType<{ className?: string }>> = {
  dream: Sparkles,
  fiveYear: Target,
  oneYear: Calendar,
  monthly: Layers,
  weekly: CheckCircle2,
  task: Circle,
};

const CATEGORY_COLORS: Record<GoalCategory, string> = {
  HEALTH: "bg-zen-green",
  WEALTH: "bg-lantern",
  RELATIONSHIPS: "bg-zen-purple",
  CAREER: "bg-zen-blue",
  PERSONAL_GROWTH: "bg-zen-purple",
  LIFESTYLE: "bg-lantern",
  OTHER: "bg-moon-dim",
};

function MindMapNodeComponent({ data }: NodeProps<MindMapNodeData>) {
  const Icon = LEVEL_ICONS[data.level];
  const hasChildren = data.childrenCount > 0;
  const isDream = data.level === "dream";
  const isTask = data.level === "task";
  const isCompleted = data.status === "COMPLETED";

  const handleCardClick = () => {
    // Click toggles collapse if has children, otherwise does nothing
    if (hasChildren && !isTask) {
      data.onToggleCollapse?.();
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all duration-200",
        hasChildren && !isTask ? "cursor-pointer" : "cursor-default",
        "hover:shadow-lg hover:shadow-lantern/5",
        LEVEL_COLORS[data.level],
        LEVEL_BG[data.level],
        isDream && "shadow-md shadow-lantern/10",
        isCompleted && "opacity-60"
      )}
      style={{
        minWidth: isDream ? 200 : isTask ? 120 : 150,
        padding: isDream ? "12px 16px" : isTask ? "8px 10px" : "10px 12px",
      }}
      onClick={handleCardClick}
    >
      {/* Input handle (not for dreams) */}
      {data.level !== "dream" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2 !bg-night-glow !border-night-mist"
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={cn(
            "rounded-lg flex items-center justify-center",
            isDream
              ? "w-7 h-7 bg-lantern/20"
              : isTask
              ? "w-4 h-4 bg-night-mist"
              : "w-5 h-5 bg-night-mist"
          )}
        >
          <Icon
            className={cn(
              isDream
                ? "w-4 h-4 text-lantern"
                : isTask
                ? "w-2.5 h-2.5 text-moon-dim"
                : "w-3 h-3 text-moon-soft"
            )}
          />
        </div>

        <div
          className={cn(
            "rounded-full",
            isDream ? "w-2.5 h-2.5" : "w-2 h-2",
            CATEGORY_COLORS[data.category]
          )}
          title={data.category}
        />

        <div className="flex items-center gap-1 ml-auto">
          {/* Collapse indicator */}
          {hasChildren && !isTask && (
            <div
              className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
                "bg-night-mist/50 text-moon-soft",
                "text-[0.5rem] font-medium"
              )}
            >
              {data.isCollapsed ? (
                <>
                  <ChevronRight className="w-2.5 h-2.5" />
                  <span>+{data.childrenCount}</span>
                </>
              ) : (
                <ChevronDown className="w-2.5 h-2.5" />
              )}
            </div>
          )}

          {/* Navigate to goal button */}
          {!isTask && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onClick?.();
              }}
              className={cn(
                "p-1 rounded-md",
                "text-moon-dim hover:text-lantern hover:bg-lantern/10",
                "transition-colors duration-150"
              )}
              title="View goal details"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-medium text-moon line-clamp-2",
          isDream ? "text-sm" : isTask ? "text-[0.625rem]" : "text-xs"
        )}
      >
        {data.title}
      </h3>

      {/* Progress bar (not for tasks) */}
      {!isTask && (
        <div className="mt-2">
          <div className="h-1 bg-night-mist rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isDream
                  ? "bg-gradient-to-r from-lantern to-lantern/60"
                  : "bg-gradient-to-r from-moon-soft to-moon-dim"
              )}
              style={{ width: `${data.progress}%` }}
            />
          </div>
          {isDream && data.childrenCount > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-[0.5rem] text-moon-faint">
                {data.completedCount}/{data.childrenCount} goals
              </span>
              <span className="text-[0.5rem] text-lantern font-medium">
                {data.progress}%
              </span>
            </div>
          )}
        </div>
      )}


      {/* Output handle (not for tasks) */}
      {!isTask && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-night-glow !border-night-mist"
        />
      )}
    </div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);

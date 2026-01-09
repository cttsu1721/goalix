"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Target,
  Star,
  Calendar,
  CalendarDays,
  CalendarRange,
  Sparkles,
  Check,
  Clock,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface GoalNode {
  id: string;
  title: string;
  level: "vision" | "3year" | "1year" | "monthly" | "weekly";
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "ABANDONED";
  progress: number;
  children?: GoalNode[];
  category?: string;
}

interface GoalTreeProps {
  goals: GoalNode[];
  className?: string;
  expandedByDefault?: boolean;
  maxDepth?: number;
}

const LEVEL_CONFIG = {
  vision: {
    icon: Sparkles,
    color: "text-zen-purple",
    bgColor: "bg-zen-purple/10",
    borderColor: "border-zen-purple/30",
    label: "7-Year Vision",
  },
  "3year": {
    icon: Star,
    color: "text-lantern",
    bgColor: "bg-lantern/10",
    borderColor: "border-lantern/30",
    label: "3-Year Goal",
  },
  "1year": {
    icon: Target,
    color: "text-zen-green",
    bgColor: "bg-zen-green/10",
    borderColor: "border-zen-green/30",
    label: "1-Year Goal",
  },
  monthly: {
    icon: CalendarRange,
    color: "text-zen-blue",
    bgColor: "bg-zen-blue/10",
    borderColor: "border-zen-blue/30",
    label: "Monthly Goal",
  },
  weekly: {
    icon: CalendarDays,
    color: "text-moon-dim",
    bgColor: "bg-night-soft",
    borderColor: "border-night-mist",
    label: "Weekly Goal",
  },
};

const STATUS_ICONS = {
  ACTIVE: Clock,
  COMPLETED: Check,
  PAUSED: Pause,
  ABANDONED: null,
};

export function GoalTree({
  goals,
  className,
  expandedByDefault = true,
  maxDepth = 5,
}: GoalTreeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {goals.map((goal) => (
        <GoalTreeNode
          key={goal.id}
          node={goal}
          depth={0}
          maxDepth={maxDepth}
          defaultExpanded={expandedByDefault}
        />
      ))}
      {goals.length === 0 && (
        <div className="text-center py-8 text-moon-dim">
          <Target className="w-12 h-12 mx-auto mb-3 text-moon-faint/50" />
          <p className="text-sm">No goals yet</p>
          <p className="text-xs text-moon-faint mt-1">
            Start by creating your 7-year vision
          </p>
        </div>
      )}
    </div>
  );
}

function GoalTreeNode({
  node,
  depth,
  maxDepth,
  defaultExpanded,
}: {
  node: GoalNode;
  depth: number;
  maxDepth: number;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded && depth < maxDepth - 1
  );
  const config = LEVEL_CONFIG[node.level];
  const Icon = config.icon;
  const StatusIcon = STATUS_ICONS[node.status];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      {/* Connector line */}
      {depth > 0 && (
        <div
          className="absolute left-3 -top-4 w-px h-4 bg-night-mist"
          style={{ left: `${depth * 24 + 12}px` }}
        />
      )}

      {/* Node */}
      <div
        className="relative"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border transition-all",
            config.bgColor,
            config.borderColor,
            "hover:shadow-md"
          )}
        >
          {/* Expand/collapse toggle */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-0.5 p-0.5 hover:bg-night rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-moon-dim" />
              ) : (
                <ChevronRight className="w-4 h-4 text-moon-dim" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Icon */}
          <div className={cn("p-1.5 rounded-md bg-night flex-shrink-0")}>
            <Icon className={cn("w-4 h-4", config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/goals/${node.id}`}
              className="block group"
            >
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-moon truncate group-hover:text-lantern transition-colors">
                  {node.title}
                </h4>
                {StatusIcon && (
                  <StatusIcon
                    className={cn(
                      "w-3.5 h-3.5 flex-shrink-0",
                      node.status === "COMPLETED"
                        ? "text-zen-green"
                        : node.status === "PAUSED"
                        ? "text-moon-faint"
                        : "text-lantern"
                    )}
                  />
                )}
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={node.progress}
                  className="h-1 flex-1 max-w-[120px]"
                />
                <span className="text-xs text-moon-faint tabular-nums">
                  {node.progress}%
                </span>
                <span className="text-xs text-moon-faint">
                  {config.label}
                </span>
              </div>
            </Link>
          </div>

          {/* Children count */}
          {hasChildren && (
            <span className="text-xs text-moon-faint flex-shrink-0">
              {node.children?.length}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && depth < maxDepth && (
          <div className="mt-2 space-y-2 relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-3 top-0 w-px bg-night-mist"
              style={{
                height: `calc(100% - 16px)`,
                left: "12px",
              }}
            />
            {node.children?.map((child) => (
              <GoalTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                maxDepth={maxDepth}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Horizontal mindmap-style view
 */
export function GoalMindMap({
  goals,
  className,
}: {
  goals: GoalNode[];
  className?: string;
}) {
  // Flatten the tree for horizontal display
  const flattenedGoals = useMemo(() => {
    const flattened: { node: GoalNode; depth: number; parentId?: string }[] = [];

    function traverse(nodes: GoalNode[], depth: number, parentId?: string) {
      nodes.forEach((node) => {
        flattened.push({ node, depth, parentId });
        if (node.children) {
          traverse(node.children, depth + 1, node.id);
        }
      });
    }

    traverse(goals, 0);
    return flattened;
  }, [goals]);

  // Group by depth level
  const byLevel = useMemo(() => {
    const levels: Map<number, typeof flattenedGoals> = new Map();
    flattenedGoals.forEach((item) => {
      const existing = levels.get(item.depth) || [];
      levels.set(item.depth, [...existing, item]);
    });
    return levels;
  }, [flattenedGoals]);

  return (
    <div className={cn("overflow-x-auto pb-4", className)}>
      <div className="flex gap-8 min-w-max p-4">
        {Array.from(byLevel.entries()).map(([depth, items]) => (
          <div key={depth} className="space-y-3 w-[200px]">
            <p className="text-xs text-moon-faint uppercase tracking-wider mb-2">
              {depth === 0
                ? "Vision"
                : depth === 1
                ? "3-Year"
                : depth === 2
                ? "1-Year"
                : depth === 3
                ? "Monthly"
                : "Weekly"}
            </p>
            {items.map(({ node }) => {
              const config = LEVEL_CONFIG[node.level];
              const Icon = config.icon;

              return (
                <Link
                  key={node.id}
                  href={`/goals/${node.id}`}
                  className={cn(
                    "block p-3 rounded-lg border transition-all",
                    config.bgColor,
                    config.borderColor,
                    "hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("w-4 h-4", config.color)} />
                    <span className="text-sm text-moon truncate flex-1">
                      {node.title}
                    </span>
                  </div>
                  <Progress value={node.progress} className="h-1" />
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

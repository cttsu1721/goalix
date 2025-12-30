"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DreamBuilderResponse } from "@/lib/ai";
import type { GoalPath } from "@/hooks/useDreamBuilder";
import {
  Sparkles,
  Target,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
  X,
  Trash2,
} from "lucide-react";

interface DreamBuilderPreviewProps {
  hierarchy: DreamBuilderResponse;
  onUpdate: (path: GoalPath, updates: { title?: string; description?: string }) => void;
  onRemoveFiveYear?: (index: number) => void;
  onRemoveOneYear?: (fiveYearIndex: number, oneYearIndex: number) => void;
}

const LEVEL_STYLES = {
  dream: {
    icon: Sparkles,
    color: "lantern",
    label: "10-Year Dream",
  },
  fiveYear: {
    icon: Target,
    color: "zen-purple",
    label: "5-Year Goal",
  },
  oneYear: {
    icon: Calendar,
    color: "zen-blue",
    label: "1-Year Goal",
  },
  monthly: {
    icon: Layers,
    color: "zen-green",
    label: "Monthly Goal",
  },
  weekly: {
    icon: CheckCircle2,
    color: "moon-soft",
    label: "Weekly Goal",
  },
} as const;

interface GoalNodeProps {
  level: keyof typeof LEVEL_STYLES;
  title: string;
  description: string;
  path: GoalPath;
  onUpdate: (path: GoalPath, updates: { title?: string; description?: string }) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  children?: React.ReactNode;
  depth?: number;
  defaultExpanded?: boolean;
}

function GoalNode({
  level,
  title,
  description,
  path,
  onUpdate,
  onRemove,
  canRemove = false,
  children,
  depth = 0,
  defaultExpanded = true,
}: GoalNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);

  const style = LEVEL_STYLES[level];
  const Icon = style.icon;
  const hasChildren = !!children;

  const handleSave = () => {
    onUpdate(path, { title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditDescription(description);
    setIsEditing(false);
  };

  return (
    <div className={cn("relative", depth > 0 && "ml-6")}>
      {/* Connection line */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 -ml-3 w-px bg-night-mist/30" />
      )}

      {/* Node content */}
      <div className="relative group">
        {/* Horizontal connector */}
        {depth > 0 && (
          <div className="absolute left-0 top-5 -ml-3 w-3 h-px bg-night-mist/30" />
        )}

        <div
          className={cn(
            "rounded-xl border transition-all duration-200",
            "bg-night-soft/30 border-night-mist/30",
            "hover:bg-night-soft/50 hover:border-night-mist/50"
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-3 p-3">
            {/* Expand/collapse button */}
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-0.5 p-1 rounded-md hover:bg-night-mist/20 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-moon-dim" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-moon-dim" />
                )}
              </button>
            )}

            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                `bg-${style.color}/10 text-${style.color}`
              )}
              style={{
                backgroundColor: `var(--${style.color}, oklch(0.8 0.15 80)) / 0.1`,
              }}
            >
              <Icon className={cn("w-4 h-4", `text-${style.color}`)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-8 text-sm bg-night border-night-mist/50 text-moon"
                    autoFocus
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="h-8 text-sm bg-night border-night-mist/50 text-moon-dim"
                    placeholder="Description..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="h-7 px-2 bg-zen-green/20 text-zen-green hover:bg-zen-green/30"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      className="h-7 px-2 text-moon-dim hover:text-moon"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", `text-${style.color}`)}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-moon truncate">{title}</p>
                  <p className="text-xs text-moon-dim line-clamp-2 mt-0.5">{description}</p>
                </>
              )}
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-md hover:bg-night-mist/30 text-moon-dim hover:text-moon transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {canRemove && onRemove && (
                  <button
                    onClick={onRemove}
                    className="p-1.5 rounded-md hover:bg-zen-red/20 text-moon-dim hover:text-zen-red transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">{children}</div>
      )}
    </div>
  );
}

export function DreamBuilderPreview({
  hierarchy,
  onUpdate,
  onRemoveFiveYear,
  onRemoveOneYear,
}: DreamBuilderPreviewProps) {
  return (
    <div className="space-y-3">
      {/* Dream */}
      <GoalNode
        level="dream"
        title={hierarchy.dream.title}
        description={hierarchy.dream.description}
        path={{ type: "dream" }}
        onUpdate={onUpdate}
        defaultExpanded
      >
        {/* 5-Year Goals */}
        {hierarchy.fiveYearGoals.map((fiveYear, fyIndex) => (
          <GoalNode
            key={`fy-${fyIndex}`}
            level="fiveYear"
            title={fiveYear.title}
            description={fiveYear.description}
            path={{ type: "fiveYear", index: fyIndex }}
            onUpdate={onUpdate}
            onRemove={() => onRemoveFiveYear?.(fyIndex)}
            canRemove={hierarchy.fiveYearGoals.length > 1}
            depth={1}
            defaultExpanded
          >
            {/* 1-Year Goals */}
            {fiveYear.oneYearGoals.map((oneYear, oyIndex) => (
              <GoalNode
                key={`oy-${fyIndex}-${oyIndex}`}
                level="oneYear"
                title={oneYear.title}
                description={oneYear.description}
                path={{ type: "oneYear", fiveYearIndex: fyIndex, oneYearIndex: oyIndex }}
                onUpdate={onUpdate}
                onRemove={() => onRemoveOneYear?.(fyIndex, oyIndex)}
                canRemove={fiveYear.oneYearGoals.length > 1}
                depth={2}
                defaultExpanded
              >
                {/* Monthly Goal */}
                <GoalNode
                  level="monthly"
                  title={oneYear.monthlyGoal.title}
                  description={oneYear.monthlyGoal.description}
                  path={{ type: "monthly", fiveYearIndex: fyIndex, oneYearIndex: oyIndex }}
                  onUpdate={onUpdate}
                  depth={3}
                  defaultExpanded
                >
                  {/* Weekly Goal */}
                  <GoalNode
                    level="weekly"
                    title={oneYear.monthlyGoal.weeklyGoal.title}
                    description={oneYear.monthlyGoal.weeklyGoal.description}
                    path={{ type: "weekly", fiveYearIndex: fyIndex, oneYearIndex: oyIndex }}
                    onUpdate={onUpdate}
                    depth={4}
                  />
                </GoalNode>
              </GoalNode>
            ))}
          </GoalNode>
        ))}
      </GoalNode>

      {/* Strategy Note */}
      {hierarchy.strategyNote && (
        <div className="mt-4 p-4 rounded-xl bg-lantern/5 border border-lantern/20">
          <p className="text-xs font-medium text-lantern mb-1">Strategy Note</p>
          <p className="text-sm text-moon-dim">{hierarchy.strategyNote}</p>
        </div>
      )}
    </div>
  );
}

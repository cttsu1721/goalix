"use client";

import { useState } from "react";
import {
  Plus,
  Check,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface SubtasksProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  className?: string;
  readOnly?: boolean;
  maxSubtasks?: number;
}

export function Subtasks({
  subtasks,
  onChange,
  className,
  readOnly = false,
  maxSubtasks = 10,
}: SubtasksProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress =
    subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAdd = () => {
    if (!newSubtaskTitle.trim() || subtasks.length >= maxSubtasks) return;

    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      order: subtasks.length,
    };

    onChange([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const handleToggle = (id: string) => {
    onChange(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
  };

  const handleDelete = (id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 text-sm text-moon-dim hover:text-moon transition-colors w-full"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        <span>
          Checklist ({completedCount}/{subtasks.length})
        </span>
        {subtasks.length > 0 && (
          <div className="flex-1 max-w-[100px] h-1.5 bg-night-mist rounded-full overflow-hidden">
            <div
              className="h-full bg-zen-green transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>

      {!isCollapsed && (
        <div className="space-y-1 pl-6">
          {/* Subtask list */}
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={cn(
                "flex items-center gap-2 py-1.5 px-2 rounded group",
                "hover:bg-night-soft transition-colors",
                subtask.completed && "opacity-60"
              )}
            >
              {!readOnly && (
                <GripVertical className="w-3 h-3 text-moon-faint/50 opacity-0 group-hover:opacity-100 cursor-grab" />
              )}
              <button
                onClick={() => !readOnly && handleToggle(subtask.id)}
                disabled={readOnly}
                className={cn(
                  "w-4 h-4 rounded border flex-shrink-0",
                  "flex items-center justify-center transition-all",
                  subtask.completed
                    ? "bg-zen-green border-zen-green"
                    : "border-night-glow hover:border-zen-green/50"
                )}
              >
                {subtask.completed && (
                  <Check className="w-3 h-3 text-void" strokeWidth={2.5} />
                )}
              </button>
              <span
                className={cn(
                  "text-sm flex-1",
                  subtask.completed
                    ? "line-through text-moon-faint"
                    : "text-moon"
                )}
              >
                {subtask.title}
              </span>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-moon-faint hover:text-zen-red transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Add new subtask */}
          {!readOnly && subtasks.length < maxSubtasks && (
            <div className="flex items-center gap-2 pt-1">
              <Plus className="w-4 h-4 text-moon-faint flex-shrink-0" />
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add subtask..."
                className="h-8 text-sm bg-transparent border-none focus-visible:ring-0 px-0 placeholder:text-moon-faint/50"
              />
              {newSubtaskTitle && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAdd}
                  className="h-6 px-2 text-xs"
                >
                  Add
                </Button>
              )}
            </div>
          )}

          {subtasks.length >= maxSubtasks && !readOnly && (
            <p className="text-xs text-moon-faint pl-6">
              Maximum {maxSubtasks} subtasks reached
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline checklist preview
 */
export function SubtasksPreview({
  subtasks,
  className,
}: {
  subtasks: Subtask[];
  className?: string;
}) {
  if (subtasks.length === 0) return null;

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex gap-0.5">
        {subtasks.slice(0, 5).map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              subtask.completed ? "bg-zen-green" : "bg-night-mist"
            )}
          />
        ))}
        {subtasks.length > 5 && (
          <span className="text-xs text-moon-faint ml-0.5">
            +{subtasks.length - 5}
          </span>
        )}
      </div>
      <span className="text-xs text-moon-faint">
        {completedCount}/{subtasks.length}
      </span>
    </div>
  );
}

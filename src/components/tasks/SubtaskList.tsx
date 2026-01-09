"use client";

import { useState, useRef, useEffect } from "react";
import {
  useSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  type Subtask,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Loader2,
  X,
  GripVertical,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubtaskListProps {
  taskId: string;
  onSubtaskChange?: () => void;
}

export function SubtaskList({ taskId, onSubtaskChange }: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useSubtasks(taskId);
  const createSubtask = useCreateSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  const subtasks = data?.subtasks || [];
  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      await createSubtask.mutateAsync({
        taskId,
        title: newSubtaskTitle.trim(),
      });
      setNewSubtaskTitle("");
      onSubtaskChange?.();
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to create subtask:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const handleToggleComplete = async (subtask: Subtask) => {
    try {
      await updateSubtask.mutateAsync({
        taskId,
        subtaskId: subtask.id,
        completed: !subtask.completed,
      });
      onSubtaskChange?.();
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
    }
  };

  const handleStartEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateSubtask.mutateAsync({
        taskId,
        subtaskId: editingId,
        title: editingTitle.trim(),
      });
      setEditingId(null);
      onSubtaskChange?.();
    } catch (error) {
      console.error("Failed to update subtask:", error);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleDelete = async (subtaskId: string) => {
    try {
      await deleteSubtask.mutateAsync({ taskId, subtaskId });
      onSubtaskChange?.();
    } catch (error) {
      console.error("Failed to delete subtask:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-moon-faint text-sm py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading subtasks...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-moon-soft text-sm">
          <ListChecks className="w-4 h-4" />
          <span>Subtasks</span>
          {totalCount > 0 && (
            <span className="text-moon-faint">
              ({completedCount}/{totalCount})
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <div className="h-1.5 w-20 bg-night-mist rounded-full overflow-hidden">
            <div
              className="h-full bg-zen-green transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Subtask List */}
      {subtasks.length > 0 && (
        <div className="space-y-1">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-lg",
                "bg-night-soft/50 hover:bg-night-soft transition-colors"
              )}
            >
              {/* Drag handle (visual only for now) */}
              <GripVertical className="w-3.5 h-3.5 text-moon-faint opacity-0 group-hover:opacity-50 cursor-grab" />

              {/* Checkbox */}
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => handleToggleComplete(subtask)}
                className={cn(
                  "border-night-mist data-[state=checked]:bg-zen-green data-[state=checked]:border-zen-green",
                  updateSubtask.isPending && "opacity-50"
                )}
                disabled={updateSubtask.isPending}
              />

              {/* Title or Edit Input */}
              {editingId === subtask.id ? (
                <Input
                  ref={editInputRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleEditKeyDown}
                  className="flex-1 h-7 py-0 px-2 bg-night border-lantern/50 text-moon text-sm focus:ring-lantern/20"
                />
              ) : (
                <span
                  onClick={() => handleStartEdit(subtask)}
                  className={cn(
                    "flex-1 text-sm cursor-text",
                    subtask.completed
                      ? "text-moon-faint line-through"
                      : "text-moon-soft"
                  )}
                >
                  {subtask.title}
                </span>
              )}

              {/* Delete button */}
              <button
                onClick={() => handleDelete(subtask.id)}
                className={cn(
                  "p-1 rounded opacity-0 group-hover:opacity-100",
                  "text-moon-faint hover:text-red-400 hover:bg-red-400/10",
                  "transition-all"
                )}
                disabled={deleteSubtask.isPending}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Subtask Input */}
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a subtask..."
          className="flex-1 h-8 bg-night-soft border-night-mist text-moon text-sm placeholder:text-moon-faint focus:border-lantern/50 focus:ring-lantern/20"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddSubtask}
          disabled={!newSubtaskTitle.trim() || createSubtask.isPending}
          className="h-8 px-3 bg-night-mist hover:bg-night-soft text-moon-soft hover:text-moon"
        >
          {createSubtask.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  useRecurringTemplates,
  useUpdateRecurringTemplate,
  useDeleteRecurringTemplate,
  formatRecurrencePattern,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  Repeat,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { RecurringTaskModal } from "./RecurringTaskModal";

interface RecurringTasksCardProps {
  className?: string;
  showAddButton?: boolean;
}

const PRIORITY_COLORS = {
  MIT: "text-lantern",
  PRIMARY: "text-zen-green",
  SECONDARY: "text-moon-dim",
};

export function RecurringTasksCard({
  className,
  showAddButton = true,
}: RecurringTasksCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useRecurringTemplates(false); // Include inactive
  const updateTemplate = useUpdateRecurringTemplate();
  const deleteTemplate = useDeleteRecurringTemplate();

  const templates = data?.templates || [];

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateTemplate.mutateAsync({
        id,
        isActive: !currentActive,
      });
      toast.success(currentActive ? "Recurring task paused" : "Recurring task resumed");
    } catch {
      toast.error("Failed to update recurring task");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTemplate.mutateAsync(deleteId);
      toast.success("Recurring task deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete recurring task");
    }
  };

  if (isLoading) {
    return (
      <div className={cn("bg-night-soft rounded-2xl p-4", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-moon-dim" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("bg-night-soft rounded-2xl p-4", className)}>
        <p className="text-sm text-red-400 text-center">Failed to load recurring tasks</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("bg-night-soft rounded-2xl p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-zen-green" />
            <h3 className="text-moon font-medium">Recurring Tasks</h3>
            {templates.length > 0 && (
              <span className="text-xs text-moon-faint bg-night-mist px-2 py-0.5 rounded-full">
                {templates.filter((t) => t.isActive).length} active
              </span>
            )}
          </div>
          {showAddButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCreateModal(true)}
              className="text-zen-green hover:bg-zen-green/10 text-sm h-7 px-2"
            >
              + Add
            </Button>
          )}
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-6">
            <Repeat className="w-8 h-8 text-moon-faint mx-auto mb-2" />
            <p className="text-sm text-moon-dim mb-3">No recurring tasks yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreateModal(true)}
              className="text-zen-green border-zen-green/30 hover:bg-zen-green/10"
            >
              <Repeat className="w-3 h-3 mr-1" />
              Create Recurring Task
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  template.isActive
                    ? "bg-night border-night-mist"
                    : "bg-night/50 border-night-mist/50 opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        template.isActive ? "text-moon" : "text-moon-dim"
                      )}
                    >
                      {template.title}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        PRIORITY_COLORS[template.priority]
                      )}
                    >
                      {template.priority}
                    </span>
                  </div>
                  <p className="text-xs text-moon-faint mt-0.5">
                    {formatRecurrencePattern(
                      template.pattern,
                      template.daysOfWeek,
                      template.customInterval
                    )}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-moon-dim hover:text-moon"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-night border-night-mist"
                  >
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(template.id, template.isActive)}
                      className="text-moon-soft focus:bg-night-mist focus:text-moon"
                    >
                      {template.isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteId(template.id)}
                      className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecurringTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-night border-night-mist">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-moon">Delete Recurring Task?</AlertDialogTitle>
            <AlertDialogDescription className="text-moon-dim">
              This will stop generating new instances of this task. Existing tasks will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-night-mist text-moon-soft hover:bg-night-soft">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteTemplate.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

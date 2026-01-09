"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, AlertTriangle, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalTitle: string;
  goalLevel: "vision" | "3year" | "1year" | "monthly" | "weekly";
  childrenCount?: number;
  isArchived?: boolean;
  onConfirm: () => void | Promise<void>;
}

const LEVEL_LABELS: Record<string, string> = {
  vision: "7-Year Vision",
  "3year": "3-Year Goal",
  "1year": "1-Year Goal",
  monthly: "Monthly Goal",
  weekly: "Weekly Goal",
};

export function GoalArchiveDialog({
  open,
  onOpenChange,
  goalTitle,
  goalLevel,
  childrenCount = 0,
  isArchived = false,
  onConfirm,
}: GoalArchiveDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-night border-night-mist">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-moon">
            {isArchived ? (
              <Undo2 className="w-5 h-5 text-zen-green" />
            ) : (
              <Archive className="w-5 h-5 text-lantern" />
            )}
            {isArchived ? "Restore Goal" : "Archive Goal"}
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            {LEVEL_LABELS[goalLevel]}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Goal title */}
          <div className="p-3 bg-night-soft rounded-lg">
            <p className="text-sm text-moon font-medium">{goalTitle}</p>
          </div>

          {/* Warning about children */}
          {!isArchived && childrenCount > 0 && (
            <div className="flex items-start gap-3 p-3 bg-lantern/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-lantern flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-moon">
                  This goal has {childrenCount} linked{" "}
                  {childrenCount === 1 ? "goal" : "goals"} beneath it.
                </p>
                <p className="text-xs text-moon-dim">
                  Child goals will also be archived when you archive this goal.
                </p>
              </div>
            </div>
          )}

          {/* Explanation */}
          <p className="text-sm text-moon-dim">
            {isArchived ? (
              <>
                Restoring this goal will make it active again. It will appear in
                your goal hierarchy and can be linked to new tasks.
              </>
            ) : (
              <>
                Archived goals are hidden from your main view but preserved for
                reference. You can restore them anytime from the archived goals
                section.
              </>
            )}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-moon-dim hover:text-moon"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              isArchived
                ? "bg-zen-green text-void hover:bg-zen-green/90"
                : "bg-lantern text-void hover:bg-lantern/90"
            )}
          >
            {isLoading ? (
              "Processing..."
            ) : isArchived ? (
              <>
                <Undo2 className="w-4 h-4 mr-2" />
                Restore Goal
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-2" />
                Archive Goal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

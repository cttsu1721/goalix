"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass, Target, AlertTriangle, ArrowRight } from "lucide-react";

interface DecisionCompassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  onLinkToGoal: () => void;
  onCreateAnyway: () => void;
  onCancel: () => void;
}

export function DecisionCompassDialog({
  open,
  onOpenChange,
  taskTitle,
  onLinkToGoal,
  onCreateAnyway,
  onCancel,
}: DecisionCompassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-night border-night-mist sm:max-w-[440px]">
        <DialogHeader className="text-center pb-2">
          {/* Icon */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Compass className="w-8 h-8 text-amber-400" />
          </div>

          <DialogTitle className="text-moon text-xl font-semibold">
            Decision Compass
          </DialogTitle>
          <DialogDescription className="text-moon-dim text-sm">
            This task isn&apos;t linked to any of your goals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task preview */}
          <div className="p-3 bg-night-soft border border-night-mist rounded-xl">
            <p className="text-xs text-moon-faint uppercase tracking-wider mb-1">
              Task
            </p>
            <p className="text-moon font-medium">{taskTitle}</p>
          </div>

          {/* The question */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-moon-soft text-sm leading-relaxed">
                  Does this task move you toward your{" "}
                  <span className="text-lantern font-medium">1-Year Target</span>?
                </p>
                <p className="text-moon-faint text-xs mt-2">
                  Every action should be filtered through your goals. Unlinked tasks
                  can lead to &quot;action faking&quot; — busy work that feels productive
                  but doesn&apos;t advance your vision.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={onLinkToGoal}
            className="w-full bg-lantern hover:bg-lantern-soft text-void font-medium h-11"
          >
            <Target className="w-4 h-4 mr-2" />
            Link to a Goal
          </Button>

          <Button
            onClick={onCreateAnyway}
            variant="outline"
            className="w-full bg-transparent border-night-mist text-moon-soft hover:bg-night-soft hover:text-moon h-11"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Create Anyway
          </Button>

          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full text-moon-faint hover:text-moon-dim hover:bg-transparent h-9"
          >
            Cancel
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-moon-faint pt-2">
          Unlinked tasks are tracked separately in your weekly review
        </p>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MitCardProps {
  task?: {
    id: string;
    title: string;
    category: string;
    estimatedMinutes?: number;
    completed: boolean;
  };
  onToggle?: () => void;
  onAiSuggest?: () => void;
  className?: string;
}

export function MitCard({ task, onToggle, onAiSuggest, className }: MitCardProps) {
  if (!task) {
    return (
      <section className={cn("mb-16", className)}>
        <div className="bg-night border border-night-mist rounded-[20px] p-9 relative">
          <div className="absolute left-9 top-9 bottom-9 w-[3px] bg-gradient-to-b from-lantern to-transparent rounded-full" />
          <div className="pl-7">
            <div className="text-[0.625rem] font-medium uppercase tracking-[0.25em] text-lantern mb-5">
              Most Important Task
            </div>
            <div className="text-center py-8">
              <p className="text-moon-dim mb-4">No MIT set for today</p>
              <Button
                variant="outline"
                onClick={onAiSuggest}
                className="bg-night-soft border-night-mist text-moon-soft hover:border-lantern hover:text-lantern hover:bg-lantern-mist"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Suggest MIT
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("mb-16", className)}>
      <div className="bg-night border border-night-mist rounded-[20px] p-9 relative">
        {/* Accent bar */}
        <div className="absolute left-9 top-9 bottom-9 w-[3px] bg-gradient-to-b from-lantern to-transparent rounded-full" />

        <div className="pl-7">
          {/* Label */}
          <div className="text-[0.625rem] font-medium uppercase tracking-[0.25em] text-lantern mb-5 flex items-center gap-2">
            Most Important Task
          </div>

          {/* Content */}
          <div className="flex items-start gap-6">
            {/* Checkbox */}
            <button
              onClick={onToggle}
              className={cn(
                "w-8 h-8 rounded-[10px] border-2 flex-shrink-0 mt-1",
                "flex items-center justify-center",
                "transition-all duration-300",
                task.completed
                  ? "bg-lantern border-lantern"
                  : "border-night-glow hover:border-lantern hover:bg-lantern-mist"
              )}
            >
              {task.completed && (
                <Check className="w-[18px] h-[18px] text-void" strokeWidth={2.5} />
              )}
            </button>

            {/* Body */}
            <div className="flex-1">
              <h3
                className={cn(
                  "text-2xl font-normal leading-relaxed mb-4 tracking-tight",
                  task.completed && "line-through text-moon-faint"
                )}
              >
                {task.title}
              </h3>
              <div className="flex gap-6 text-[0.8125rem] text-moon-faint">
                {task.estimatedMinutes && (
                  <span className="flex items-center gap-2">
                    ~{Math.floor(task.estimatedMinutes / 60) > 0
                      ? `${Math.floor(task.estimatedMinutes / 60)} hour${
                          task.estimatedMinutes >= 120 ? "s" : ""
                        }`
                      : `${task.estimatedMinutes} min`}
                  </span>
                )}
                <span>{task.category}</span>
                <span className="text-lantern font-medium">+100 pts</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 items-end">
              <span className="text-base font-medium text-lantern">100</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onAiSuggest}
                className="text-moon-faint border-night-glow bg-transparent hover:border-lantern hover:text-lantern text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Suggest
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

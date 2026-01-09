"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Star,
  Target,
  Calendar,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HIERARCHY_LEVELS = [
  {
    icon: Star,
    title: "7-Year Vision",
    description: "Your ultimate destination. The big dream that drives everything.",
    example: "\"Financial freedom with $5M net worth\"",
    color: "text-lantern",
    bgColor: "bg-lantern/10",
    borderColor: "border-lantern/30",
  },
  {
    icon: Target,
    title: "3-Year Goal",
    description: "Major milestone toward your vision. A concrete checkpoint.",
    example: "\"Build a profitable SaaS to $100K ARR\"",
    color: "text-zen-purple",
    bgColor: "bg-zen-purple/10",
    borderColor: "border-zen-purple/30",
  },
  {
    icon: Target,
    title: "1-Year Goal",
    description: "Your annual objective. What does success look like this year?",
    example: "\"Launch MVP and acquire 100 paying users\"",
    color: "text-zen-blue",
    bgColor: "bg-zen-blue/10",
    borderColor: "border-zen-blue/30",
  },
  {
    icon: Calendar,
    title: "Monthly Goal",
    description: "30-day focus. What must happen this month?",
    example: "\"Complete core features and beta testing\"",
    color: "text-zen-green",
    bgColor: "bg-zen-green/10",
    borderColor: "border-zen-green/30",
  },
  {
    icon: CalendarDays,
    title: "Weekly Goal",
    description: "This week's priority. The bridge from planning to action.",
    example: "\"Build and ship user authentication\"",
    color: "text-zen-teal",
    bgColor: "bg-zen-teal/10",
    borderColor: "border-zen-teal/30",
  },
  {
    icon: CheckSquare,
    title: "Daily Tasks",
    description: "The atomic unit of progress. What you do TODAY matters most.",
    example: "\"Write sign-up flow (MIT), Style login page, Add tests\"",
    color: "text-moon",
    bgColor: "bg-night-soft",
    borderColor: "border-night-mist",
  },
];

export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Reset expanded state when modal opens
  useEffect(() => {
    if (open) {
      setExpandedIndex(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-night border-night-mist sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-moon text-xl font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lantern" />
            How Goalzenix Works
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            The cascading goal framework that turns big dreams into daily action
          </DialogDescription>
        </DialogHeader>

        {/* Philosophy Section */}
        <div className="p-4 bg-lantern/5 border border-lantern/20 rounded-xl mt-4">
          <p className="text-sm text-moon-soft leading-relaxed">
            <span className="font-medium text-lantern">The core principle:</span> Every daily task should trace back to your biggest vision.
            When you complete a task, you&apos;re not just checking a box — you&apos;re building your future one step at a time.
          </p>
        </div>

        {/* Cascade Diagram */}
        <div className="mt-6 space-y-2">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint mb-4">
            The Goal Cascade
          </p>

          {HIERARCHY_LEVELS.map((level, index) => {
            const Icon = level.icon;
            const isExpanded = expandedIndex === index;
            const isLast = index === HIERARCHY_LEVELS.length - 1;

            return (
              <div key={level.title}>
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all duration-200",
                    level.bgColor,
                    level.borderColor,
                    isExpanded && "ring-1 ring-lantern/30"
                  )}
                  style={{ marginLeft: `${index * 8}px` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      level.bgColor
                    )}>
                      <Icon className={cn("w-4 h-4", level.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-sm", level.color)}>
                        {level.title}
                      </p>
                      <p className="text-xs text-moon-faint truncate">
                        {level.description}
                      </p>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-moon-faint transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-night-mist/50">
                      <p className="text-xs text-moon-dim italic">
                        Example: {level.example}
                      </p>
                    </div>
                  )}
                </button>

                {/* Connector arrow */}
                {!isLast && (
                  <div
                    className="flex items-center justify-center py-1"
                    style={{ marginLeft: `${(index * 8) + 16}px` }}
                  >
                    <div className="flex flex-col items-center text-moon-faint">
                      <div className="w-px h-2 bg-night-mist" />
                      <ChevronDown className="w-3 h-3 -my-0.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Insights */}
        <div className="mt-6 space-y-3">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Key Insights
          </p>

          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-night-soft rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-lantern/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-lantern">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-moon">MIT = Maximum Impact Task</p>
                <p className="text-xs text-moon-dim mt-0.5">
                  Each day, identify the ONE task that moves the needle most. Complete this first.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-night-soft rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-lantern/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-lantern">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-moon">Link Tasks to Goals</p>
                <p className="text-xs text-moon-dim mt-0.5">
                  Tasks linked to weekly goals keep you aligned. Random tasks can wait.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-night-soft rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-lantern/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-lantern">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-moon">Review Regularly</p>
                <p className="text-xs text-moon-dim mt-0.5">
                  Weekly reviews keep you course-correcting. Monthly reviews keep you honest.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-night-mist text-moon-soft hover:bg-night-soft"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

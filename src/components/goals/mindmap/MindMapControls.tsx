"use client";

import { cn } from "@/lib/utils";
import {
  Expand,
  Minimize2,
  ListTodo,
  Sparkles,
  Target,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MindMapControlsProps {
  includeTasks: boolean;
  onToggleTasks: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  stats: {
    totalDreams: number;
    totalGoals: number;
    totalTasks: number;
  };
}

export function MindMapControls({
  includeTasks,
  onToggleTasks,
  onExpandAll,
  onCollapseAll,
  stats,
}: MindMapControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-3">
      {/* Stats card */}
      <div className="bg-night/90 backdrop-blur-sm border border-night-mist rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-lantern" />
            <span className="text-moon-soft">{stats.totalDreams}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-zen-blue" />
            <span className="text-moon-soft">{stats.totalGoals}</span>
          </div>
          {includeTasks && (
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-zen-green" />
              <span className="text-moon-soft">{stats.totalTasks}</span>
            </div>
          )}
        </div>
      </div>

      {/* Control buttons */}
      <div className="bg-night/90 backdrop-blur-sm border border-night-mist rounded-xl p-2 shadow-lg flex flex-col gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  includeTasks
                    ? "text-lantern bg-lantern/10"
                    : "text-moon-dim hover:text-moon"
                )}
                onClick={onToggleTasks}
              >
                <ListTodo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {includeTasks ? "Hide Tasks" : "Show Tasks"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-moon-dim hover:text-moon"
                onClick={onExpandAll}
              >
                <Expand className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Expand All</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-moon-dim hover:text-moon"
                onClick={onCollapseAll}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Collapse All</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

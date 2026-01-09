"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SyncStatus } from "./SyncStatus";
import { HowItWorksModal } from "@/components/onboarding";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageHeaderProps {
  greeting?: string;
  title: string;
  subtitle?: string;
  showAiButton?: boolean;
  aiUsesRemaining?: number;
  aiUsesTotal?: number;
  onAiClick?: () => void;
  showSettingsIcon?: boolean;
  showSyncStatus?: boolean;
  showHelpButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  greeting,
  title,
  subtitle,
  showAiButton = false,
  aiUsesRemaining = 3,
  aiUsesTotal = 5,
  onAiClick,
  showSettingsIcon = false,
  showSyncStatus = false,
  showHelpButton = false,
  className,
  children,
}: PageHeaderProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <header
        className={cn(
          "flex flex-col lg:flex-row lg:justify-between lg:items-start gap-5",
          "mb-14 lg:mb-14",
          className
        )}
      >
        <div>
          {greeting && (
            <div className="text-[0.8125rem] text-moon-faint font-light mb-2 flex items-center gap-3">
              <span>{greeting}</span>
              {showSyncStatus && <SyncStatus />}
            </div>
          )}
          <h1 className="text-[1.875rem] font-light tracking-tight mb-1">
            {title}
          </h1>
          {subtitle && (
            <div className="text-sm text-moon-dim font-light">{subtitle}</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showAiButton && (
            <Button
              variant="outline"
              onClick={onAiClick}
              className={cn(
                "flex items-center gap-2.5",
                "bg-night-soft border-night-mist",
                "text-moon-soft text-[0.8125rem] font-normal",
                "hover:border-lantern hover:text-lantern hover:bg-lantern-mist",
                "transition-all duration-300",
                "w-full lg:w-auto justify-center"
              )}
            >
              <Sparkles className="w-[18px] h-[18px] opacity-70" />
              AI Suggest
              <span className="text-[0.6875rem] text-moon-faint bg-night-mist px-2 py-0.5 rounded-lg">
                {aiUsesRemaining}/{aiUsesTotal}
              </span>
            </Button>
          )}
          {children}
          {showHelpButton && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowHowItWorks(true)}
                    className={cn(
                      "w-10 h-10 rounded-xl",
                      "flex items-center justify-center",
                      "bg-night-soft border border-night-mist",
                      "text-moon-dim hover:text-lantern hover:border-lantern/50",
                      "transition-all duration-200",
                      "hidden lg:flex"
                    )}
                    aria-label="How it works"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-night border-night-mist">
                  How it works
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {showSettingsIcon && (
            <Link
              href="/settings"
              className={cn(
                "w-10 h-10 rounded-xl",
                "flex items-center justify-center",
                "bg-night-soft border border-night-mist",
                "text-moon-dim hover:text-moon hover:border-moon-dim",
                "transition-all duration-200",
                "hidden lg:flex" // Only show on desktop, mobile has nav
              )}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
      </header>

      {/* How It Works Modal */}
      <HowItWorksModal
        open={showHowItWorks}
        onOpenChange={setShowHowItWorks}
      />
    </>
  );
}

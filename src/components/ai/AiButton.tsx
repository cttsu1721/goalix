"use client";

import { Button } from "@/components/ui/button";
import { useAIUsage } from "@/hooks/useAI";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  showUsage?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function AiButton({
  onClick,
  loading = false,
  disabled = false,
  showUsage = true,
  variant = "outline",
  size = "default",
  className,
  children,
}: AiButtonProps) {
  const { data: usage, isLoading: usageLoading } = useAIUsage();

  const isDisabled = disabled || loading || (usage?.remaining === 0);
  const remaining = usage?.remaining ?? 5;
  const limit = usage?.limit ?? 5;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "relative group",
        variant === "outline" &&
          "border-zen-purple/30 text-zen-purple hover:border-zen-purple hover:bg-zen-purple/5",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}

      {children || "AI Suggest"}

      {/* Usage counter */}
      {showUsage && !usageLoading && (
        <span
          className={cn(
            "ml-2 text-xs px-1.5 py-0.5 rounded-md",
            remaining > 0
              ? "bg-zen-purple/10 text-zen-purple"
              : "bg-zen-red/10 text-zen-red"
          )}
        >
          {remaining}/{limit}
        </span>
      )}

      {/* Tooltip for no remaining uses */}
      {remaining === 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-night-glow border border-night-mist rounded-lg text-xs text-moon opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          Daily AI limit reached. Resets at midnight.
        </div>
      )}
    </Button>
  );
}

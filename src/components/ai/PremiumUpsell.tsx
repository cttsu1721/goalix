"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain, Target, Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumUpsellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: "goal_sharpener" | "task_suggester" | "general";
  usesRemaining?: number;
  dailyLimit?: number;
}

const FEATURE_INFO = {
  goal_sharpener: {
    title: "Goal Sharpener",
    description: "Transform vague goals into crystal-clear SMART objectives",
    icon: Target,
  },
  task_suggester: {
    title: "Task Suggester",
    description: "Get AI-powered daily task recommendations",
    icon: Brain,
  },
  general: {
    title: "AI Features",
    description: "Unlock unlimited AI assistance",
    icon: Sparkles,
  },
};

const PREMIUM_FEATURES = [
  "Unlimited AI goal sharpening",
  "Unlimited task suggestions",
  "Priority processing",
  "Advanced analytics",
  "Custom AI prompts",
  "Export to PDF",
];

export function PremiumUpsell({
  open,
  onOpenChange,
  feature = "general",
  usesRemaining = 0,
  dailyLimit = 5,
}: PremiumUpsellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const featureInfo = FEATURE_INFO[feature];
  const FeatureIcon = featureInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-night border-night-mist overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>Unlock unlimited AI features</DialogDescription>
        </DialogHeader>

        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zen-purple/10 via-transparent to-lantern/10 pointer-events-none" />

        <div className="relative py-6">
          {/* Crown icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-lantern/20 to-zen-purple/20">
              <Crown className="w-12 h-12 text-lantern" />
            </div>
          </div>

          {/* Usage status */}
          {usesRemaining > 0 ? (
            <div className="text-center mb-6">
              <p className="text-sm text-moon-dim mb-1">Daily limit</p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: dailyLimit }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-6 rounded-full",
                        i < usesRemaining
                          ? "bg-zen-green"
                          : "bg-night-mist"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-moon">
                  {usesRemaining}/{dailyLimit} uses left today
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center mb-6 p-3 bg-zen-red/10 rounded-lg">
              <Zap className="w-5 h-5 text-zen-red mx-auto mb-1" />
              <p className="text-sm text-zen-red font-medium">
                Daily limit reached
              </p>
              <p className="text-xs text-moon-dim mt-1">
                Resets at midnight or upgrade for unlimited access
              </p>
            </div>
          )}

          {/* Feature being used */}
          <div className="flex items-center gap-3 p-3 bg-night-soft rounded-lg mb-6">
            <FeatureIcon className="w-5 h-5 text-lantern" />
            <div>
              <p className="text-sm font-medium text-moon">{featureInfo.title}</p>
              <p className="text-xs text-moon-dim">{featureInfo.description}</p>
            </div>
          </div>

          {/* Premium features list */}
          <div className="space-y-2 mb-6">
            <p className="text-xs text-moon-faint uppercase tracking-wider mb-3">
              Premium includes
            </p>
            {PREMIUM_FEATURES.map((feat, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zen-green" />
                <span className="text-sm text-moon-dim">{feat}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            className={cn(
              "w-full bg-gradient-to-r from-lantern to-zen-purple text-void font-semibold",
              "hover:opacity-90 transition-opacity",
              "shadow-lg shadow-lantern/20"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Sparkles
              className={cn(
                "w-4 h-4 mr-2 transition-transform",
                isHovered && "scale-110"
              )}
            />
            Upgrade to Premium
          </Button>

          {/* Price hint */}
          <p className="text-xs text-moon-faint text-center mt-3">
            Starting at $9/month · Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact upsell banner for inline use
 */
export function PremiumUpsellBanner({
  usesRemaining,
  dailyLimit = 5,
  onUpgradeClick,
  className,
}: {
  usesRemaining: number;
  dailyLimit?: number;
  onUpgradeClick?: () => void;
  className?: string;
}) {
  const isLow = usesRemaining <= 2;
  const isEmpty = usesRemaining === 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg",
        isEmpty
          ? "bg-zen-red/10 border border-zen-red/20"
          : isLow
          ? "bg-lantern/10 border border-lantern/20"
          : "bg-night-soft border border-night-mist",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Zap
          className={cn(
            "w-4 h-4",
            isEmpty ? "text-zen-red" : isLow ? "text-lantern" : "text-moon-dim"
          )}
        />
        <span className="text-sm text-moon">
          {isEmpty
            ? "Daily limit reached"
            : `${usesRemaining}/${dailyLimit} AI uses left`}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUpgradeClick}
        className="text-xs text-lantern hover:text-lantern/80"
      >
        <Crown className="w-3 h-3 mr-1" />
        Upgrade
      </Button>
    </div>
  );
}

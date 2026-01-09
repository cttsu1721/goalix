"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";

interface BadgeEarnedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: {
    name: string;
    description: string;
    icon: string;
    category: string;
  } | null;
}

// Inner component that handles animation state
// Remounts when badge changes via key prop
function BadgeEarnedContent({
  badge,
  onClose,
  prefersReducedMotion,
}: {
  badge: NonNullable<BadgeEarnedModalProps["badge"]>;
  onClose: () => void;
  prefersReducedMotion: boolean;
}) {
  const [showContent, setShowContent] = useState(prefersReducedMotion);

  // Trigger animation and confetti on mount
  useEffect(() => {
    // For reduced motion: content is already shown via initial state, skip confetti
    if (prefersReducedMotion) {
      return;
    }

    // Delay content animation
    const timer = setTimeout(() => setShowContent(true), 100);

    // Fire celebratory confetti (less intense than level up)
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#e8a857", "#a78bfa", "#7dd3a8"],
    });

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const categoryColors: Record<string, string> = {
    streak: "from-zen-red/20 to-transparent",
    achievement: "from-lantern/20 to-transparent",
    category: "from-zen-purple/20 to-transparent",
  };

  return (
    <>
      {/* Gradient header */}
      <div className={cn("bg-gradient-to-b pt-10 pb-6", categoryColors[badge.category] || categoryColors.achievement)}>
        {/* Badge icon */}
        <div
          className={cn(
            "relative mx-auto w-24 h-24 rounded-2xl",
            "bg-night-soft border-2 border-night-glow",
            "flex items-center justify-center",
            "shadow-lg",
            "transition-all duration-500",
            showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        >
          <span className="text-5xl">{badge.icon}</span>
          {/* Sparkle effects */}
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-lantern animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        <div
          className={cn(
            "flex items-center justify-center gap-2 mb-2",
            "transition-all duration-500 delay-200",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Award className="w-4 h-4 text-zen-purple" />
          <span className="text-xs font-medium uppercase tracking-wider text-zen-purple">
            Badge Earned
          </span>
        </div>

        <h2
          className={cn(
            "text-xl font-semibold text-moon mb-2",
            "transition-all duration-500 delay-300",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {badge.name}
        </h2>

        <p
          className={cn(
            "text-moon-dim text-sm mb-6",
            "transition-all duration-500 delay-400",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {badge.description}
        </p>

        <Button
          onClick={onClose}
          className={cn(
            "w-full bg-zen-purple text-void hover:bg-zen-purple/90 h-10 rounded-xl",
            "transition-all duration-500 delay-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          Awesome!
        </Button>
      </div>
    </>
  );
}

export function BadgeEarnedModal({
  open,
  onOpenChange,
  badge,
}: BadgeEarnedModalProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-night border-night-glow max-w-sm text-center p-0 overflow-hidden">
        {/* Key forces content to remount with fresh animation state when badge changes */}
        <BadgeEarnedContent
          key={badge.name}
          badge={badge}
          onClose={() => onOpenChange(false)}
          prefersReducedMotion={prefersReducedMotion}
        />
      </DialogContent>
    </Dialog>
  );
}

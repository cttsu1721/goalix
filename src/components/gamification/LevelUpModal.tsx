"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousLevel: number;
  newLevel: number;
  newLevelName: string;
}

export function LevelUpModal({
  open,
  onOpenChange,
  previousLevel,
  newLevel,
  newLevelName,
}: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Delay content animation
      const timer = setTimeout(() => setShowContent(true), 100);

      // Fire celebratory confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#e8a857", "#7dd3a8", "#a78bfa", "#f0eef8"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-night border-night-glow max-w-sm text-center p-0 overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-b from-lantern/20 to-transparent pt-12 pb-8">
          {/* Level badge */}
          <div
            className={cn(
              "relative mx-auto w-28 h-28 rounded-full",
              "bg-gradient-to-br from-lantern via-lantern to-zen-green",
              "flex items-center justify-center",
              "shadow-lg shadow-lantern/30",
              "transition-all duration-500",
              showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
          >
            {/* Inner circle */}
            <div className="absolute inset-2 rounded-full bg-night flex items-center justify-center">
              <span className="text-4xl font-bold text-lantern">{newLevel}</span>
            </div>
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-lantern animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-zen-green animate-pulse delay-150" />
          </div>

          {/* Level up indicator */}
          <div
            className={cn(
              "flex items-center justify-center gap-2 mt-4",
              "transition-all duration-500 delay-200",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-moon-dim">Level {previousLevel}</span>
            <ArrowUp className="w-4 h-4 text-zen-green" />
            <span className="text-lantern font-medium">Level {newLevel}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h2
            className={cn(
              "text-2xl font-semibold text-moon mb-2",
              "transition-all duration-500 delay-300",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Level Up!
          </h2>
          <p
            className={cn(
              "text-moon-soft mb-6",
              "transition-all duration-500 delay-400",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            You&apos;ve reached <span className="text-lantern font-medium">{newLevelName}</span>!
            <br />
            Keep pushing towards your goals.
          </p>

          <Button
            onClick={() => onOpenChange(false)}
            className={cn(
              "w-full bg-lantern text-void hover:bg-lantern/90 h-11 rounded-xl",
              "transition-all duration-500 delay-500",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Keep Going!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

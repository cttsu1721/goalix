"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Target, Flame, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

const FIRST_MIT_CELEBRATION_KEY = "goalzenix_first_mit_celebrated";

// Check if user prefers reduced motion
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface FirstMitCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointsEarned?: number;
}

export function FirstMitCelebration({
  open,
  onOpenChange,
  pointsEarned = 100,
}: FirstMitCelebrationProps) {
  const [step, setStep] = useState(0);

  // Trigger celebration confetti when modal opens
  useEffect(() => {
    if (open && !prefersReducedMotion()) {
      // Delay confetti slightly for dramatic effect
      const timer = setTimeout(() => {
        // Gold confetti burst
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors: ["#e8a857", "#ffd700", "#f0eef8", "#7dd3a8"],
          gravity: 0.8,
          scalar: 1.2,
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleComplete = () => {
    // Mark as celebrated so it doesn't show again
    localStorage.setItem(FIRST_MIT_CELEBRATION_KEY, "true");
    onOpenChange(false);
  };

  const steps = [
    {
      icon: <Trophy className="w-16 h-16 text-lantern" />,
      title: "Your First MIT!",
      subtitle: `+${pointsEarned} points earned`,
      content: (
        <p className="text-moon-soft text-center">
          You just completed your Most Important Task — the single action that
          moves you closest to your goals.
        </p>
      ),
    },
    {
      icon: <Target className="w-16 h-16 text-zen-green" />,
      title: "Why MIT Matters",
      subtitle: "The 80/20 principle in action",
      content: (
        <div className="space-y-3 text-moon-soft text-sm">
          <p>
            Your MIT is the task that, if completed, makes the biggest impact on
            your goals — even if everything else goes sideways.
          </p>
          <p>
            By focusing on one high-leverage action each day, you build momentum
            that compounds over time.
          </p>
        </div>
      ),
    },
    {
      icon: <Flame className="w-16 h-16 text-lantern" />,
      title: "Build Your Streak",
      subtitle: "Consistency creates change",
      content: (
        <div className="space-y-4">
          <p className="text-moon-soft text-sm text-center">
            Complete your MIT daily to build a streak. Longer streaks earn bonus
            points!
          </p>
          <div className="flex justify-center gap-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-light text-lantern">+10%</div>
              <div className="text-xs text-moon-faint">per day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-zen-green">100%</div>
              <div className="text-xs text-moon-faint">max bonus</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-night border-night-mist overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.subtitle}</DialogDescription>
        </DialogHeader>

        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-lantern/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative py-6">
          {/* Icon with pulse animation */}
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                "p-4 rounded-full",
                step === 0 && "bg-lantern/10 animate-pulse",
                step === 1 && "bg-zen-green/10",
                step === 2 && "bg-lantern/10"
              )}
            >
              {currentStep.icon}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-moon mb-2">
              {currentStep.title}
            </h2>
            <p className="text-sm text-lantern flex items-center justify-center gap-2">
              {step === 0 && <Sparkles className="w-4 h-4" />}
              {currentStep.subtitle}
              {step === 0 && <Sparkles className="w-4 h-4" />}
            </p>
          </div>

          {/* Content */}
          <div className="mb-8 px-2">{currentStep.content}</div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === step
                    ? "w-6 bg-lantern"
                    : index < step
                    ? "bg-lantern/40"
                    : "bg-night-mist"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="flex-1 text-moon-dim hover:text-moon"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(step + 1);
                } else {
                  handleComplete();
                }
              }}
              className={cn(
                "bg-lantern text-void hover:bg-lantern/90",
                step === 0 ? "w-full" : "flex-1"
              )}
            >
              {step === steps.length - 1 ? (
                "Let's Go!"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Check if first MIT celebration has been shown
 */
export function hasSeenFirstMitCelebration(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(FIRST_MIT_CELEBRATION_KEY) === "true";
}

/**
 * Reset first MIT celebration (for testing)
 */
export function resetFirstMitCelebration(): void {
  localStorage.removeItem(FIRST_MIT_CELEBRATION_KEY);
}

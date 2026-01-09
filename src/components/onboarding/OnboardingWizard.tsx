"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Target,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Flame,
  ChevronRight,
  Loader2,
  Play,
} from "lucide-react";
import { toast } from "sonner";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const ONBOARDING_KEY = "goalzenix_onboarding_complete";

export function OnboardingWizard() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const router = useRouter();

  // Check if onboarding is needed
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Goalzenix",
      description: "Turn your 7-year vision into daily action",
      icon: <Sparkles className="w-12 h-12 text-lantern" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-moon-soft">
            Goalzenix helps you create a cascading system of goals, from your long-term vision down to actionable daily tasks.
          </p>
          <div className="flex justify-center gap-2 text-moon-dim text-sm">
            <span className="px-3 py-1 bg-night-soft rounded-full">7-Year Vision</span>
            <ChevronRight className="w-4 h-4 self-center" />
            <span className="px-3 py-1 bg-night-soft rounded-full">Goals</span>
            <ChevronRight className="w-4 h-4 self-center" />
            <span className="px-3 py-1 bg-night-soft rounded-full">Tasks</span>
          </div>
        </div>
      ),
    },
    {
      title: "Start with Your Vision",
      description: "What do you want to achieve in 7 years?",
      icon: <Target className="w-12 h-12 text-zen-green" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-moon-soft">
            Create your 7-year vision first. This becomes your North Star that guides all other goals.
          </p>
          <div className="bg-night-soft rounded-xl p-4 text-left">
            <p className="text-moon-dim text-sm mb-2">Example vision:</p>
            <p className="text-moon italic">
              &ldquo;Build a successful SaaS business generating $10M ARR while maintaining work-life balance&rdquo;
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Break It Down",
      description: "Cascade your vision into actionable steps",
      icon: <CheckCircle2 className="w-12 h-12 text-zen-blue" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-moon-soft">
            Break your 7-year vision into 3-year goals, then 1-year goals, monthly goals, and weekly goals.
          </p>
          <div className="space-y-2 text-sm">
            {[
              { label: "3-Year Goal", example: "Launch MVP and get 1000 users" },
              { label: "1-Year Goal", example: "Build and launch first product" },
              { label: "Monthly Goal", example: "Complete core features" },
              { label: "Weekly Goal", example: "Build authentication system" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-moon-dim">
                <span className="w-24 text-right text-moon-faint">{item.label}:</span>
                <span className="flex-1 text-left truncate">{item.example}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Gamify Your Progress",
      description: "Stay motivated with points, streaks, and badges",
      icon: <Trophy className="w-12 h-12 text-lantern" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-moon-soft">
            Earn points for completing tasks, maintain streaks for consistency, and unlock badges for achievements.
          </p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-lantern/10 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-lantern" />
              </div>
              <p className="text-xs text-moon-faint">Streaks</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zen-green/10 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-zen-green" />
              </div>
              <p className="text-xs text-moon-faint">Badges</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zen-blue/10 flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-zen-blue" />
              </div>
              <p className="text-xs text-moon-faint">Levels</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
    // Navigate to goals page to create first vision
    router.push("/goals?view=vision");
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const handleTrySampleGoals = async () => {
    setIsLoadingSamples(true);
    try {
      const response = await fetch("/api/sample-goals", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        toast.success("Sample goals created! Explore the app with real examples.");
        setOpen(false);
        router.push("/goals?view=vision");
        router.refresh();
      } else {
        toast.error(data.error?.message || "Failed to create sample goals");
      }
    } catch {
      toast.error("Failed to create sample goals");
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-night border-night-mist">
        <DialogHeader className="sr-only">
          <DialogTitle>{step.title}</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">{step.icon}</div>

          {/* Title & Description */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-moon mb-2">{step.title}</h2>
            <p className="text-moon-dim">{step.description}</p>
          </div>

          {/* Content */}
          <div className="mb-8">{step.content}</div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-6 bg-lantern"
                    : index < currentStep
                    ? "bg-lantern/40"
                    : "bg-night-mist"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          {isLastStep ? (
            <div className="space-y-3">
              {/* Primary: Create your own */}
              <Button
                onClick={handleComplete}
                className="w-full bg-lantern text-void hover:bg-lantern/90"
                disabled={isLoadingSamples}
              >
                Create My Own Vision
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Secondary: Try sample goals */}
              <Button
                variant="outline"
                onClick={handleTrySampleGoals}
                disabled={isLoadingSamples}
                className="w-full border-night-mist text-moon hover:bg-night-soft"
              >
                {isLoadingSamples ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating sample goals...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Try with Sample Goals
                  </>
                )}
              </Button>

              <p className="text-xs text-moon-faint text-center">
                Sample goals let you explore the app with pre-filled examples
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1 text-moon-dim hover:text-moon"
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-lantern text-void hover:bg-lantern/90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to check if onboarding is complete
 */
export function useOnboardingComplete(): boolean {
  const [complete, setComplete] = useState(true); // Default true to prevent flash

  useEffect(() => {
    setComplete(localStorage.getItem(ONBOARDING_KEY) === "true");
  }, []);

  return complete;
}

/**
 * Reset onboarding (for testing or settings)
 */
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}

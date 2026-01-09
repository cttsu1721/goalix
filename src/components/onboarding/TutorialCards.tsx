"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Target,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface TutorialCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  color: string;
}

interface TutorialCardsProps {
  onDismiss?: () => void;
  onCreateTask?: () => void;
  className?: string;
}

const TUTORIAL_DISMISSED_KEY = "goalzenix_tutorial_dismissed";

const TUTORIAL_CARDS: TutorialCard[] = [
  {
    id: "cascade",
    icon: <Layers className="w-6 h-6" />,
    title: "The Goal Cascade",
    description:
      "Your vision becomes reality through cascading goals: 7-Year Vision → 3-Year Goal → 1-Year Target → Monthly → Weekly → Daily Tasks.",
    tip: "Start with your 1-Year Target — it's your decision filter for every task.",
    color: "lantern",
  },
  {
    id: "mit",
    icon: <Star className="w-6 h-6" />,
    title: "Most Important Task",
    description:
      "Each day, identify your MIT — the ONE task that would make today a win. Complete it and you've succeeded.",
    tip: "MITs earn 100 points. Primary tasks earn 50, Secondary earn 25.",
    color: "zen-green",
  },
  {
    id: "alignment",
    icon: <Target className="w-6 h-6" />,
    title: "Goal Alignment",
    description:
      "Link tasks to weekly goals to stay focused. The app tracks your alignment percentage — aim for 80%+ to stay on track.",
    tip: "Unlinked tasks are fine for life maintenance, but they don't advance your goals.",
    color: "zen-blue",
  },
  {
    id: "ai",
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Assistant",
    description:
      "Use AI to sharpen goals, suggest tasks, and get unstuck. 5 free uses per day to help you stay productive.",
    tip: "Try AI task suggestions when you're not sure what to work on today.",
    color: "zen-purple",
  },
];

export function TutorialCards({
  onDismiss,
  onCreateTask,
  className,
}: TutorialCardsProps) {
  const [dismissed, setDismissed] = useState(true); // Default to hidden until we check
  const [currentIndex, setCurrentIndex] = useState(0);

  // Check if tutorial was dismissed
  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
      setDismissed(isDismissed === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(TUTORIAL_DISMISSED_KEY, "true");
    } catch {
      // Ignore localStorage errors
    }
    onDismiss?.();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : TUTORIAL_CARDS.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < TUTORIAL_CARDS.length - 1 ? prev + 1 : 0));
  };

  if (dismissed) {
    return null;
  }

  const currentCard = TUTORIAL_CARDS[currentIndex];

  const colorClasses = {
    lantern: {
      bg: "bg-lantern/10",
      border: "border-lantern/30",
      text: "text-lantern",
      dot: "bg-lantern",
    },
    "zen-green": {
      bg: "bg-zen-green/10",
      border: "border-zen-green/30",
      text: "text-zen-green",
      dot: "bg-zen-green",
    },
    "zen-blue": {
      bg: "bg-zen-blue/10",
      border: "border-zen-blue/30",
      text: "text-zen-blue",
      dot: "bg-zen-blue",
    },
    "zen-purple": {
      bg: "bg-zen-purple/10",
      border: "border-zen-purple/30",
      text: "text-zen-purple",
      dot: "bg-zen-purple",
    },
  };

  const colors = colorClasses[currentCard.color as keyof typeof colorClasses];

  return (
    <div className={cn("mb-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-lantern" />
          <span className="text-sm font-medium text-moon">Quick Start Guide</span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-moon-faint hover:text-moon hover:bg-night-soft transition-colors"
          title="Dismiss tutorials"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative rounded-2xl border p-6 transition-all duration-300",
          colors.bg,
          colors.border
        )}
      >
        {/* Navigation Dots */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {TUTORIAL_CARDS.map((card, index) => (
            <button
              key={card.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex ? colors.dot : "bg-moon-faint/30"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              colors.bg,
              colors.text
            )}
          >
            {currentCard.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-moon mb-2">{currentCard.title}</h3>
            <p className="text-sm text-moon-soft leading-relaxed mb-3">
              {currentCard.description}
            </p>
            {currentCard.tip && (
              <div className="flex items-start gap-2 text-xs text-moon-dim">
                <span className={cn("font-medium", colors.text)}>Tip:</span>
                <span>{currentCard.tip}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg text-moon-faint hover:text-moon hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-moon-faint">
              {currentIndex + 1} of {TUTORIAL_CARDS.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg text-moon-faint hover:text-moon hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* CTA based on card */}
          {currentIndex === 0 && (
            <Link href="/goals?view=1-year">
              <Button
                size="sm"
                className={cn("h-8 px-4", colors.bg, colors.text, "hover:opacity-90")}
              >
                Set 1-Year Target
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          )}
          {currentIndex === 1 && onCreateTask && (
            <Button
              size="sm"
              onClick={onCreateTask}
              className={cn("h-8 px-4", colors.bg, colors.text, "hover:opacity-90")}
            >
              Create First Task
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
          {currentIndex === 2 && (
            <Link href="/goals?view=weekly">
              <Button
                size="sm"
                className={cn("h-8 px-4", colors.bg, colors.text, "hover:opacity-90")}
              >
                Create Weekly Goal
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          )}
          {currentIndex === 3 && (
            <Button
              size="sm"
              onClick={handleDismiss}
              className={cn("h-8 px-4", colors.bg, colors.text, "hover:opacity-90")}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Got It!
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Export a hook to check if tutorial should be shown
export function useTutorialDismissed(): boolean {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
      setDismissed(isDismissed === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  return dismissed;
}

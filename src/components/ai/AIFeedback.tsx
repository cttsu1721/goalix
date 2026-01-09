"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AIFeedbackProps {
  interactionId?: string;
  context?: string;
  className?: string;
  onFeedback?: (isPositive: boolean) => void;
}

export function AIFeedback({
  interactionId,
  context,
  className,
  onFeedback,
}: AIFeedbackProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (isPositive: boolean) => {
    if (feedback !== null || isSubmitting) return;

    setIsSubmitting(true);
    const newFeedback = isPositive ? "positive" : "negative";

    try {
      // Submit feedback to API
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interactionId,
          feedback: newFeedback,
          context,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");

      setFeedback(newFeedback);
      onFeedback?.(isPositive);

      toast.success(
        isPositive
          ? "Thanks! We'll keep improving."
          : "Thanks for the feedback. We'll do better."
      );
    } catch {
      // Still show the feedback locally even if API fails
      setFeedback(newFeedback);
      onFeedback?.(isPositive);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        className
      )}
    >
      <span className="text-[10px] text-moon-faint mr-1">Was this helpful?</span>
      <button
        onClick={() => handleFeedback(true)}
        disabled={feedback !== null || isSubmitting}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-200",
          feedback === "positive"
            ? "bg-zen-green/20 text-zen-green"
            : feedback === "negative"
            ? "text-moon-faint opacity-50 cursor-not-allowed"
            : "text-moon-faint hover:text-zen-green hover:bg-zen-green/10"
        )}
        aria-label="This was helpful"
        aria-pressed={feedback === "positive"}
      >
        <ThumbsUp className={cn(
          "w-3.5 h-3.5",
          feedback === "positive" && "fill-current"
        )} />
      </button>
      <button
        onClick={() => handleFeedback(false)}
        disabled={feedback !== null || isSubmitting}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-200",
          feedback === "negative"
            ? "bg-zen-red/20 text-zen-red"
            : feedback === "positive"
            ? "text-moon-faint opacity-50 cursor-not-allowed"
            : "text-moon-faint hover:text-zen-red hover:bg-zen-red/10"
        )}
        aria-label="This was not helpful"
        aria-pressed={feedback === "negative"}
      >
        <ThumbsDown className={cn(
          "w-3.5 h-3.5",
          feedback === "negative" && "fill-current"
        )} />
      </button>
    </div>
  );
}

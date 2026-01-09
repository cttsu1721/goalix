"use client";

import { useState, useEffect } from "react";
import { Quote as QuoteIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyQuote, getRandomQuote, type Quote } from "@/lib/quotes";
import { cn } from "@/lib/utils";

interface MotivationalQuoteProps {
  className?: string;
}

/**
 * Motivational quote component for the dashboard
 * Shows a daily quote with option to refresh for a new random one
 */
export function MotivationalQuote({ className }: MotivationalQuoteProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize with daily quote on mount
  useEffect(() => {
    setQuote(getDailyQuote());
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Small delay for animation feedback
    setTimeout(() => {
      setQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 300);
  };

  if (!quote) {
    return null; // SSR placeholder
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-night-mist bg-gradient-to-br from-night via-night to-night-soft p-4",
        className
      )}
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 opacity-5">
        <QuoteIcon className="h-24 w-24 text-lantern" />
      </div>

      <div className="relative">
        {/* Quote icon */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lantern/10">
              <QuoteIcon className="h-3.5 w-3.5 text-lantern" />
            </div>
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
              Daily Inspiration
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0 text-moon-faint hover:text-lantern hover:bg-lantern/10"
            aria-label="Get new quote"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                isRefreshing && "animate-spin"
              )}
            />
          </Button>
        </div>

        {/* Quote text */}
        <blockquote className="mb-2">
          <p className="text-sm leading-relaxed text-moon italic">
            &ldquo;{quote.text}&rdquo;
          </p>
        </blockquote>

        {/* Author */}
        <p className="text-xs text-moon-dim">
          &mdash; {quote.author}
        </p>
      </div>
    </div>
  );
}

/**
 * Compact inline quote for smaller spaces
 */
export function MotivationalQuoteInline({ className }: MotivationalQuoteProps) {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(getDailyQuote());
  }, []);

  if (!quote) {
    return null;
  }

  return (
    <div className={cn("flex items-start gap-2 text-moon-dim", className)}>
      <QuoteIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-lantern/60" />
      <p className="text-xs italic leading-relaxed">
        &ldquo;{quote.text}&rdquo; &mdash; {quote.author}
      </p>
    </div>
  );
}

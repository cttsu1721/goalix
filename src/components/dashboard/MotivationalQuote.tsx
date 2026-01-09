"use client";

import { useState, useMemo, useEffect } from "react";
import { Quote as QuoteIcon, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyQuote, getRandomQuote, type Quote } from "@/lib/quotes";
import { cn } from "@/lib/utils";

interface MotivationalQuoteProps {
  className?: string;
  /** Start collapsed on mobile to save space */
  defaultCollapsed?: boolean;
}

const COLLAPSED_STORAGE_KEY = "goalzenix-quote-collapsed";

/**
 * Motivational quote component for the dashboard
 * Shows a daily quote with option to refresh for a new random one
 * Can be collapsed to save vertical space on mobile
 */
export function MotivationalQuote({ className, defaultCollapsed = false }: MotivationalQuoteProps) {
  // Track refresh count to trigger new quote selection
  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  // Memoize quote based on refresh count - avoids setState in effect
  const quote = useMemo<Quote>(() => {
    if (refreshCount === 0) {
      return getDailyQuote();
    }
    return getRandomQuote();
  }, [refreshCount]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Small delay for animation feedback
    setTimeout(() => {
      setRefreshCount((c) => c + 1);
      setIsRefreshing(false);
    }, 300);
  };

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(newState));
  };

  // Collapsed state - minimal footprint
  if (isCollapsed) {
    return (
      <button
        onClick={toggleCollapsed}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
          "border border-night-mist bg-night-soft/50",
          "hover:bg-night-soft hover:border-night-glow transition-colors",
          "text-left group",
          className
        )}
      >
        <QuoteIcon className="w-3.5 h-3.5 text-lantern/60 flex-shrink-0" />
        <span className="text-xs text-moon-dim italic truncate flex-1">
          &ldquo;{quote.text.slice(0, 50)}...&rdquo;
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-moon-faint group-hover:text-moon-dim transition-colors flex-shrink-0" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-night-mist bg-gradient-to-br from-night via-night to-night-soft p-3 sm:p-4",
        className
      )}
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 opacity-5">
        <QuoteIcon className="h-20 w-20 sm:h-24 sm:w-24 text-lantern" />
      </div>

      <div className="relative">
        {/* Quote header - more compact */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-lantern/10">
              <QuoteIcon className="h-3 w-3 text-lantern" />
            </div>
            <span className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-moon-faint">
              Daily Inspiration
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-6 w-6 p-0 text-moon-faint hover:text-lantern hover:bg-lantern/10"
              aria-label="Get new quote"
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3 transition-transform duration-300",
                  isRefreshing && "animate-spin"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="h-6 w-6 p-0 text-moon-faint hover:text-moon-dim hover:bg-night-soft"
              aria-label="Collapse quote"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quote text */}
        <blockquote className="mb-1.5">
          <p className="text-[0.8125rem] sm:text-sm leading-relaxed text-moon italic">
            &ldquo;{quote.text}&rdquo;
          </p>
        </blockquote>

        {/* Author */}
        <p className="text-[0.6875rem] sm:text-xs text-moon-dim">
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
  // Use useMemo instead of useState + useEffect to avoid setState in effect
  const quote = useMemo<Quote>(() => getDailyQuote(), []);

  return (
    <div className={cn("flex items-start gap-2 text-moon-dim", className)}>
      <QuoteIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-lantern/60" />
      <p className="text-xs italic leading-relaxed">
        &ldquo;{quote.text}&rdquo; &mdash; {quote.author}
      </p>
    </div>
  );
}

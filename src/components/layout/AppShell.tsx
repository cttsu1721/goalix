"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  className?: string;
}

export function AppShell({ children, rightPanel, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen grid w-full max-w-full overflow-x-hidden",
        // Desktop: 3 columns
        "xl:grid-cols-[260px_1fr_320px]",
        // Tablet: 2 columns (no stats panel)
        "lg:grid-cols-[240px_1fr]",
        // Mobile: 1 column
        "grid-cols-1",
        className
      )}
    >
      {/* Sidebar - Hidden on mobile */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content */}
      <main className="bg-void overflow-y-auto overflow-x-hidden min-h-screen min-w-0">
        <div
          className={cn(
            // Desktop padding
            "xl:px-14 xl:py-12",
            // Tablet padding
            "lg:px-12 lg:py-10",
            // Mobile padding - tighter horizontal for more content
            "px-4 sm:px-6 py-6 sm:py-7",
            // Bottom padding for mobile nav + safe area
            "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-10",
            // Prevent content from overflowing
            "w-full max-w-full overflow-x-hidden"
          )}
        >
          <div className="w-full max-w-full min-w-0">
            {children}
          </div>
        </div>
      </main>

      {/* Stats Panel - Only visible on desktop */}
      {rightPanel && (
        <aside className="hidden xl:block bg-night border-l border-night-mist overflow-y-auto">
          <div className="p-7">{rightPanel}</div>
        </aside>
      )}

      {/* Mobile Navigation */}
      <MobileNav className="lg:hidden" />
    </div>
  );
}

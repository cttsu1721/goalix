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
        "min-h-screen grid",
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
      <main className="bg-void overflow-y-auto min-h-screen">
        <div
          className={cn(
            // Desktop padding
            "xl:px-14 xl:py-12",
            // Tablet padding
            "lg:px-12 lg:py-10",
            // Mobile padding with bottom nav clearance
            "px-6 py-7 pb-24 lg:pb-10"
          )}
        >
          {children}
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

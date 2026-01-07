"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Floating Action Button (FAB) for mobile quick-add.
 * Fixed position at bottom-right, only visible on mobile/tablet.
 */
export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    // Haptic feedback if available
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        // Base styles
        "fixed z-50 flex items-center justify-center",
        "w-14 h-14 rounded-full",
        // Positioning - bottom right with safe area padding
        "bottom-6 right-6",
        "safe-area-inset-bottom",
        // Colors - lantern accent
        "bg-lantern text-void",
        "shadow-lg shadow-lantern/25",
        // Hover/active states
        "hover:bg-lantern/90 hover:shadow-xl hover:shadow-lantern/30",
        "active:scale-95",
        // Transitions
        "transition-all duration-200 ease-out",
        // Press animation
        isPressed && "scale-90",
        // Only show on mobile/tablet (hidden on lg+)
        "lg:hidden",
        className
      )}
      aria-label="Add new task"
    >
      <Plus
        className={cn(
          "w-7 h-7 transition-transform duration-200",
          isPressed && "rotate-90"
        )}
        strokeWidth={2.5}
      />
    </button>
  );
}

interface FloatingActionMenuProps {
  onAddMit: () => void;
  onAddPrimary: () => void;
  onAddSecondary: () => void;
  className?: string;
}

/**
 * Expanded FAB menu with priority options.
 * Currently unused - keeping simple single-action FAB.
 */
export function FloatingActionMenu({
  onAddMit,
  onAddPrimary,
  onAddSecondary,
  className,
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (action: () => void) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
    action();
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "fixed z-50 bottom-6 right-6 lg:hidden",
        "safe-area-inset-bottom",
        className
      )}
    >
      {/* Menu options - shown when expanded */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col gap-3",
          "transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* MIT option */}
        <button
          onClick={() => handleOptionClick(onAddMit)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "bg-night border border-lantern/30",
            "text-moon text-sm font-medium",
            "shadow-lg transition-all duration-200",
            "hover:border-lantern hover:bg-lantern/10",
            "active:scale-95"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-lantern/20 flex items-center justify-center">
            <span className="text-lantern font-bold text-xs">MIT</span>
          </div>
          <span>Most Important Task</span>
        </button>

        {/* Primary option */}
        <button
          onClick={() => handleOptionClick(onAddPrimary)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "bg-night border border-moon-dim/30",
            "text-moon text-sm font-medium",
            "shadow-lg transition-all duration-200",
            "hover:border-moon-dim hover:bg-moon-dim/10",
            "active:scale-95"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-moon-dim/20 flex items-center justify-center">
            <span className="text-moon-dim font-bold text-xs">1-3</span>
          </div>
          <span>Primary Task</span>
        </button>

        {/* Secondary option */}
        <button
          onClick={() => handleOptionClick(onAddSecondary)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "bg-night border border-moon-faint/30",
            "text-moon text-sm font-medium",
            "shadow-lg transition-all duration-200",
            "hover:border-moon-faint hover:bg-moon-faint/10",
            "active:scale-95"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-moon-faint/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-moon-faint" />
          </div>
          <span>Secondary Task</span>
        </button>
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => {
          if ("vibrate" in navigator) {
            navigator.vibrate(10);
          }
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "bg-lantern text-void",
          "shadow-lg shadow-lantern/25",
          "hover:bg-lantern/90 hover:shadow-xl hover:shadow-lantern/30",
          "active:scale-95",
          "transition-all duration-200 ease-out"
        )}
        aria-label={isOpen ? "Close menu" : "Add new task"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" strokeWidth={2.5} />
        ) : (
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        )}
      </button>

      {/* Backdrop when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-void/50 -z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

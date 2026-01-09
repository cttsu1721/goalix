"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DraggableItem {
  id: string;
  title: string;
  priority?: string;
}

interface ReducedMotionDragDropProps {
  items: DraggableItem[];
  onReorder: (items: DraggableItem[]) => void;
  className?: string;
  renderItem?: (item: DraggableItem, index: number) => React.ReactNode;
}

/**
 * Accessible drag-and-drop alternative that uses buttons
 * instead of drag gestures for users who prefer reduced motion.
 */
export function ReducedMotionDragDrop({
  items,
  onReorder,
  className,
  renderItem,
}: ReducedMotionDragDropProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onReorder(newItems);

    // Update selection to follow the item
    setSelectedIndex(toIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowUp":
      case "k":
        e.preventDefault();
        if (selectedIndex === index && index > 0) {
          moveItem(index, index - 1);
        } else {
          setSelectedIndex(index);
        }
        break;
      case "ArrowDown":
      case "j":
        e.preventDefault();
        if (selectedIndex === index && index < items.length - 1) {
          moveItem(index, index + 1);
        } else {
          setSelectedIndex(index);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        setSelectedIndex(selectedIndex === index ? null : index);
        break;
      case "Escape":
        e.preventDefault();
        setSelectedIndex(null);
        break;
    }
  };

  return (
    <div className={cn("space-y-1", className)} role="listbox">
      <p className="sr-only">
        Use arrow keys to select an item, then use arrow keys again to move it.
        Press Enter to confirm selection, Escape to cancel.
      </p>
      {items.map((item, index) => {
        const isSelected = selectedIndex === index;

        return (
          <div
            key={item.id}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() =>
              setSelectedIndex(isSelected ? null : index)
            }
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg",
              "border transition-all cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-lantern/50",
              isSelected
                ? "border-lantern bg-lantern/10"
                : "border-night-mist bg-night-soft hover:bg-night hover:border-night-glow"
            )}
          >
            {/* Reorder controls */}
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  moveItem(index, index - 1);
                }}
                className="h-5 w-5 p-0"
                aria-label={`Move ${item.title} up`}
              >
                <ArrowUp
                  className={cn(
                    "w-3 h-3",
                    index === 0 ? "text-moon-faint/30" : "text-moon-faint"
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={index === items.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  moveItem(index, index + 1);
                }}
                className="h-5 w-5 p-0"
                aria-label={`Move ${item.title} down`}
              >
                <ArrowDown
                  className={cn(
                    "w-3 h-3",
                    index === items.length - 1
                      ? "text-moon-faint/30"
                      : "text-moon-faint"
                  )}
                />
              </Button>
            </div>

            {/* Selection indicator */}
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center",
                "border transition-colors",
                isSelected
                  ? "border-lantern bg-lantern"
                  : "border-night-glow"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-void" />}
            </div>

            {/* Item content */}
            <div className="flex-1 min-w-0">
              {renderItem ? (
                renderItem(item, index)
              ) : (
                <span className="text-sm text-moon">{item.title}</span>
              )}
            </div>

            {/* Position indicator */}
            <span className="text-xs text-moon-faint tabular-nums w-6 text-center">
              {index + 1}
            </span>
          </div>
        );
      })}

      {/* Instructions */}
      {selectedIndex !== null && (
        <div className="flex items-center justify-center gap-4 py-2 text-xs text-moon-dim">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-night rounded text-moon-faint">↑↓</kbd>
            Move
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-night rounded text-moon-faint">Esc</kbd>
            Cancel
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Wrapper that shows either drag-drop or button-based reordering
 * based on user preference
 */
export function AdaptiveDragDrop({
  items,
  onReorder,
  className,
  renderItem,
  children,
}: ReducedMotionDragDropProps & {
  children: React.ReactNode; // The default drag-drop UI
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <ReducedMotionDragDrop
        items={items}
        onReorder={onReorder}
        className={className}
        renderItem={renderItem}
      />
    );
  }

  // Render the standard drag-drop interface
  return <>{children}</>;
}

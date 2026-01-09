"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AccentColor {
  name: string;
  value: string;
  hsl: string;
  preview: string;
}

const ACCENT_COLORS: AccentColor[] = [
  {
    name: "Lantern",
    value: "lantern",
    hsl: "36 77% 63%",
    preview: "#e8a857",
  },
  {
    name: "Zen Green",
    value: "zen-green",
    hsl: "151 51% 66%",
    preview: "#7dd3a8",
  },
  {
    name: "Zen Purple",
    value: "zen-purple",
    hsl: "252 35% 69%",
    preview: "#9f94d7",
  },
  {
    name: "Zen Blue",
    value: "zen-blue",
    hsl: "211 90% 70%",
    preview: "#6bb3f7",
  },
  {
    name: "Coral",
    value: "coral",
    hsl: "3 86% 66%",
    preview: "#ef6461",
  },
  {
    name: "Rose",
    value: "rose",
    hsl: "340 82% 65%",
    preview: "#f06292",
  },
  {
    name: "Teal",
    value: "teal",
    hsl: "174 72% 51%",
    preview: "#26c6da",
  },
  {
    name: "Amber",
    value: "amber",
    hsl: "45 93% 58%",
    preview: "#fbbf24",
  },
];

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function AccentColorPicker({
  value,
  onChange,
  className,
}: AccentColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentColor = ACCENT_COLORS.find((c) => c.value === value) || ACCENT_COLORS[0];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm text-moon-dim">Accent Color</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-night-soft border-night-mist hover:bg-night hover:border-night-glow"
          >
            <div
              className="w-5 h-5 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: currentColor.preview }}
            />
            <span className="text-moon">{currentColor.name}</span>
            <Palette className="w-4 h-4 ml-auto text-moon-faint" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-3 bg-night border-night-mist"
          align="start"
        >
          <div className="grid grid-cols-4 gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full aspect-square rounded-lg relative",
                  "transition-all duration-150",
                  "hover:scale-110 hover:shadow-lg",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-moon/50",
                  value === color.value && "ring-2 ring-moon ring-offset-2 ring-offset-night"
                )}
                style={{ backgroundColor: color.preview }}
                title={color.name}
              >
                {value === color.value && (
                  <Check className="w-4 h-4 text-void absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-night-mist">
            <p className="text-xs text-moon-faint text-center">
              Accent color affects buttons, highlights, and active states
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Inline color picker (horizontal strip)
 */
export function AccentColorPickerInline({
  value,
  onChange,
  className,
}: AccentColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm text-moon-dim">Accent Color</label>
      <div className="flex gap-2">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={cn(
              "w-8 h-8 rounded-full relative",
              "transition-all duration-150",
              "hover:scale-110",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-moon/50",
              value === color.value &&
                "ring-2 ring-moon ring-offset-2 ring-offset-night"
            )}
            style={{ backgroundColor: color.preview }}
            title={color.name}
          >
            {value === color.value && (
              <Check className="w-3 h-3 text-void absolute inset-0 m-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { ACCENT_COLORS };
export type { AccentColor };

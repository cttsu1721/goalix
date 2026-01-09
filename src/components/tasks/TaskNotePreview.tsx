"use client";

import { useState } from "react";
import { StickyNote, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskNotePreviewProps {
  note: string;
  className?: string;
  maxLength?: number;
}

export function TaskNotePreview({
  note,
  className,
  maxLength = 80,
}: TaskNotePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!note || note.trim().length === 0) return null;

  const needsTruncation = note.length > maxLength;
  const displayText = needsTruncation && !isExpanded
    ? note.slice(0, maxLength).trim() + "..."
    : note;

  return (
    <div className={cn("mt-1.5", className)}>
      <div
        className={cn(
          "flex items-start gap-2 p-2 bg-night-soft/50 rounded-lg",
          "border border-night-mist/50",
          needsTruncation && "cursor-pointer hover:bg-night-soft transition-colors"
        )}
        onClick={needsTruncation ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <StickyNote className="w-3.5 h-3.5 text-moon-faint flex-shrink-0 mt-0.5" />
        <p className="text-xs text-moon-dim flex-1 whitespace-pre-wrap break-words">
          {displayText}
        </p>
        {needsTruncation && (
          <button className="flex-shrink-0 text-moon-faint hover:text-moon">
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

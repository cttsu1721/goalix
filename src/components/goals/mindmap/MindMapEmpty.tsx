"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MindMapEmptyProps {
  className?: string;
}

export function MindMapEmpty({ className }: MindMapEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full",
        className
      )}
    >
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-lantern/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-lantern" />
        </div>

        <h2 className="text-2xl font-semibold text-moon mb-3">
          Your Mind Map Awaits
        </h2>

        <p className="text-moon-dim mb-8 leading-relaxed">
          Create your first 10-year dream to see your goal hierarchy visualized
          as an interactive mind map. Watch your vision unfold from dreams to
          daily tasks.
        </p>

        <Link href="/goals?view=dreams">
          <Button className="bg-lantern hover:bg-lantern/90 text-night gap-2">
            Create Your First Dream
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

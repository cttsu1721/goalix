"use client";

import dynamic from "next/dynamic";
import { Loader2, Network } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

// Dynamic import to avoid SSR issues with React Flow
const GoalMindMap = dynamic(
  () =>
    import("@/components/goals/mindmap/GoalMindMap").then(
      (mod) => mod.GoalMindMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 text-lantern animate-spin" />
      </div>
    ),
  }
);

export default function MindMapPage() {
  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lantern/10 rounded-xl flex items-center justify-center">
              <Network className="w-5 h-5 text-lantern" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-moon">Mind Map</h1>
              <p className="text-xs text-moon-dim">
                Visualize your goal hierarchy
              </p>
            </div>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-night-mist">
          <GoalMindMap className="w-full h-full" />
        </div>
      </div>
    </AppShell>
  );
}

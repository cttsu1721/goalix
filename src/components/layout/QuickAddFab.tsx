"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCreateModal } from "@/components/tasks";

interface QuickAddFabProps {
  className?: string;
}

export function QuickAddFab({ className }: QuickAddFabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          // Position above mobile nav
          "fixed z-50",
          "right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]",
          // Size and shape
          "w-14 h-14 rounded-full",
          // Styling
          "bg-lantern text-void",
          "shadow-lg shadow-lantern/25",
          // Hover/active states
          "transition-all duration-200",
          "hover:bg-lantern/90 hover:scale-105",
          "active:scale-95",
          // Only show on mobile
          "lg:hidden",
          className
        )}
        aria-label="Quick add task"
      >
        <Plus className="w-6 h-6 mx-auto" strokeWidth={2.5} />
      </button>

      {/* Task Creation Modal */}
      <TaskCreateModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultPriority="SECONDARY"
      />
    </>
  );
}

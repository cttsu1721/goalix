"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface DraggedTask {
  id: string;
  title: string;
  priority: "PRIMARY" | "SECONDARY";
}

interface DragContextValue {
  draggedTask: DraggedTask | null;
  isDragging: boolean;
  startDrag: (task: DraggedTask) => void;
  endDrag: () => void;
}

const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: ReactNode }) {
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null);

  const startDrag = useCallback((task: DraggedTask) => {
    setDraggedTask(task);
  }, []);

  const endDrag = useCallback(() => {
    setDraggedTask(null);
  }, []);

  return (
    <DragContext.Provider
      value={{
        draggedTask,
        isDragging: !!draggedTask,
        startDrag,
        endDrag,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}

export function useDragContext() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within a DragProvider");
  }
  return context;
}

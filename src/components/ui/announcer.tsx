"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";

interface AnnouncerContextType {
  announce: (message: string, politeness?: "polite" | "assertive") => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Return a no-op if not within provider
    return { announce: () => {} };
  }
  return context;
}

interface AnnouncerProviderProps {
  children: React.ReactNode;
}

export function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, politeness: "polite" | "assertive" = "polite") => {
    if (politeness === "assertive") {
      setAssertiveMessage("");
      // Need to clear and re-set to trigger screen reader
      requestAnimationFrame(() => {
        setAssertiveMessage(message);
      });
    } else {
      setPoliteMessage("");
      requestAnimationFrame(() => {
        setPoliteMessage(message);
      });
    }

    // Clear messages after announcement
    setTimeout(() => {
      if (politeness === "assertive") {
        setAssertiveMessage("");
      } else {
        setPoliteMessage("");
      }
    }, 1000);
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Screen reader only live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

// Helper hook for common announcements
export function useTaskAnnouncements() {
  const { announce } = useAnnouncer();

  return {
    announceTaskCompleted: (taskTitle: string) => {
      announce(`Task completed: ${taskTitle}`);
    },
    announceTaskCreated: (taskTitle: string) => {
      announce(`Task created: ${taskTitle}`);
    },
    announceTaskDeleted: (taskTitle: string) => {
      announce(`Task deleted: ${taskTitle}`);
    },
    announceLevelUp: (level: number) => {
      announce(`Congratulations! You reached level ${level}`, "assertive");
    },
    announceBadgeEarned: (badgeName: string) => {
      announce(`Badge earned: ${badgeName}`, "assertive");
    },
    announceStreakMilestone: (days: number) => {
      announce(`${days} day streak achieved!`, "assertive");
    },
  };
}

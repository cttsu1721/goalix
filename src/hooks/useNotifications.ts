"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

// Check if notifications are supported
function getIsSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window;
}

// Get current notification permission
function getPermissionSnapshot(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "default";
  }
  return Notification.permission as NotificationPermission;
}

// SSR fallback
function getServerSnapshot(): NotificationPermission {
  return "default";
}

// Subscribe to permission changes (permission changes via user action are handled in callbacks)
function subscribeToPermission(callback: () => void): () => void {
  // Notification API doesn't have a native event for permission changes
  // We'll poll periodically as a fallback, or rely on our own callbacks
  if (typeof window === "undefined") return () => {};

  // Listen for visibility change as a proxy for potential permission changes
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      callback();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}

/**
 * Hook for managing browser notifications
 * Handles permission requests and sending notifications
 */
export function useNotifications(): UseNotificationsReturn {
  // Use useSyncExternalStore for permission (avoids setState in effect)
  const permission = useSyncExternalStore(
    subscribeToPermission,
    getPermissionSnapshot,
    getServerSnapshot
  );

  // isSupported is static and can be computed once
  const [isSupported] = useState(getIsSupported);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      // Permission is now synced via useSyncExternalStore
      return result as NotificationPermission;
    } catch {
      // Some browsers throw on requestPermission
      return "denied";
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        return;
      }

      // Default options with app branding
      const defaultOptions: NotificationOptions = {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "goalzenix",
        ...options,
      };

      try {
        new Notification(title, defaultOptions);
      } catch {
        // Fallback for when Notification constructor fails (e.g., in SW context)
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, defaultOptions);
          });
        }
      }
    },
    [isSupported, permission]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
  };
}

/**
 * Check if the current time is Sunday evening (5pm-9pm in user's timezone)
 */
export function isSundayEvening(timezone: string = "UTC"): boolean {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: "long",
      hour: "numeric",
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(now);

    const weekday = parts.find((p) => p.type === "weekday")?.value;
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);

    // Sunday between 5pm (17) and 9pm (21)
    return weekday === "Sunday" && hour >= 17 && hour < 21;
  } catch {
    return false;
  }
}

/**
 * Key for storing last notification timestamp in localStorage
 */
const LAST_WEEKLY_NOTIFICATION_KEY = "goalzenix_last_weekly_notification";

/**
 * Check if we should show the weekly review notification
 * (Not shown in the last 12 hours)
 */
export function shouldShowWeeklyNotification(): boolean {
  if (typeof window === "undefined") return false;

  const lastShown = localStorage.getItem(LAST_WEEKLY_NOTIFICATION_KEY);
  if (!lastShown) return true;

  const lastShownTime = parseInt(lastShown, 10);
  const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;

  return lastShownTime < twelveHoursAgo;
}

/**
 * Mark the weekly notification as shown
 */
export function markWeeklyNotificationShown(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_WEEKLY_NOTIFICATION_KEY, Date.now().toString());
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserSettings } from "@/hooks";
import {
  useNotifications,
  isSundayEvening,
  shouldShowWeeklyNotification,
  markWeeklyNotificationShown,
} from "@/hooks/useNotifications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Bell, BellOff, Clock, ChevronRight } from "lucide-react";

/**
 * WeeklyReviewReminder - Shows notification on Sunday evening
 *
 * Features:
 * - Checks if it's Sunday evening (5pm-9pm in user's timezone)
 * - Respects user's notification preference (notifyWeeklyReview)
 * - Shows browser notification if permission granted
 * - Shows in-app dialog as fallback/confirmation
 * - Stores last shown time to avoid spamming
 */
export function WeeklyReviewReminder() {
  const router = useRouter();
  const { data: settingsData, isLoading } = useUserSettings();
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
  const [showDialog, setShowDialog] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Dev-only: Expose test functions on window for manual testing
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      (window as Window & { __testWeeklyReview?: { showDialog: () => void; showPermission: () => void; sendNotification: () => void } }).__testWeeklyReview = {
        showDialog: () => setShowDialog(true),
        showPermission: () => setShowPermissionPrompt(true),
        sendNotification: () => {
          if (permission === "granted") {
            sendNotification("Time for Weekly Review!", {
              body: "Reflect on your week and plan for the next one.",
              tag: "weekly-review-test",
            });
          } else {
            console.log("Notification permission not granted. Current:", permission);
          }
        },
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as Window & { __testWeeklyReview?: unknown }).__testWeeklyReview;
      }
    };
  }, [permission, sendNotification]);

  const checkAndNotify = useCallback(() => {
    // Skip if loading or no data
    if (isLoading || !settingsData?.user) return;

    // Skip if user disabled weekly review notifications
    if (!settingsData.user.notifyWeeklyReview) return;

    // Skip if not Sunday evening
    const timezone = settingsData.user.timezone || "UTC";
    if (!isSundayEvening(timezone)) return;

    // Skip if already notified recently
    if (!shouldShowWeeklyNotification()) return;

    // Mark as shown to prevent repeated notifications
    markWeeklyNotificationShown();

    // Send browser notification if permission granted
    if (permission === "granted") {
      sendNotification("Time for Weekly Review!", {
        body: "Reflect on your week and plan for the next one.",
        tag: "weekly-review",
        requireInteraction: true,
        data: { url: "/review/weekly" },
      });
    }

    // Always show in-app dialog
    setShowDialog(true);
  }, [isLoading, settingsData, permission, sendNotification]);

  // Check on mount and every 30 minutes
  useEffect(() => {
    // Initial check after a short delay (let user settle in)
    const initialTimer = setTimeout(checkAndNotify, 5000);

    // Periodic check every 30 minutes
    const interval = setInterval(checkAndNotify, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [checkAndNotify]);

  // Check if we should prompt for notification permission
  useEffect(() => {
    if (
      isSupported &&
      permission === "default" &&
      settingsData?.user?.notifyWeeklyReview &&
      isSundayEvening(settingsData.user.timezone || "UTC")
    ) {
      // Show permission prompt if user wants notifications but hasn't granted permission
      setShowPermissionPrompt(true);
    }
  }, [isSupported, permission, settingsData]);

  const handleGoToReview = () => {
    setShowDialog(false);
    router.push("/review/weekly");
  };

  const handleRequestPermission = async () => {
    await requestPermission();
    setShowPermissionPrompt(false);
  };

  const handleDismissPermission = () => {
    setShowPermissionPrompt(false);
  };

  return (
    <>
      {/* Weekly Review Reminder Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-night border-night-mist sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-zen-purple/20 to-zen-purple/5 flex items-center justify-center mb-4">
              <CalendarCheck className="w-8 h-8 text-zen-purple" />
            </div>
            <DialogTitle className="text-moon text-xl text-center">
              Time for Weekly Review
            </DialogTitle>
            <DialogDescription className="text-moon-dim text-center">
              Sunday evening is the perfect time to reflect on your week and plan for the next one.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-night-soft rounded-xl p-4 my-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-lantern mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-moon font-medium">Takes about 10 minutes</p>
                <p className="text-xs text-moon-faint mt-1">
                  Review completed tasks, celebrate wins, and set intentions for the week ahead.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="bg-transparent border-night-mist text-moon-soft hover:bg-night-soft hover:text-moon w-full sm:w-auto"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleGoToReview}
              className="bg-zen-purple hover:bg-zen-purple/90 text-white w-full sm:w-auto"
            >
              Start Review
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Permission Prompt */}
      <Dialog open={showPermissionPrompt} onOpenChange={setShowPermissionPrompt}>
        <DialogContent className="bg-night border-night-mist sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-lantern/20 to-lantern/5 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-lantern" />
            </div>
            <DialogTitle className="text-moon text-xl text-center">
              Enable Notifications?
            </DialogTitle>
            <DialogDescription className="text-moon-dim text-center">
              Get gentle reminders for weekly reviews and keep your goals on track.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-4">
            <div className="flex items-start gap-3 p-3 bg-night-soft rounded-xl">
              <CalendarCheck className="w-5 h-5 text-zen-purple mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-moon font-medium">Weekly Review Reminder</p>
                <p className="text-xs text-moon-faint mt-0.5">
                  Sunday evenings at 5pm in your timezone
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDismissPermission}
              className="bg-transparent border-night-mist text-moon-soft hover:bg-night-soft hover:text-moon w-full sm:w-auto"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Not Now
            </Button>
            <Button
              onClick={handleRequestPermission}
              className="bg-lantern hover:bg-lantern-soft text-void w-full sm:w-auto"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SyncState = "idle" | "syncing" | "synced" | "error" | "offline";

interface SyncStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function SyncStatus({ className, showLabel = false }: SyncStatusProps) {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [isOnline, setIsOnline] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [showSynced, setShowSynced] = useState(false);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Track when sync completes
  useEffect(() => {
    if (isFetching === 0 && isMutating === 0 && isOnline) {
      setLastSynced(new Date());
      setShowSynced(true);

      // Hide "synced" checkmark after 2 seconds
      const timer = setTimeout(() => {
        setShowSynced(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isFetching, isMutating, isOnline]);

  // Determine current state
  const getSyncState = (): SyncState => {
    if (!isOnline) return "offline";
    if (isMutating > 0) return "syncing";
    if (isFetching > 0) return "syncing";
    if (showSynced) return "synced";
    return "idle";
  };

  const syncState = getSyncState();

  // Format last synced time
  const getLastSyncedText = () => {
    if (!lastSynced) return "Not synced yet";
    const seconds = Math.floor((Date.now() - lastSynced.getTime()) / 1000);
    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return lastSynced.toLocaleTimeString();
  };

  const stateConfig: Record<SyncState, {
    icon: typeof Cloud;
    color: string;
    label: string;
    animate?: boolean;
  }> = {
    idle: {
      icon: Cloud,
      color: "text-moon-faint",
      label: "Synced",
    },
    syncing: {
      icon: RefreshCw,
      color: "text-lantern",
      label: "Syncing...",
      animate: true,
    },
    synced: {
      icon: Check,
      color: "text-zen-green",
      label: "Saved",
    },
    error: {
      icon: AlertCircle,
      color: "text-zen-red",
      label: "Sync error",
    },
    offline: {
      icon: CloudOff,
      color: "text-amber-500",
      label: "Offline",
    },
  };

  const config = stateConfig[syncState];
  const Icon = config.icon;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors duration-200",
              config.color,
              className
            )}
            role="status"
            aria-live="polite"
            aria-label={config.label}
          >
            <Icon
              className={cn(
                "w-3.5 h-3.5",
                config.animate && "animate-spin"
              )}
            />
            {showLabel && (
              <span className="hidden sm:inline">{config.label}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-night border-night-mist text-moon text-xs"
        >
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            {syncState !== "offline" && lastSynced && (
              <p className="text-moon-faint">Last synced: {getLastSyncedText()}</p>
            )}
            {syncState === "offline" && (
              <p className="text-moon-faint">Changes will sync when online</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

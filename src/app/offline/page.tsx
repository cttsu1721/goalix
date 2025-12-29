"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <WifiOff className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-2xl font-bold">You&apos;re Offline</h1>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Please check your internet connection and try again.
      </p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
}

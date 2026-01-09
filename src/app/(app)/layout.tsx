"use client";

import { CommandPalette } from "@/components/layout/CommandPalette";
import { OnboardingWizard } from "@/components/onboarding";
import { WeeklyReviewReminder } from "@/components/notifications";
import { AnnouncerProvider } from "@/components/ui/announcer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnnouncerProvider>
      {children}
      <CommandPalette />
      <OnboardingWizard />
      <WeeklyReviewReminder />
    </AnnouncerProvider>
  );
}

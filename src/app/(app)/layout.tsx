"use client";

import { CommandPalette } from "@/components/layout/CommandPalette";
import { OnboardingWizard } from "@/components/onboarding";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CommandPalette />
      <OnboardingWizard />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserSettings, useUpdateUserSettings } from "@/hooks";
import { toast } from "sonner";
import {
  User,
  Clock,
  Bell,
  Palette,
  Shield,
  Trash2,
  ChevronRight,
  Check,
  AlertTriangle,
  Moon,
  Globe,
  LogOut,
  Loader2,
} from "lucide-react";

const timezones = [
  { value: "Australia/Melbourne", label: "Melbourne (AEDT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)" },
  { value: "Australia/Perth", label: "Perth (AWST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Chicago", label: "Chicago (CST)" },
  { value: "America/Denver", label: "Denver (MST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "UTC", label: "UTC" },
];

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-night border border-night-mist rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-night-mist">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center">
            <Icon className="w-5 h-5 text-lantern" />
          </div>
          <div>
            <h3 className="font-medium text-moon">{title}</h3>
            <p className="text-sm text-moon-dim">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-moon">{label}</p>
        {description && <p className="text-xs text-moon-faint mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${checked ? "bg-lantern" : "bg-night-mist"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div
          className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full h-11 bg-night-soft border border-night-mist rounded-xl px-4 text-moon appearance-none
            focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-faint rotate-90 pointer-events-none" />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 bg-night-soft border-night-mist text-moon placeholder:text-moon-faint rounded-xl focus:border-lantern focus:ring-lantern/20 disabled:opacity-50"
      />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-night border border-night-mist rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-night-mist">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-night-soft animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-night-soft rounded animate-pulse" />
                <div className="h-3 w-40 bg-night-soft rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="h-11 bg-night-soft rounded-xl animate-pulse" />
              <div className="h-11 bg-night-soft rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { data, isLoading, error } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReview: true,
    achievements: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form with fetched data
  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setTimezone(data.user.timezone || "UTC");
      setNotifications({
        dailyReminder: data.user.notifyDailyReminder,
        weeklyReview: data.user.notifyWeeklyReview,
        achievements: data.user.notifyAchievements,
      });
    }
  }, [data]);

  // Track unsaved changes
  useEffect(() => {
    if (!data?.user) return;

    const hasChanges =
      name !== (data.user.name || "") ||
      timezone !== data.user.timezone ||
      notifications.dailyReminder !== data.user.notifyDailyReminder ||
      notifications.weeklyReview !== data.user.notifyWeeklyReview ||
      notifications.achievements !== data.user.notifyAchievements;

    setHasUnsavedChanges(hasChanges);
  }, [name, timezone, notifications, data]);

  const handleSaveProfile = async () => {
    try {
      await updateSettings.mutateAsync({ name, timezone });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleToggleNotification = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      const updateKey = key === "dailyReminder" ? "notifyDailyReminder"
        : key === "weeklyReview" ? "notifyWeeklyReview"
        : "notifyAchievements";

      await updateSettings.mutateAsync({ [updateKey]: newValue });
      toast.success("Notification preference updated");
    } catch (err) {
      // Revert on error
      setNotifications((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
      toast.error("Failed to update notification preference");
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    setTimezone(newTimezone);
    try {
      await updateSettings.mutateAsync({ timezone: newTimezone });
      toast.success("Timezone updated successfully");
    } catch (err) {
      // Revert on error
      setTimezone(data?.user?.timezone || "UTC");
      toast.error("Failed to update timezone");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Account deleted successfully");
      signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Failed to delete account. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences"
        />
        <SettingsSkeleton />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences"
        />
        <div className="bg-zen-red-soft border border-zen-red/30 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-zen-red mx-auto mb-3" />
          <p className="text-moon">Failed to load settings</p>
          <p className="text-sm text-moon-dim mt-1">Please refresh the page and try again</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="space-y-6">
        {/* Profile Section */}
        <SettingsSection
          icon={User}
          title="Profile"
          description="Your personal information"
        >
          <div className="space-y-4">
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Your name"
            />
            <TextField
              label="Email"
              value={data?.user?.email || ""}
              type="email"
              disabled
            />
            <Button
              onClick={handleSaveProfile}
              disabled={updateSettings.isPending || name === (data?.user?.name || "")}
              className="bg-lantern text-void hover:bg-lantern/90 rounded-xl h-10"
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </SettingsSection>

        {/* Timezone Section */}
        <SettingsSection
          icon={Clock}
          title="Timezone"
          description="Used for streak calculations and daily resets"
        >
          <div className="space-y-4">
            <SelectField
              label="Timezone"
              value={timezone}
              options={timezones}
              onChange={handleTimezoneChange}
              disabled={updateSettings.isPending}
            />
            <p className="text-xs text-moon-faint flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              Your daily tasks reset at midnight in your selected timezone
            </p>
          </div>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Control how Goalix contacts you"
        >
          <div className="divide-y divide-night-mist">
            <ToggleSwitch
              checked={notifications.dailyReminder}
              onChange={() => handleToggleNotification("dailyReminder")}
              label="Daily Planning Reminder"
              description="Get reminded to plan your day each morning"
              disabled={updateSettings.isPending}
            />
            <ToggleSwitch
              checked={notifications.weeklyReview}
              onChange={() => handleToggleNotification("weeklyReview")}
              label="Weekly Review Reminder"
              description="Get reminded to complete your weekly review"
              disabled={updateSettings.isPending}
            />
            <ToggleSwitch
              checked={notifications.achievements}
              onChange={() => handleToggleNotification("achievements")}
              label="Achievement Notifications"
              description="Get notified when you earn badges or level up"
              disabled={updateSettings.isPending}
            />
          </div>
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Customize how Goalix looks"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-moon">Theme</p>
                <p className="text-xs text-moon-faint mt-0.5">
                  Yoru Zen is optimized for dark environments
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-night-soft border border-night-mist rounded-xl">
                <Moon className="w-4 h-4 text-lantern" />
                <span className="text-sm text-moon-soft">Dark</span>
              </div>
            </div>
            <p className="text-xs text-moon-faint">
              Light mode coming soon. The Yoru Zen design system is built for
              comfortable viewing in low-light conditions.
            </p>
          </div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection
          icon={Shield}
          title="Security"
          description="Account security settings"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-moon">Authentication</p>
                <p className="text-xs text-moon-faint mt-0.5">
                  You sign in with magic links sent to your email
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-zen-green-soft border border-zen-green/30 rounded-xl">
                <Check className="w-4 h-4 text-zen-green" />
                <span className="text-sm text-zen-green">Secure</span>
              </div>
            </div>
            <p className="text-xs text-moon-faint">
              Magic link authentication means no passwords to remember or
              compromise. Each link expires after 24 hours.
            </p>
            <div className="pt-4 border-t border-night-mist">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-moon">Sign Out</p>
                  <p className="text-xs text-moon-faint mt-0.5">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="border-night-mist bg-night-soft text-moon hover:bg-night-mist hover:border-moon-dim rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <div className="bg-night border border-zen-red/30 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zen-red/20 bg-zen-red-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zen-red/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-zen-red" />
              </div>
              <div>
                <h3 className="font-medium text-moon">Danger Zone</h3>
                <p className="text-sm text-moon-dim">
                  Irreversible actions for your account
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-moon">Delete Account</p>
                  <p className="text-xs text-moon-faint mt-0.5">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-zen-red/30 text-zen-red hover:bg-zen-red-soft hover:border-zen-red rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-zen-red-soft border border-zen-red/30 rounded-xl">
                  <p className="text-sm text-moon mb-2">
                    Are you sure you want to delete your account?
                  </p>
                  <p className="text-xs text-moon-dim">
                    This will permanently delete all your goals, tasks, progress,
                    and achievements. This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border-night-mist bg-night-soft text-moon hover:border-moon-dim rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    className="bg-zen-red text-white hover:bg-zen-red/90 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Yes, Delete My Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Sun,
  Globe,
} from "lucide-react";

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  timezone: "Australia/Melbourne",
  notifications: {
    dailyReminder: true,
    weeklyReview: true,
    achievements: true,
  },
};

const timezones = [
  { value: "Australia/Melbourne", label: "Melbourne (AEDT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
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
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-moon">{label}</p>
        {description && <p className="text-xs text-moon-faint mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${checked ? "bg-lantern" : "bg-night-mist"}
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
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
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
          className="w-full h-11 bg-night-soft border border-night-mist rounded-xl px-4 text-moon appearance-none cursor-pointer focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
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

export default function SettingsPage() {
  const [name, setName] = useState(mockUser.name);
  const [timezone, setTimezone] = useState(mockUser.timezone);
  const [notifications, setNotifications] = useState(mockUser.notifications);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDeleteAccount = () => {
    console.log("Delete account requested");
    // Will trigger account deletion flow
  };

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
              value={mockUser.email}
              type="email"
              disabled
            />
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-lantern text-void hover:bg-lantern/90 rounded-xl h-10"
            >
              {isSaving ? (
                "Saving..."
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save Changes"
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
              onChange={setTimezone}
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
            />
            <ToggleSwitch
              checked={notifications.weeklyReview}
              onChange={() => handleToggleNotification("weeklyReview")}
              label="Weekly Review Reminder"
              description="Get reminded to complete your weekly review"
            />
            <ToggleSwitch
              checked={notifications.achievements}
              onChange={() => handleToggleNotification("achievements")}
              label="Achievement Notifications"
              description="Get notified when you earn badges or level up"
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

"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserSettings, useUpdateUserSettings, useApiTokens, useCreateToken, useRevokeToken } from "@/hooks";
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
  Sun,
  Globe,
  LogOut,
  Loader2,
  Flower2,
  Repeat,
  Download,
  FileJson,
  FileSpreadsheet,
  Volume2,
  Target,
  Leaf,
  Key,
  Copy,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import { RecurringTasksCard } from "@/components/tasks";
import { useTheme } from "next-themes";
import { THEME_NAMES, THEME_DESCRIPTIONS } from "@/components/theme-provider";

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
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-night-mist">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-night-soft flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-lantern" />
          </div>
          <div>
            <h3 className="font-medium text-moon text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-moon-dim">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
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
    <div className="space-y-4 sm:space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-night border border-night-mist rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-night-mist">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-night-soft animate-pulse" />
              <div className="space-y-1.5 sm:space-y-2">
                <div className="h-4 w-20 sm:w-24 bg-night-soft rounded animate-pulse" />
                <div className="h-3 w-32 sm:w-40 bg-night-soft rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="space-y-3 sm:space-y-4">
              <div className="h-10 sm:h-11 bg-night-soft rounded-lg sm:rounded-xl animate-pulse" />
              <div className="h-10 sm:h-11 bg-night-soft rounded-lg sm:rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ThemeCard({
  themeKey,
  isSelected,
  onSelect,
}: {
  themeKey: "dark" | "light";
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isDark = themeKey === "dark";

  return (
    <button
      onClick={onSelect}
      className={`
        relative flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300
        ${isSelected
          ? "border-lantern shadow-lg shadow-lantern/20"
          : "border-night-mist hover:border-moon-dim"
        }
      `}
    >
      {/* Theme preview */}
      <div
        className={`
          w-full aspect-[4/3] rounded-md sm:rounded-lg overflow-hidden mb-2 sm:mb-3 relative
          ${isDark
            ? "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]"
            : "bg-[#FFFFFF]"
          }
        `}
      >
        {/* Mini sidebar preview */}
        <div
          className={`
            absolute left-0 top-0 bottom-0 w-1/4 border-r
            ${isDark
              ? "bg-[#0f172a] border-[#334155]"
              : "bg-[#FAFAFA] border-[#E5E5E5]"
            }
          `}
        >
          <div className={`w-3 h-3 m-2 rounded-full ${isDark ? "bg-amber-500/80" : "bg-[#5A6B5A]/80"}`} />
          <div className="space-y-1 px-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${isDark ? "bg-slate-600" : "bg-[#D4D4D4]"}`}
                style={{ width: `${60 + i * 10}%` }}
              />
            ))}
          </div>
        </div>

        {/* Mini content preview */}
        <div className="absolute left-1/4 right-0 top-0 bottom-0 p-2">
          <div className={`h-2 w-1/2 rounded-full mb-2 ${isDark ? "bg-slate-500" : "bg-[#111111]"}`} />
          <div className="grid grid-cols-2 gap-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`aspect-video rounded ${isDark ? "bg-slate-700/50" : "bg-[#FAFAFA]"} border ${isDark ? "border-slate-600" : "border-[#E5E5E5]"}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative accent */}
        {isDark ? (
          <Moon className="absolute bottom-2 right-2 w-4 h-4 text-amber-500/50" />
        ) : (
          <Leaf className="absolute bottom-2 right-2 w-4 h-4 text-[#5A6B5A]/50" />
        )}
      </div>

      {/* Theme info */}
      <div className="text-left">
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-lantern" />
          ) : (
            <Sun className="w-4 h-4 text-lantern" />
          )}
          <span className="font-medium text-moon">
            {THEME_NAMES[themeKey]}
          </span>
          {isSelected && (
            <span className="ml-auto">
              <Check className="w-4 h-4 text-lantern" />
            </span>
          )}
        </div>
        <p className="text-[0.625rem] sm:text-xs text-moon-faint mt-0.5 sm:mt-1 line-clamp-2">
          {THEME_DESCRIPTIONS[themeKey]}
        </p>
      </div>
    </button>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SettingsSection
        icon={Palette}
        title="Appearance"
        description="Customize how Goalzenix looks"
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="aspect-[4/3] rounded-lg sm:rounded-xl bg-night-soft animate-pulse" />
          <div className="aspect-[4/3] rounded-lg sm:rounded-xl bg-night-soft animate-pulse" />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      icon={Palette}
      title="Appearance"
      description="Customize how Goalzenix looks"
    >
      <div className="space-y-3 sm:space-y-4">
        <p className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
          Theme
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ThemeCard
            themeKey="dark"
            isSelected={theme === "dark"}
            onSelect={() => setTheme("dark")}
          />
          <ThemeCard
            themeKey="light"
            isSelected={theme === "light"}
            onSelect={() => setTheme("light")}
          />
        </div>
        <p className="text-xs text-moon-faint mt-2">
          Your theme preference is saved automatically and synced across devices.
        </p>
      </div>
    </SettingsSection>
  );
}

function APITokensSection() {
  const { data: tokens, isLoading } = useApiTokens();
  const createToken = useCreateToken();
  const revokeToken = useRevokeToken();

  const [newTokenName, setNewTokenName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast.error("Please enter a token name");
      return;
    }

    try {
      const result = await createToken.mutateAsync(newTokenName.trim());
      setNewlyCreatedToken(result.token);
      setNewTokenName("");
      setShowCreateForm(false);
      toast.success("API token created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create token");
    }
  };

  const handleRevokeToken = async (id: string) => {
    try {
      await revokeToken.mutateAsync(id);
      setTokenToRevoke(null);
      toast.success("API token revoked");
    } catch {
      toast.error("Failed to revoke token");
    }
  };

  const handleCopyToken = async () => {
    if (newlyCreatedToken) {
      await navigator.clipboard.writeText(newlyCreatedToken);
      toast.success("Token copied to clipboard");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return "Never used";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  return (
    <SettingsSection
      icon={Key}
      title="API Tokens"
      description="Connect Claude AI to your goals via MCP"
    >
      <div className="space-y-4">
        {/* Newly created token modal */}
        {newlyCreatedToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4">
            <div className="bg-night border border-night-mist rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-moon">Token Created</h3>
                <button
                  onClick={() => setNewlyCreatedToken(null)}
                  className="text-moon-faint hover:text-moon"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-zen-green-soft border border-zen-green/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-moon mb-2">
                  Copy your token now. <span className="text-zen-red font-medium">It won&apos;t be shown again.</span>
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs sm:text-sm bg-night-soft rounded-lg px-3 py-2 text-moon font-mono overflow-x-auto">
                    {newlyCreatedToken}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToken}
                    className="shrink-0 border-night-mist bg-night-soft text-moon hover:bg-night-mist rounded-lg"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-moon-dim">
                <p className="font-medium text-moon">How to use:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to claude.ai → Settings → Integrations</li>
                  <li>Add a Custom Connector</li>
                  <li>Enter <code className="bg-night-soft px-1 rounded">https://goalzenix-mcp.quantum-digital-plus.workers.dev</code></li>
                  <li>Paste your token as the API Key</li>
                </ol>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <Button
                  onClick={handleCopyToken}
                  className="bg-lantern text-void hover:bg-lantern/90 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Token
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNewlyCreatedToken(null)}
                  className="border-night-mist bg-night-soft text-moon hover:bg-night-mist rounded-xl"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Token list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-night-soft rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tokens && tokens.length > 0 ? (
          <div className="space-y-2">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-night-soft rounded-xl border border-night-mist"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-moon text-sm truncate">{token.name}</span>
                    {token.isActive ? (
                      <span className="text-[0.625rem] px-2 py-0.5 bg-zen-green-soft text-zen-green rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-[0.625rem] px-2 py-0.5 bg-night-mist text-moon-faint rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-moon-faint">
                    <code className="bg-night px-1.5 py-0.5 rounded text-moon-dim">
                      {token.tokenPrefix}...
                    </code>
                    <span>Last used: {formatRelativeTime(token.lastUsedAt)}</span>
                  </div>
                </div>
                {tokenToRevoke === token.id ? (
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTokenToRevoke(null)}
                      disabled={revokeToken.isPending}
                      className="border-night-mist bg-night text-moon hover:bg-night-mist rounded-lg text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRevokeToken(token.id)}
                      disabled={revokeToken.isPending}
                      className="bg-zen-red text-white hover:bg-zen-red/90 rounded-lg text-xs"
                    >
                      {revokeToken.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTokenToRevoke(token.id)}
                    className="shrink-0 ml-3 border-zen-red/30 text-zen-red hover:bg-zen-red-soft rounded-lg text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-moon-faint">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No API tokens yet</p>
            <p className="text-xs mt-1">Create a token to connect Claude AI</p>
          </div>
        )}

        {/* Create token form */}
        {showCreateForm ? (
          <div className="p-4 bg-night-soft rounded-xl border border-lantern/30 space-y-3">
            <label className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block">
              Token Name
            </label>
            <Input
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="e.g., Claude Desktop, claude.ai"
              className="h-10 bg-night border-night-mist text-moon placeholder:text-moon-faint rounded-xl focus:border-lantern focus:ring-lantern/20"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateToken();
                if (e.key === "Escape") {
                  setShowCreateForm(false);
                  setNewTokenName("");
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateToken}
                disabled={createToken.isPending || !newTokenName.trim()}
                className="bg-lantern text-void hover:bg-lantern/90 rounded-xl"
              >
                {createToken.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Token
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTokenName("");
                }}
                className="border-night-mist bg-night text-moon hover:bg-night-mist rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            className="w-full border-night-mist bg-night-soft text-moon hover:bg-night-mist hover:border-moon-dim rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Token
          </Button>
        )}

        {/* Info section */}
        <div className="pt-4 border-t border-night-mist space-y-2">
          <p className="text-xs text-moon-faint">
            API tokens allow Claude AI to manage your goals and tasks through the MCP protocol.
            Tokens are stored securely as SHA-256 hashes.
          </p>
          <a
            href="https://claude.ai/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-lantern hover:text-lantern/80"
          >
            <ExternalLink className="w-3 h-3" />
            Open claude.ai Settings
          </a>
        </div>
      </div>
    </SettingsSection>
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
  const [soundEffects, setSoundEffects] = useState(false);
  const [motivationalQuotes, setMotivationalQuotes] = useState(true);
  const [maxMitCount, setMaxMitCount] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      setSoundEffects(data.user.enableSoundEffects ?? false);
      setMotivationalQuotes(data.user.showMotivationalQuotes ?? true);
      setMaxMitCount(data.user.maxMitCount ?? 1);
    }
  }, [data]);

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
    } catch {
      // Revert on error
      setNotifications((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
      toast.error("Failed to update notification preference");
    }
  };

  const handleToggleSoundEffects = async () => {
    const newValue = !soundEffects;
    setSoundEffects(newValue);

    try {
      await updateSettings.mutateAsync({ enableSoundEffects: newValue });
      toast.success(newValue ? "Sound effects enabled" : "Sound effects disabled");
    } catch {
      // Revert on error
      setSoundEffects(!newValue);
      toast.error("Failed to update sound effects preference");
    }
  };

  const handleToggleMotivationalQuotes = async () => {
    const newValue = !motivationalQuotes;
    setMotivationalQuotes(newValue);

    try {
      await updateSettings.mutateAsync({ showMotivationalQuotes: newValue });
      toast.success(newValue ? "Motivational quotes enabled" : "Motivational quotes disabled");
    } catch {
      // Revert on error
      setMotivationalQuotes(!newValue);
      toast.error("Failed to update motivational quotes preference");
    }
  };

  const handleMitCountChange = async (newCount: number) => {
    const oldCount = maxMitCount;
    setMaxMitCount(newCount);

    try {
      await updateSettings.mutateAsync({ maxMitCount: newCount });
      toast.success(`MIT limit set to ${newCount}`);
    } catch {
      // Revert on error
      setMaxMitCount(oldCount);
      toast.error("Failed to update MIT limit");
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    setTimezone(newTimezone);
    try {
      await updateSettings.mutateAsync({ timezone: newTimezone });
      toast.success("Timezone updated successfully");
    } catch {
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

      <div className="space-y-4 sm:space-y-6">
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
          description="Control how Goalzenix contacts you"
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

        {/* Sound Effects Section */}
        <SettingsSection
          icon={Volume2}
          title="Sound Effects"
          description="Audio feedback for task completion"
        >
          <div className="divide-y divide-night-mist">
            <ToggleSwitch
              checked={soundEffects}
              onChange={handleToggleSoundEffects}
              label="Enable Sound Effects"
              description="Play sounds when completing tasks and earning achievements"
              disabled={updateSettings.isPending}
            />
          </div>
          <p className="text-xs text-moon-faint mt-4">
            Satisfying audio feedback for task completions, MIT achievements, badges, and level-ups.
          </p>
        </SettingsSection>

        {/* Motivational Quotes Section */}
        <SettingsSection
          icon={Flower2}
          title="Daily Inspiration"
          description="Motivational quotes on your dashboard"
        >
          <div className="divide-y divide-night-mist">
            <ToggleSwitch
              checked={motivationalQuotes}
              onChange={handleToggleMotivationalQuotes}
              label="Show Motivational Quotes"
              description="Display a daily inspirational quote on your dashboard"
              disabled={updateSettings.isPending}
            />
          </div>
          <p className="text-xs text-moon-faint mt-4">
            Get a fresh dose of motivation each day. Quotes change daily, or refresh for a new one anytime.
          </p>
        </SettingsSection>

        {/* MIT Limit Section */}
        <SettingsSection
          icon={Target}
          title="Daily MIT Limit"
          description="Most Important Tasks per day"
        >
          <div className="space-y-4">
            <p className="text-sm text-moon-soft">
              Choose how many MITs (Most Important Tasks) you can set each day. Most productivity experts recommend focusing on just one.
            </p>
            <div className="flex gap-3">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => handleMitCountChange(count)}
                  disabled={updateSettings.isPending}
                  className={`
                    flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200
                    flex flex-col items-center gap-1
                    ${maxMitCount === count
                      ? "border-lantern bg-lantern/10 text-lantern"
                      : "border-night-mist bg-night-soft text-moon-dim hover:border-moon-dim hover:text-moon"
                    }
                    ${updateSettings.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs">
                    {count === 1 ? "MIT" : "MITs"}
                  </span>
                  {count === 1 && (
                    <span className="text-[0.625rem] text-lantern/70 mt-1">Recommended</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-moon-faint">
              {maxMitCount === 1
                ? "Focus on your single highest-impact task each day."
                : maxMitCount === 2
                ? "Balanced approach for those with multiple priorities."
                : "Power user mode: tackle three critical items daily."
              }
            </p>
          </div>
        </SettingsSection>

        {/* Recurring Tasks Section */}
        <SettingsSection
          icon={Repeat}
          title="Recurring Tasks"
          description="Manage tasks that repeat automatically"
        >
          <RecurringTasksCard className="bg-transparent p-0" showAddButton />
        </SettingsSection>

        {/* Appearance Section */}
        <AppearanceSection />

        {/* Data Export Section */}
        <SettingsSection
          icon={Download}
          title="Data Export"
          description="Download your goals and tasks"
        >
          <div className="space-y-4">
            <p className="text-sm text-moon-soft">
              Export all your data including goals, tasks, Kaizen check-ins, and achievements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => window.open("/api/user/export?format=json", "_blank")}
                className="border-night-mist bg-night-soft text-moon hover:bg-night-mist hover:border-moon-dim rounded-xl flex-1"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/api/user/export?format=csv", "_blank")}
                className="border-night-mist bg-night-soft text-moon hover:bg-night-mist hover:border-moon-dim rounded-xl flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Tasks as CSV
              </Button>
            </div>
            <p className="text-xs text-moon-faint">
              JSON includes all data. CSV includes task history for spreadsheet analysis.
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

        {/* API Tokens Section */}
        <APITokensSection />

        {/* Danger Zone */}
        <div className="bg-night border border-zen-red/30 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zen-red/20 bg-zen-red-soft">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zen-red/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-zen-red" />
              </div>
              <div>
                <h3 className="font-medium text-moon text-sm sm:text-base">Danger Zone</h3>
                <p className="text-xs sm:text-sm text-moon-dim">
                  Irreversible actions for your account
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
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
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-zen-red-soft border border-zen-red/30 rounded-lg sm:rounded-xl">
                  <p className="text-sm text-moon mb-1.5 sm:mb-2">
                    Are you sure you want to delete your account?
                  </p>
                  <p className="text-[0.625rem] sm:text-xs text-moon-dim">
                    This will permanently delete all your goals, tasks, progress,
                    and achievements. This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
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

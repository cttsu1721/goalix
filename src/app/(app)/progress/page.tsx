"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserStats, useUserStreaks, useUserBadges } from "@/hooks/useGamification";
import { LEVELS, STREAK_TYPE_LABELS } from "@/types/gamification";
import {
  Trophy,
  Flame,
  Award,
  Star,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Zap,
  Lock,
  Loader2,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor = "text-lantern",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  iconColor?: string;
}) {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-night-soft flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-moon mb-1">{value}</p>
      <p className="text-sm text-moon-dim">{label}</p>
      {subtext && <p className="text-xs text-moon-faint mt-1">{subtext}</p>}
    </div>
  );
}

function LevelProgressCard({
  level,
  levelName,
  totalPoints,
  levelProgress,
  pointsToNextLevel,
}: {
  level: number;
  levelName: string;
  totalPoints: number;
  levelProgress: number;
  pointsToNextLevel: number;
}) {
  const nextLevel = LEVELS.find((l) => l.level === level + 1);
  const currentLevelPoints = LEVELS.find((l) => l.level === level)?.pointsRequired || 0;
  const nextLevelPoints = nextLevel?.pointsRequired || totalPoints;

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-lantern/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-lantern" />
        </div>
        <div>
          <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Current Level
          </h3>
          <p className="text-xl font-semibold text-moon">Level {level} — {levelName}</p>
        </div>
      </div>

      {/* Level Ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-night-mist"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#levelGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${levelProgress * 2.64} 264`}
            />
            <defs>
              <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e8a857" />
                <stop offset="100%" stopColor="#7dd3a8" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-moon">{level}</span>
            <span className="text-xs text-moon-faint">Level</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-moon-soft">
              {nextLevel ? `Progress to Level ${level + 1}` : "Max Level Reached!"}
            </span>
            <span className="text-sm font-medium text-moon">{levelProgress}%</span>
          </div>
          <div className="h-2 bg-night-mist rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-lantern to-zen-green rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="text-xs text-moon-faint">
            {totalPoints.toLocaleString()} / {nextLevelPoints.toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Total XP */}
      <div className="pt-4 border-t border-night-mist">
        <div className="flex items-center justify-between">
          <span className="text-sm text-moon-dim">Total XP Earned</span>
          <span className="text-lg font-semibold text-lantern">{totalPoints.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function StreaksCard({
  streaks,
}: {
  streaks: Array<{
    type: string;
    currentCount: number;
    longestCount: number;
    isActive: boolean;
  }>;
}) {
  const streakConfig = [
    { type: "DAILY_PLANNING", label: "Daily Planning", unit: "days", icon: Calendar },
    { type: "MIT_COMPLETION", label: "MIT Completion", unit: "days", icon: Target },
    { type: "WEEKLY_REVIEW", label: "Weekly Review", unit: "weeks", icon: TrendingUp },
    { type: "MONTHLY_REVIEW", label: "Monthly Review", unit: "months", icon: CheckCircle2 },
    { type: "KAIZEN_CHECKIN", label: "Kaizen Check-in", unit: "days", icon: Star },
  ];

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zen-red/10 flex items-center justify-center">
          <Flame className="w-6 h-6 text-zen-red" />
        </div>
        <div>
          <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Active Streaks
          </h3>
          <p className="text-xl font-semibold text-moon">Keep the fire burning</p>
        </div>
      </div>

      {/* Streak Grid */}
      <div className="grid grid-cols-2 gap-3">
        {streakConfig.map((config) => {
          const streak = streaks.find((s) => s.type === config.type);
          const count = streak?.currentCount || 0;
          const isActive = streak?.isActive || false;
          const Icon = config.icon;

          return (
            <div
              key={config.type}
              className={`
                p-4 rounded-xl border transition-colors
                ${isActive && count > 0 ? "bg-night-soft border-night-glow" : "bg-night border-night-mist opacity-60"}
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isActive && count > 0 ? "text-lantern" : "text-moon-faint"}`} />
                <span className="text-xs text-moon-faint">{config.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${isActive && count > 0 ? "text-moon" : "text-moon-dim"}`}>
                  {count}
                </span>
                <span className="text-xs text-moon-faint">{config.unit}</span>
              </div>
              {isActive && count >= 7 && (
                <div className="mt-2 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-zen-red" />
                  <span className="text-xs text-zen-red">On fire!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BadgesCard({
  badges,
  summary,
}: {
  badges: Array<{
    slug: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt: string | null;
  }>;
  summary: { earned: number; total: number };
}) {
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zen-purple/10 flex items-center justify-center">
            <Award className="w-6 h-6 text-zen-purple" />
          </div>
          <div>
            <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
              Badge Collection
            </h3>
            <p className="text-xl font-semibold text-moon">
              {summary.earned} / {summary.total} Earned
            </p>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-medium uppercase tracking-wider text-moon-faint mb-3">
            Earned
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.slug}
                className="group relative bg-night-soft border border-night-glow rounded-xl p-3 text-center hover:border-lantern/30 transition-colors"
              >
                <span className="text-2xl mb-1 block">{badge.icon}</span>
                <span className="text-xs text-moon-soft font-medium block truncate">
                  {badge.name}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-night-glow border border-night-mist rounded-lg text-xs text-moon opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-moon-faint mb-3">
            Locked
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {lockedBadges.map((badge) => (
              <div
                key={badge.slug}
                className="group relative bg-night border border-night-mist rounded-xl p-3 text-center opacity-50"
              >
                <div className="relative">
                  <span className="text-2xl mb-1 block grayscale">{badge.icon}</span>
                  <Lock className="absolute -top-1 -right-1 w-3 h-3 text-moon-faint" />
                </div>
                <span className="text-xs text-moon-faint font-medium block truncate">
                  {badge.name}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-night-glow border border-night-mist rounded-lg text-xs text-moon opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="text-center py-8">
          <Star className="w-12 h-12 mx-auto mb-4 text-moon-faint opacity-30" />
          <p className="text-moon-dim">Complete tasks and goals to earn badges!</p>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-lantern" />
    </div>
  );
}

export default function ProgressPage() {
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: streaksData, isLoading: streaksLoading } = useUserStreaks();
  const { data: badgesData, isLoading: badgesLoading } = useUserBadges();

  const isLoading = statsLoading || streaksLoading || badgesLoading;

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader
          title="Your Progress"
          subtitle="Track your achievements and gamification stats"
        />
        <LoadingState />
      </AppShell>
    );
  }

  // Default values if data not loaded
  const level = stats?.level || 1;
  const levelName = stats?.levelName || "Beginner";
  const totalPoints = stats?.totalPoints || 0;
  const levelProgress = stats?.levelProgress || 0;
  const pointsToNextLevel = stats?.pointsToNextLevel || 500;
  const todayStats = stats?.todayStats || { total: 0, completed: 0, pointsEarned: 0 };
  const weeklyStats = stats?.weeklyStats || { tasksCompleted: 0, pointsEarned: 0 };

  const streaks = streaksData?.streaks || [];
  const badges = badgesData?.badges || [];
  const badgeSummary = badgesData?.summary || { earned: 0, total: 0 };

  // Calculate all-time stats
  const allTimeTasksCompleted = weeklyStats.tasksCompleted; // This would ideally come from API

  return (
    <AppShell>
      <PageHeader
        title="Your Progress"
        subtitle="Track your achievements and gamification stats"
      />

      {/* All-Time Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={CheckCircle2}
          label="Tasks Today"
          value={`${todayStats.completed}/${todayStats.total}`}
          iconColor="text-zen-green"
        />
        <StatCard
          icon={Target}
          label="Weekly Tasks"
          value={weeklyStats.tasksCompleted}
          iconColor="text-zen-blue"
        />
        <StatCard
          icon={Zap}
          label="Total Points"
          value={totalPoints.toLocaleString()}
          iconColor="text-lantern"
        />
        <StatCard
          icon={Calendar}
          label="Level"
          value={level}
          subtext={levelName}
          iconColor="text-zen-purple"
        />
      </div>

      {/* Level and Streaks */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <LevelProgressCard
          level={level}
          levelName={levelName}
          totalPoints={totalPoints}
          levelProgress={levelProgress}
          pointsToNextLevel={pointsToNextLevel}
        />
        <StreaksCard streaks={streaks} />
      </div>

      {/* Badges */}
      <BadgesCard badges={badges} summary={badgeSummary} />
    </AppShell>
  );
}

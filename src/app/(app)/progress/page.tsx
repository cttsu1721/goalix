"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LifestyleInsight, KaizenHeatmap, PointsExplainer, MonthSoFarCard, AlignmentTrendCard } from "@/components/gamification";
import { useUserStats, useUserStreaks, useUserBadges } from "@/hooks/useGamification";
import { LEVELS } from "@/types/gamification";
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
  action,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  iconColor?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-4 sm:p-5 relative">
      {action && (
        <div className="absolute top-3 right-3">
          {action}
        </div>
      )}
      <div className="flex items-center gap-3 sm:block">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-night-soft flex items-center justify-center ${iconColor} sm:mb-3`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 sm:flex-none">
          <p className="text-xl sm:text-2xl font-semibold text-moon">{value}</p>
          <p className="text-xs sm:text-sm text-moon-dim">{label}</p>
          {subtext && <p className="text-xs text-moon-faint mt-0.5 sm:mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

function LevelProgressCard({
  level,
  levelName,
  totalPoints,
  levelProgress,
}: {
  level: number;
  levelName: string;
  totalPoints: number;
  levelProgress: number;
  pointsToNextLevel: number;
}) {
  const nextLevel = LEVELS.find((l) => l.level === level + 1);
  const nextLevelPoints = nextLevel?.pointsRequired || totalPoints;

  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6">
      {/* Header - stacked on mobile */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-lantern/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-lantern" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Current Level
          </h3>
          <p className="text-lg sm:text-xl font-semibold text-moon truncate">
            Level {level} — {levelName}
          </p>
        </div>
      </div>

      {/* Level Ring - centered on mobile */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-5 sm:mb-6">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-night-mist"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#levelGradient)"
              strokeWidth="10"
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
            <span className="text-xl sm:text-2xl font-bold text-moon">{level}</span>
            <span className="text-[0.625rem] sm:text-xs text-moon-faint">Level</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-moon-soft">
              {nextLevel ? `To Level ${level + 1}` : "Max Level!"}
            </span>
            <span className="text-xs sm:text-sm font-medium text-moon">{levelProgress}%</span>
          </div>
          <div className="h-2 bg-night-mist rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-lantern to-zen-green rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="text-xs text-moon-faint text-center sm:text-left">
            {totalPoints.toLocaleString()} / {nextLevelPoints.toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Total XP */}
      <div className="pt-4 border-t border-night-mist">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-moon-dim">Total XP</span>
          <span className="text-base sm:text-lg font-semibold text-lantern">{totalPoints.toLocaleString()}</span>
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
    { type: "DAILY_PLANNING", label: "Planning", unit: "d", icon: Calendar },
    { type: "MIT_COMPLETION", label: "MIT", unit: "d", icon: Target },
    { type: "WEEKLY_REVIEW", label: "Weekly", unit: "w", icon: TrendingUp },
    { type: "MONTHLY_REVIEW", label: "Monthly", unit: "m", icon: CheckCircle2 },
    { type: "KAIZEN_CHECKIN", label: "Kaizen", unit: "d", icon: Star },
  ];

  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zen-red/10 flex items-center justify-center">
          <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-zen-red" />
        </div>
        <div>
          <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Active Streaks
          </h3>
          <p className="text-lg sm:text-xl font-semibold text-moon">Keep the fire burning</p>
        </div>
      </div>

      {/* Streak Grid - 3 cols on mobile for compactness */}
      <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {streakConfig.map((config) => {
          const streak = streaks.find((s) => s.type === config.type);
          const count = streak?.currentCount || 0;
          const isActive = streak?.isActive || false;
          const Icon = config.icon;

          return (
            <div
              key={config.type}
              className={`
                p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-colors
                ${isActive && count > 0 ? "bg-night-soft border-night-glow" : "bg-night border-night-mist opacity-60"}
              `}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive && count > 0 ? "text-lantern" : "text-moon-faint"}`} />
                <span className="text-[0.625rem] sm:text-xs text-moon-faint truncate">{config.label}</span>
              </div>
              <div className="flex items-baseline gap-0.5 sm:gap-1">
                <span className={`text-xl sm:text-2xl font-bold ${isActive && count > 0 ? "text-moon" : "text-moon-dim"}`}>
                  {count}
                </span>
                <span className="text-[0.625rem] sm:text-xs text-moon-faint">{config.unit}</span>
              </div>
              {isActive && count >= 7 && (
                <div className="mt-1.5 sm:mt-2 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-zen-red" />
                  <span className="text-[0.625rem] sm:text-xs text-zen-red">On fire!</span>
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
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zen-purple/10 flex items-center justify-center">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-zen-purple" />
          </div>
          <div>
            <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
              Badge Collection
            </h3>
            <p className="text-lg sm:text-xl font-semibold text-moon">
              {summary.earned} / {summary.total} Earned
            </p>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-5 sm:mb-6">
          <h4 className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint mb-3">
            Earned
          </h4>
          {/* 3 cols on mobile, 4 on tablet+ */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.slug}
                className="group relative bg-night-soft border border-night-glow rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center active:scale-95 transition-transform"
              >
                <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1 block">{badge.icon}</span>
                <span className="text-[0.625rem] sm:text-xs text-moon-soft font-medium block truncate">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges - show fewer on mobile */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint mb-3">
            Locked ({lockedBadges.length})
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {lockedBadges.slice(0, 12).map((badge) => (
              <div
                key={badge.slug}
                className="relative bg-night border border-night-mist rounded-lg p-2 sm:p-2.5 text-center opacity-40"
              >
                <span className="text-lg sm:text-xl block grayscale">{badge.icon}</span>
                <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-moon-faint" />
              </div>
            ))}
          </div>
          {lockedBadges.length > 12 && (
            <p className="text-xs text-moon-faint text-center mt-3">
              +{lockedBadges.length - 12} more to unlock
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-moon-faint opacity-30" />
          <p className="text-sm sm:text-base text-moon-dim">Complete tasks to earn badges!</p>
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
          title="Stats & Achievements"
          subtitle="Your points, streaks, badges, and level — earned through daily action"
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

  // All-time stats would ideally come from API
  // const allTimeTasksCompleted = weeklyStats.tasksCompleted;

  return (
    <AppShell>
      <PageHeader
        title="Stats & Achievements"
        subtitle="Your points, streaks, badges, and level — earned through daily action"
      />

      {/* All-Time Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
          action={<PointsExplainer currentLevel={level} currentPoints={totalPoints} />}
        />
        <StatCard
          icon={Calendar}
          label="Level"
          value={level}
          subtext={levelName}
          iconColor="text-zen-purple"
        />
      </div>

      {/* Month So Far Card */}
      <div className="mb-4 sm:mb-6">
        <MonthSoFarCard />
      </div>

      {/* Weekly Alignment Trend Sparkline */}
      <div className="mb-4 sm:mb-6">
        <AlignmentTrendCard weeks={12} />
      </div>

      {/* Lifestyle Insight (only shows if user has milestone-worthy streaks) */}
      <div className="mb-4 sm:mb-6">
        <LifestyleInsight streaks={streaks} />
      </div>

      {/* Level and Streaks */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <LevelProgressCard
          level={level}
          levelName={levelName}
          totalPoints={totalPoints}
          levelProgress={levelProgress}
          pointsToNextLevel={pointsToNextLevel}
        />
        <StreaksCard streaks={streaks} />
      </div>

      {/* Kaizen Heatmap */}
      <div className="mb-4 sm:mb-6">
        <KaizenHeatmap days={91} />
      </div>

      {/* Badges */}
      <BadgesCard badges={badges} summary={badgeSummary} />
    </AppShell>
  );
}

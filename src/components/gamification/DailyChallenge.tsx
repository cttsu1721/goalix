"use client";

import { useState, useEffect } from "react";
import { Zap, Clock, Check, Trophy, Flame, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Challenge {
  id: string;
  type: "daily" | "weekly";
  title: string;
  description: string;
  icon: React.ReactNode;
  target: number;
  current: number;
  pointsReward: number;
  expiresAt: Date;
}

interface DailyChallengeProps {
  challenge: Challenge;
  className?: string;
  onClaim?: () => void;
}

function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function DailyChallenge({
  challenge,
  className,
  onClaim,
}: DailyChallengeProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeRemaining(challenge.expiresAt)
  );
  const progress = Math.min((challenge.current / challenge.target) * 100, 100);
  const isComplete = challenge.current >= challenge.target;

  // Update timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(challenge.expiresAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [challenge.expiresAt]);

  return (
    <div
      className={cn(
        "rounded-xl p-4",
        isComplete
          ? "bg-gradient-to-br from-zen-green/10 to-zen-green/5 border border-zen-green/20"
          : "bg-night-soft border border-night-mist",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isComplete ? "bg-zen-green/20" : "bg-lantern/10"
            )}
          >
            {isComplete ? (
              <Trophy className="w-4 h-4 text-zen-green" />
            ) : (
              <Zap className="w-4 h-4 text-lantern" />
            )}
          </div>
          <div>
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wider",
                challenge.type === "daily"
                  ? "text-lantern"
                  : "text-zen-purple"
              )}
            >
              {challenge.type} Challenge
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-moon-faint">
          <Clock className="w-3 h-3" />
          {timeRemaining}
        </div>
      </div>

      {/* Challenge info */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-moon mb-1">
            {challenge.title}
          </h4>
          <p className="text-xs text-moon-dim">{challenge.description}</p>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-moon-faint">Progress</span>
            <span className="text-moon">
              {challenge.current}/{challenge.target}
            </span>
          </div>
          <Progress
            value={progress}
            className={cn(
              "h-2",
              isComplete && "[&>div]:bg-zen-green"
            )}
          />
        </div>

        {/* Reward / Claim */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-lantern" />
            <span className="text-sm font-medium text-moon">
              +{challenge.pointsReward} pts
            </span>
          </div>
          {isComplete ? (
            <Button
              size="sm"
              onClick={onClaim}
              className="bg-zen-green text-void hover:bg-zen-green/90"
            >
              <Check className="w-3 h-3 mr-1" />
              Claim
            </Button>
          ) : (
            <span className="text-xs text-moon-faint">
              {challenge.target - challenge.current} more to go
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple challenges card
 */
interface ChallengesCardProps {
  challenges: Challenge[];
  className?: string;
  onClaimChallenge?: (challengeId: string) => void;
}

export function ChallengesCard({
  challenges,
  className,
  onClaimChallenge,
}: ChallengesCardProps) {
  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");
  const completedCount = challenges.filter(
    (c) => c.current >= c.target
  ).length;

  return (
    <div className={cn("bg-night-soft rounded-xl p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-lantern" />
          <h3 className="text-sm font-medium text-moon">Challenges</h3>
        </div>
        {completedCount > 0 && (
          <span className="text-xs text-zen-green flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {completedCount} ready to claim
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Daily challenges */}
        {dailyChallenges.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-moon-faint uppercase tracking-wider">
              Daily
            </p>
            {dailyChallenges.map((challenge) => (
              <ChallengeRow
                key={challenge.id}
                challenge={challenge}
                onClaim={() => onClaimChallenge?.(challenge.id)}
              />
            ))}
          </div>
        )}

        {/* Weekly challenges */}
        {weeklyChallenges.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-moon-faint uppercase tracking-wider">
              Weekly
            </p>
            {weeklyChallenges.map((challenge) => (
              <ChallengeRow
                key={challenge.id}
                challenge={challenge}
                onClaim={() => onClaimChallenge?.(challenge.id)}
              />
            ))}
          </div>
        )}

        {challenges.length === 0 && (
          <p className="text-xs text-moon-faint text-center py-4">
            No active challenges. Check back tomorrow!
          </p>
        )}
      </div>
    </div>
  );
}

function ChallengeRow({
  challenge,
  onClaim,
}: {
  challenge: Challenge;
  onClaim: () => void;
}) {
  const progress = Math.min((challenge.current / challenge.target) * 100, 100);
  const isComplete = challenge.current >= challenge.target;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        isComplete
          ? "bg-zen-green/10 border border-zen-green/20"
          : "bg-night border border-night-mist"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-moon truncate">{challenge.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progress} className="h-1 flex-1 max-w-[100px]" />
          <span className="text-xs text-moon-faint">
            {challenge.current}/{challenge.target}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-lantern font-medium">
          +{challenge.pointsReward}
        </span>
        {isComplete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClaim}
            className="h-7 px-2 text-zen-green hover:text-zen-green/80"
          >
            <Check className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Sample challenges generator (for demo purposes)
 */
export function generateSampleChallenges(): Challenge[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: "mit-3",
      type: "daily",
      title: "MIT Master",
      description: "Complete your Most Important Task",
      icon: <Target className="w-4 h-4" />,
      target: 1,
      current: 0,
      pointsReward: 50,
      expiresAt: tomorrow,
    },
    {
      id: "task-5",
      type: "daily",
      title: "Productive Day",
      description: "Complete 5 tasks today",
      icon: <CheckCircle2 className="w-4 h-4" />,
      target: 5,
      current: 3,
      pointsReward: 25,
      expiresAt: tomorrow,
    },
    {
      id: "streak-7",
      type: "weekly",
      title: "Week Warrior",
      description: "Complete your MIT 7 days in a row",
      icon: <Flame className="w-4 h-4" />,
      target: 7,
      current: 4,
      pointsReward: 200,
      expiresAt: nextWeek,
    },
  ];
}

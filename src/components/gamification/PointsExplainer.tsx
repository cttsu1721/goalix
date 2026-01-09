"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LEVELS } from "@/types/gamification";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  Zap,
  Target,
  CheckCircle2,
  Flame,
  Trophy,
  Star,
  ChevronRight,
} from "lucide-react";

interface PointsExplainerProps {
  currentLevel: number;
  currentPoints: number;
}

export function PointsExplainer({ currentLevel, currentPoints }: PointsExplainerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"earn" | "levels">("earn");

  const nextLevel = LEVELS.find((l) => l.level === currentLevel + 1);
  const pointsToNext = nextLevel ? nextLevel.pointsRequired - currentPoints : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-moon-faint hover:text-moon hover:bg-night-soft transition-colors"
        aria-label="What can I do with points?"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-night border-night-mist sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-moon text-xl flex items-center gap-2">
              <Zap className="w-5 h-5 text-lantern" />
              Understanding Points
            </DialogTitle>
            <DialogDescription className="text-moon-dim">
              Points measure your progress and unlock achievements
            </DialogDescription>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("earn")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                activeTab === "earn"
                  ? "bg-lantern/10 text-lantern"
                  : "text-moon-dim hover:text-moon hover:bg-night-soft"
              )}
            >
              How to Earn
            </button>
            <button
              onClick={() => setActiveTab("levels")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                activeTab === "levels"
                  ? "bg-lantern/10 text-lantern"
                  : "text-moon-dim hover:text-moon hover:bg-night-soft"
              )}
            >
              Levels & Rewards
            </button>
          </div>

          {/* Content */}
          <div className="mt-4">
            {activeTab === "earn" && (
              <div className="space-y-3">
                <PointsRow
                  icon={<Target className="w-5 h-5 text-lantern" />}
                  label="Complete your MIT"
                  points={100}
                  description="Your Most Important Task of the day"
                />
                <PointsRow
                  icon={<CheckCircle2 className="w-5 h-5 text-zen-green" />}
                  label="Complete Primary tasks"
                  points={50}
                  description="Up to 3 core tasks per day"
                />
                <PointsRow
                  icon={<CheckCircle2 className="w-5 h-5 text-moon-dim" />}
                  label="Complete Secondary tasks"
                  points={25}
                  description="Bonus supporting tasks"
                />
                <PointsRow
                  icon={<Flame className="w-5 h-5 text-lantern" />}
                  label="Streak bonus"
                  points="+10%"
                  description="Per day, up to +100% max"
                />
                <PointsRow
                  icon={<Star className="w-5 h-5 text-zen-purple" />}
                  label="Kaizen check-in"
                  points={10}
                  description="Daily reflection (+25 for all 6 areas)"
                />

                <div className="pt-4 border-t border-night-mist">
                  <p className="text-xs text-moon-faint">
                    <strong className="text-moon">Pro tip:</strong> Completing your MIT every day builds
                    a streak that multiplies your points!
                  </p>
                </div>
              </div>
            )}

            {activeTab === "levels" && (
              <div className="space-y-4">
                {/* Current Progress */}
                <div className="p-4 bg-night-soft rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-moon-dim">Your Level</span>
                    <span className="text-lg font-semibold text-lantern">
                      {LEVELS[currentLevel - 1]?.name || `Level ${currentLevel}`}
                    </span>
                  </div>
                  {nextLevel && (
                    <div className="text-xs text-moon-faint">
                      {pointsToNext.toLocaleString()} points to {nextLevel.name}
                    </div>
                  )}
                </div>

                {/* All Levels */}
                <div className="space-y-2">
                  {LEVELS.map((level, index) => {
                    const isCurrentLevel = level.level === currentLevel;
                    const isUnlocked = level.level <= currentLevel;
                    return (
                      <div
                        key={level.level}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg",
                          isCurrentLevel
                            ? "bg-lantern/10 border border-lantern/20"
                            : isUnlocked
                            ? "bg-night-soft"
                            : "opacity-50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                            isCurrentLevel
                              ? "bg-lantern text-void"
                              : isUnlocked
                              ? "bg-zen-green/20 text-zen-green"
                              : "bg-night-mist text-moon-faint"
                          )}
                        >
                          {level.level}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isCurrentLevel ? "text-lantern" : "text-moon"
                              )}
                            >
                              {level.name}
                            </span>
                            {isCurrentLevel && (
                              <span className="text-xs bg-lantern/20 text-lantern px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-moon-faint">
                            {level.pointsRequired === 0
                              ? "Starting level"
                              : `${level.pointsRequired.toLocaleString()} points`}
                          </div>
                        </div>
                        {isUnlocked && (
                          <Trophy
                            className={cn(
                              "w-4 h-4",
                              isCurrentLevel ? "text-lantern" : "text-zen-green/50"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => setOpen(false)}
            className="mt-4 w-full bg-night-soft hover:bg-night-mist text-moon"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PointsRow({
  icon,
  label,
  points,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  points: number | string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-night-soft rounded-lg">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-moon">{label}</span>
          <span className="text-sm font-semibold text-lantern">
            {typeof points === "number" ? `+${points}` : points}
          </span>
        </div>
        <p className="text-xs text-moon-faint mt-0.5">{description}</p>
      </div>
    </div>
  );
}

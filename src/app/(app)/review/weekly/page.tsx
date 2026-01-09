"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useWeeklyReview, useSubmitWeeklyReview, formatAreaName, useUserStreaks } from "@/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  Target,
  TrendingUp,
  Flame,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileText,
  Award,
  Star,
  Link2,
  Link2Off,
  Loader2,
  Heart,
  Users,
  Wallet,
  Briefcase,
  Brain,
  Palmtree,
} from "lucide-react";
import { GoalReviewSection } from "@/components/review/GoalReviewSection";

const AREA_ICONS: Record<string, React.ElementType> = {
  health: Heart,
  relationships: Users,
  wealth: Wallet,
  career: Briefcase,
  personalGrowth: Brain,
  lifestyle: Palmtree,
};

const AREA_COLORS: Record<string, string> = {
  health: "text-zen-red",
  relationships: "text-pink-400",
  wealth: "text-zen-green",
  career: "text-zen-blue",
  personalGrowth: "text-zen-purple",
  lifestyle: "text-lantern",
};

// Review steps (past-focused)
const reviewSteps = [
  { id: 1, title: "Week Stats", description: "Review your performance" },
  { id: 2, title: "Wins", description: "Celebrate achievements" },
  { id: 3, title: "Challenges", description: "Identify obstacles" },
];

// Planning steps (future-focused)
const planSteps = [
  { id: 1, title: "Focus", description: "Set your priorities" },
  { id: 2, title: "Actions", description: "Plan key tasks" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
  iconColor = "text-lantern",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subvalue?: string;
  iconColor?: string;
}) {
  return (
    <div className="bg-night border border-night-mist rounded-lg sm:rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-night-soft flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <p className="text-lg sm:text-xl font-semibold text-moon">{value}</p>
          <p className="text-[0.625rem] sm:text-xs text-moon-dim">{label}</p>
          {subvalue && <p className="text-[0.625rem] sm:text-xs text-moon-faint">{subvalue}</p>}
        </div>
      </div>
    </div>
  );
}

function WeeklyCalendar({ dailyBreakdown }: { dailyBreakdown: Array<{ dayOfWeek: string; completed: number; total: number; mitCompleted: boolean }> }) {
  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint mb-3 sm:mb-4">
        Daily Breakdown
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {dailyBreakdown.map((day) => {
          const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;

          return (
            <div key={day.dayOfWeek} className="text-center">
              <span className="text-xs text-moon-faint block mb-2">{day.dayOfWeek}</span>
              <div
                className={`
                  w-full aspect-square rounded-lg flex flex-col items-center justify-center
                  ${completionRate === 100 && day.total > 0 ? "bg-zen-green-soft border border-zen-green/30" : "bg-night-soft border border-night-mist"}
                `}
              >
                <span className={`text-lg font-semibold ${completionRate === 100 && day.total > 0 ? "text-zen-green" : "text-moon"}`}>
                  {day.completed}
                </span>
                <span className="text-[0.625rem] text-moon-faint">/{day.total}</span>
              </div>
              {day.mitCompleted && (
                <div className="mt-1 flex justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-lantern" title="MIT completed" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-moon-faint">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zen-green-soft border border-zen-green/30" />
          <span>All tasks done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-lantern" />
          <span>MIT completed</span>
        </div>
      </div>
    </div>
  );
}

function GoalAlignmentCard({ goalAlignment }: {
  goalAlignment: {
    linkedCompleted: number;
    unlinkedCompleted: number;
    alignmentRate: number;
    totalLinked: number;
    totalUnlinked: number;
  }
}) {
  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zen-blue/10 flex items-center justify-center">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-zen-blue" />
        </div>
        <div>
          <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Goal Alignment
          </h3>
          <p className="text-base sm:text-lg font-semibold text-moon">{goalAlignment.alignmentRate}% Aligned</p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-night-soft rounded-lg">
          <div className="flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-green" />
            <span className="text-xs sm:text-sm text-moon-soft">Goal-linked tasks</span>
          </div>
          <span className="text-xs sm:text-sm font-medium text-moon">
            {goalAlignment.linkedCompleted} / {goalAlignment.totalLinked}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-night-soft rounded-lg">
          <div className="flex items-center gap-2">
            <Link2Off className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-moon-faint" />
            <span className="text-xs sm:text-sm text-moon-soft">Unlinked tasks</span>
          </div>
          <span className="text-xs sm:text-sm font-medium text-moon">
            {goalAlignment.unlinkedCompleted} / {goalAlignment.totalUnlinked}
          </span>
        </div>
      </div>

      {goalAlignment.alignmentRate < 70 && (
        <p className="mt-3 sm:mt-4 text-[0.625rem] sm:text-xs text-moon-faint">
          Tip: Link more tasks to your weekly goals to stay focused on what matters.
        </p>
      )}
    </div>
  );
}

function KaizenWeeklyCard({ kaizen }: {
  kaizen: {
    checkinsCompleted: number;
    checkinsTotal: number;
    balancedDays: number;
    areaBreakdown: Record<string, number>;
    dailyCheckins: Array<{ day: string; areasChecked: number; areas: string[] }>;
    strongestArea: { area: string; count: number } | null;
    weakestArea: { area: string; count: number } | null;
  }
}) {
  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zen-green/10 flex items-center justify-center">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-zen-green" />
        </div>
        <div>
          <h3 className="text-[0.625rem] sm:text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Kaizen Reflections
          </h3>
          <p className="text-base sm:text-lg font-semibold text-moon">
            {kaizen.checkinsCompleted} / {kaizen.checkinsTotal} Days
          </p>
        </div>
      </div>

      {/* Daily visual */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {kaizen.dailyCheckins.map((day) => (
          <div key={day.day} className="text-center">
            <span className="text-xs text-moon-faint block mb-1">{day.day}</span>
            <div
              className={`
                w-full aspect-square rounded-lg flex items-center justify-center
                ${day.areasChecked === 6 ? "bg-zen-green/20 border border-zen-green/30" :
                  day.areasChecked > 0 ? "bg-lantern/20 border border-lantern/30" :
                  "bg-night-soft border border-night-mist"}
              `}
            >
              <span className={`text-sm font-medium ${
                day.areasChecked === 6 ? "text-zen-green" :
                day.areasChecked > 0 ? "text-lantern" : "text-moon-faint"
              }`}>
                {day.areasChecked}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Area breakdown */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        {Object.entries(kaizen.areaBreakdown).map(([area, count]) => {
          const Icon = AREA_ICONS[area] || Star;
          const color = AREA_COLORS[area] || "text-moon-soft";
          const percentage = Math.round((count / 7) * 100);

          return (
            <div key={area} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-moon-soft flex-1">{formatAreaName(area)}</span>
              <div className="w-20 h-1.5 bg-night-mist rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${count === 7 ? "bg-zen-green" : "bg-lantern"}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-moon-faint w-8 text-right">{count}/7</span>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-night-mist">
        {kaizen.strongestArea && (
          <p className="text-[0.625rem] sm:text-xs text-moon-soft">
            <span className="text-zen-green">Strongest:</span>{" "}
            {formatAreaName(kaizen.strongestArea.area)} ({kaizen.strongestArea.count} days)
          </p>
        )}
        {kaizen.weakestArea && kaizen.weakestArea.count < kaizen.checkinsCompleted && (
          <p className="text-[0.625rem] sm:text-xs text-moon-soft">
            <span className="text-amber-400">Needs attention:</span>{" "}
            {formatAreaName(kaizen.weakestArea.area)} ({kaizen.weakestArea.count} days)
          </p>
        )}
        {kaizen.balancedDays > 0 && (
          <p className="text-[0.625rem] sm:text-xs text-moon-soft">
            <span className="text-zen-purple">Balanced days:</span> {kaizen.balancedDays} (all 6 areas)
          </p>
        )}
      </div>
    </div>
  );
}

type ReviewMode = "review" | "plan";

function ReviewWizard({ weekData, streaks, onComplete, initialMode = "review" }: {
  weekData: ReturnType<typeof useWeeklyReview>["data"];
  streaks: Array<{ type: string; currentCount: number }>;
  onComplete: () => void;
  initialMode?: ReviewMode;
}) {
  const [mode, setMode] = useState<ReviewMode>(initialMode);
  const [reviewStep, setReviewStep] = useState(1);
  const [planStep, setPlanStep] = useState(1);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [nextWeekFocus, setNextWeekFocus] = useState("");
  const [keyActions, setKeyActions] = useState("");
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [planCompleted, setPlanCompleted] = useState(false);

  const submitReview = useSubmitWeeklyReview();

  const handleReviewNext = () => {
    if (reviewStep < 3) setReviewStep(reviewStep + 1);
    else setReviewCompleted(true);
  };

  const handleReviewPrev = () => {
    if (reviewStep > 1) setReviewStep(reviewStep - 1);
  };

  const handlePlanNext = () => {
    if (planStep < 2) setPlanStep(planStep + 1);
    else setPlanCompleted(true);
  };

  const handlePlanPrev = () => {
    if (planStep > 1) setPlanStep(planStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const result = await submitReview.mutateAsync({
        wins,
        challenges,
        nextWeekFocus: `${nextWeekFocus}${keyActions ? `\n\nKey Actions:\n${keyActions}` : ""}`,
        weekOffset: 0,
      });

      if (result.isNewReview) {
        toast.success(`Weekly review completed! +${result.pointsAwarded} points`);
      } else {
        toast.success("Weekly review updated!");
      }

      onComplete();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  const canSubmit = reviewCompleted || planCompleted;
  const currentStreak = streaks.find((s) => s.type === "WEEKLY_REVIEW")?.currentCount || 0;

  const currentSteps = mode === "review" ? reviewSteps : planSteps;
  const currentStep = mode === "review" ? reviewStep : planStep;
  const isCurrentModeCompleted = mode === "review" ? reviewCompleted : planCompleted;

  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl overflow-hidden">
      {/* Mode Tabs */}
      <div className="border-b border-night-mist bg-night-soft">
        <div className="flex">
          <button
            onClick={() => setMode("review")}
            className={`
              flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-colors
              ${mode === "review"
                ? "text-lantern border-b-2 border-lantern bg-night"
                : "text-moon-dim hover:text-moon border-b-2 border-transparent"
              }
            `}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Review Past
            {reviewCompleted && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zen-green" />}
          </button>
          <button
            onClick={() => setMode("plan")}
            className={`
              flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-colors
              ${mode === "plan"
                ? "text-zen-green border-b-2 border-zen-green bg-night"
                : "text-moon-dim hover:text-moon border-b-2 border-transparent"
              }
            `}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Plan Ahead
            {planCompleted && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zen-green" />}
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="p-3 sm:p-4 border-b border-night-mist">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {currentSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                    ${
                      isCurrentModeCompleted
                        ? "bg-zen-green text-void"
                        : currentStep === step.id
                        ? mode === "review" ? "bg-lantern text-void" : "bg-zen-green text-void"
                        : currentStep > step.id
                        ? "bg-zen-green text-void"
                        : "bg-night-mist text-moon-faint"
                    }
                  `}
                >
                  {isCurrentModeCompleted || currentStep > step.id
                    ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    : step.id}
                </div>
                <span className="text-[0.5rem] sm:text-[0.625rem] text-moon-faint mt-1">
                  {step.title}
                </span>
              </div>
              {index < currentSteps.length - 1 && (
                <div
                  className={`
                    w-8 sm:w-16 h-0.5 mx-2 sm:mx-3
                    ${isCurrentModeCompleted || currentStep > step.id ? "bg-zen-green" : "bg-night-mist"}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4 sm:p-6">
        {/* REVIEW MODE - Step 1: Week Stats */}
        {mode === "review" && reviewStep === 1 && weekData && !reviewCompleted && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-moon mb-1.5 sm:mb-2">Week in Review</h3>
              <p className="text-xs sm:text-sm text-moon-dim">
                Here&apos;s how you performed this week
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <StatCard
                icon={CheckCircle2}
                label="Tasks Completed"
                value={`${weekData.stats.tasksCompleted}/${weekData.stats.totalTasks}`}
                subvalue={`${weekData.stats.completionRate}%`}
                iconColor="text-zen-green"
              />
              <StatCard
                icon={Target}
                label="Goals Progressed"
                value={weekData.stats.goalsProgressed}
                iconColor="text-zen-blue"
              />
              <StatCard
                icon={TrendingUp}
                label="Points Earned"
                value={weekData.stats.pointsEarned}
                iconColor="text-lantern"
              />
              <StatCard
                icon={Flame}
                label="MIT Rate"
                value={`${weekData.stats.mitCompletionRate}%`}
                iconColor="text-zen-red"
              />
            </div>

            {/* Goal Alignment Summary */}
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-night-soft rounded-lg sm:rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-blue" />
                <span className="text-xs sm:text-sm font-medium text-moon">Goal Alignment</span>
              </div>
              <p className="text-xs sm:text-sm text-moon-soft">
                {weekData.goalAlignment.alignmentRate}% of your completed tasks were linked to goals.
                {weekData.goalAlignment.unlinkedCompleted > 0 && (
                  <span className="text-moon-faint">
                    {" "}({weekData.goalAlignment.unlinkedCompleted} unlinked tasks completed)
                  </span>
                )}
              </p>
            </div>

            {/* Kaizen Summary */}
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-night-soft rounded-lg sm:rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-green" />
                <span className="text-xs sm:text-sm font-medium text-moon">Kaizen Reflections</span>
              </div>
              <p className="text-xs sm:text-sm text-moon-soft">
                You reflected on {weekData.kaizen.checkinsCompleted} of 7 days.
                {weekData.kaizen.strongestArea && (
                  <span className="text-moon-faint">
                    {" "}Strongest area: {formatAreaName(weekData.kaizen.strongestArea.area)}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* REVIEW MODE - Step 2: Wins */}
        {mode === "review" && reviewStep === 2 && weekData && !reviewCompleted && (
          <div className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-lantern-soft flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-lantern" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-moon mb-1.5 sm:mb-2">Celebrate Your Wins</h3>
              <p className="text-xs sm:text-sm text-moon-dim">
                Reflect on what went well this week
              </p>
            </div>

            {/* Data-driven prompts */}
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-night-soft rounded-lg sm:rounded-xl border border-night-mist">
              <p className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint">This week you...</p>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-green flex-shrink-0" />
                  <span className="text-moon-soft">
                    Completed <span className="text-zen-green font-medium">{weekData.stats.tasksCompleted}</span> tasks
                    {weekData.stats.mitCompletionRate >= 70 && (
                      <span className="text-moon-faint"> with a strong MIT rate</span>
                    )}
                  </span>
                </div>
                {weekData.stats.pointsEarned > 0 && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lantern flex-shrink-0" />
                    <span className="text-moon-soft">
                      Earned <span className="text-lantern font-medium">{weekData.stats.pointsEarned}</span> points
                    </span>
                  </div>
                )}
                {weekData.goalAlignment.alignmentRate >= 60 && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-blue flex-shrink-0" />
                    <span className="text-moon-soft">
                      Stayed <span className="text-zen-blue font-medium">{weekData.goalAlignment.alignmentRate}%</span> goal-aligned
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Guided questions */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint">
                Reflection Prompts
              </label>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-moon-dim">
                <p>• What task or goal are you most proud of completing?</p>
                <p>• What habit are you successfully building?</p>
                <p>• What decision did you make that moved you toward your 1-year target?</p>
              </div>
            </div>

            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="This week I'm proud of... The habit I'm building is... I made progress toward my goal by..."
              className="w-full h-24 sm:h-28 bg-night-soft border border-night-mist rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm sm:text-base text-moon placeholder:text-moon-faint resize-none focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
            />
          </div>
        )}

        {/* REVIEW MODE - Step 3: Challenges */}
        {mode === "review" && reviewStep === 3 && weekData && !reviewCompleted && (
          <div className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zen-red-soft flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-zen-red" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-moon mb-1.5 sm:mb-2">Identify Challenges</h3>
              <p className="text-xs sm:text-sm text-moon-dim">
                Honest reflection leads to real improvement
              </p>
            </div>

            {/* Data-driven insights */}
            {(weekData.stats.completionRate < 70 || weekData.goalAlignment.unlinkedCompleted > 3 || weekData.stats.mitCompletionRate < 60) && (
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-night-soft rounded-lg sm:rounded-xl border border-zen-red/20">
                <p className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint">Areas to reflect on...</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {weekData.stats.completionRate < 70 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-red flex-shrink-0" />
                      <span className="text-moon-soft">
                        Only <span className="text-zen-red font-medium">{weekData.stats.completionRate}%</span> task completion rate
                      </span>
                    </div>
                  )}
                  {weekData.goalAlignment.unlinkedCompleted > 3 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Link2Off className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-moon-soft">
                        <span className="text-amber-400 font-medium">{weekData.goalAlignment.unlinkedCompleted}</span> tasks were not linked to goals
                      </span>
                    </div>
                  )}
                  {weekData.stats.mitCompletionRate < 60 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-red flex-shrink-0" />
                      <span className="text-moon-soft">
                        MIT completion at <span className="text-zen-red font-medium">{weekData.stats.mitCompletionRate}%</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Guided questions */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint">
                Reflection Prompts
              </label>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-moon-dim">
                <p>• What distracted you from your most important tasks?</p>
                <p>• Were there tasks that didn&apos;t actually move you toward your goals?</p>
                <p>• What environment or habit needs to change?</p>
              </div>
            </div>

            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="I struggled with... What distracted me was... Next week I will avoid..."
              className="w-full h-24 sm:h-28 bg-night-soft border border-night-mist rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm sm:text-base text-moon placeholder:text-moon-faint resize-none focus:border-zen-red focus:ring-1 focus:ring-zen-red/20 outline-none"
            />
          </div>
        )}

        {/* REVIEW MODE - Completed state */}
        {mode === "review" && reviewCompleted && (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-zen-green/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-zen-green" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-moon mb-1.5 sm:mb-2">Review Complete!</h3>
            <p className="text-xs sm:text-sm text-moon-dim mb-3 sm:mb-4">
              You&apos;ve reflected on your week. Now switch to &quot;Plan Ahead&quot; to set your priorities.
            </p>
            <Button
              onClick={() => setMode("plan")}
              className="bg-zen-green text-void hover:bg-zen-green/90 rounded-lg sm:rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Start Planning
            </Button>
          </div>
        )}

        {/* PLAN MODE - Step 1: Focus */}
        {mode === "plan" && planStep === 1 && weekData && !planCompleted && (
          <div className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zen-green-soft flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-zen-green" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-moon mb-1.5 sm:mb-2">Set Your Focus</h3>
              <p className="text-xs sm:text-sm text-moon-dim">
                What will make next week a success?
              </p>
            </div>

            {/* Kaizen focus suggestion */}
            {weekData.kaizen?.weakestArea && weekData.kaizen.weakestArea.count < weekData.kaizen.checkinsCompleted && (
              <div className="p-3 sm:p-4 bg-night-soft rounded-lg sm:rounded-xl border border-zen-purple/20">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zen-purple" />
                  <span className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint">Suggested Focus</span>
                </div>
                <p className="text-xs sm:text-sm text-moon-soft">
                  Your <span className="text-zen-purple font-medium">{formatAreaName(weekData.kaizen.weakestArea.area)}</span> area
                  {" "}could use more attention. Consider adding tasks that improve this area.
                </p>
              </div>
            )}

            {/* Guided questions */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint">
                Planning Prompts
              </label>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-moon-dim">
                <p>• What ONE thing would make next week a success?</p>
                <p>• What will your MIT focus on?</p>
                <p>• How will you stay aligned with your 1-year target?</p>
              </div>
            </div>

            <textarea
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
              placeholder="My #1 priority is... I will protect time for... To stay aligned I will..."
              className="w-full h-24 sm:h-28 bg-night-soft border border-night-mist rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm sm:text-base text-moon placeholder:text-moon-faint resize-none focus:border-zen-green focus:ring-1 focus:ring-zen-green/20 outline-none"
            />
          </div>
        )}

        {/* PLAN MODE - Step 2: Actions */}
        {mode === "plan" && planStep === 2 && !planCompleted && (
          <div className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-lantern-soft flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-lantern" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-moon mb-1.5 sm:mb-2">Key Actions</h3>
              <p className="text-xs sm:text-sm text-moon-dim">
                What specific tasks will you tackle?
              </p>
            </div>

            {/* Guided questions */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider text-moon-faint">
                Action Prompts
              </label>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-moon-dim">
                <p>• What&apos;s the first MIT you&apos;ll tackle?</p>
                <p>• What habit will you protect or build?</p>
                <p>• What might get in your way, and how will you handle it?</p>
              </div>
            </div>

            <textarea
              value={keyActions}
              onChange={(e) => setKeyActions(e.target.value)}
              placeholder="My first MIT will be... I will build the habit of... To prevent distractions I will..."
              className="w-full h-24 sm:h-28 bg-night-soft border border-night-mist rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm sm:text-base text-moon placeholder:text-moon-faint resize-none focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
            />

            {/* Streak reminder */}
            {currentStreak > 0 && (
              <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-lantern/10 rounded-lg sm:rounded-xl border border-lantern/20">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lantern" />
                <span className="text-xs sm:text-sm text-moon-soft">
                  You&apos;re on a <span className="text-lantern font-medium">{currentStreak}-week</span> review streak! Keep it going.
                </span>
              </div>
            )}
          </div>
        )}

        {/* PLAN MODE - Completed state */}
        {mode === "plan" && planCompleted && (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-zen-green/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-zen-green" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-moon mb-1.5 sm:mb-2">Planning Complete!</h3>
            <p className="text-xs sm:text-sm text-moon-dim mb-3 sm:mb-4">
              You&apos;re all set for next week.
              {!reviewCompleted && " Consider reviewing your past week too."}
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {!reviewCompleted && (
                <Button
                  onClick={() => setMode("review")}
                  variant="outline"
                  className="border-night-mist bg-night-soft text-moon hover:border-lantern rounded-lg sm:rounded-xl"
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Review Past
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-3 sm:p-4 border-t border-night-mist flex items-center justify-between">
        {/* Back button - mode specific */}
        {mode === "review" && !reviewCompleted && (
          <Button
            variant="outline"
            onClick={handleReviewPrev}
            disabled={reviewStep === 1}
            className="border-night-mist bg-night-soft text-moon hover:border-moon-dim disabled:opacity-30 rounded-lg sm:rounded-xl text-xs sm:text-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Back
          </Button>
        )}
        {mode === "plan" && !planCompleted && (
          <Button
            variant="outline"
            onClick={handlePlanPrev}
            disabled={planStep === 1}
            className="border-night-mist bg-night-soft text-moon hover:border-moon-dim disabled:opacity-30 rounded-lg sm:rounded-xl text-xs sm:text-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Back
          </Button>
        )}
        {(isCurrentModeCompleted) && <div />}

        {/* Next/Complete button - mode specific */}
        {mode === "review" && !reviewCompleted && (
          <Button
            onClick={handleReviewNext}
            className="bg-lantern text-void hover:bg-lantern/90 rounded-lg sm:rounded-xl text-xs sm:text-sm"
          >
            {reviewStep < 3 ? "Next" : "Complete Review"}
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
          </Button>
        )}
        {mode === "plan" && !planCompleted && (
          <Button
            onClick={handlePlanNext}
            className="bg-zen-green text-void hover:bg-zen-green/90 rounded-lg sm:rounded-xl text-xs sm:text-sm"
          >
            {planStep < 2 ? "Next" : "Complete Planning"}
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
          </Button>
        )}

        {/* Submit button - when both complete or at least one is complete */}
        {canSubmit && (
          <Button
            onClick={handleSubmit}
            disabled={submitReview.isPending}
            className="bg-zen-green text-void hover:bg-zen-green/90 rounded-lg sm:rounded-xl disabled:opacity-50 text-xs sm:text-sm"
          >
            {submitReview.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                Save & Finish
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyReviewState({ onStartReview, onStartPlan }: { onStartReview: () => void; onStartPlan: () => void }) {
  return (
    <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-lantern-soft flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-lantern" />
      </div>
      <h3 className="text-lg sm:text-xl font-medium text-moon mb-2 sm:mb-3">Weekly Check-in</h3>
      <p className="text-sm sm:text-base text-moon-dim max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
        Take a few minutes to reflect on your progress, celebrate wins, and plan
        for the week ahead. You can review, plan, or do both.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
        <Button
          onClick={onStartReview}
          className="bg-lantern text-void hover:bg-lantern/90 font-medium px-5 sm:px-6 h-10 sm:h-11 rounded-lg sm:rounded-xl w-full sm:w-auto text-sm"
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
          Review Past Week
        </Button>
        <Button
          onClick={onStartPlan}
          variant="outline"
          className="border-zen-green text-zen-green hover:bg-zen-green/10 font-medium px-5 sm:px-6 h-10 sm:h-11 rounded-lg sm:rounded-xl w-full sm:w-auto text-sm"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
          Plan Ahead
        </Button>
      </div>
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

export default function WeeklyReviewPage() {
  const router = useRouter();
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [initialMode, setInitialMode] = useState<ReviewMode>("review");
  const { data: weekData, isLoading } = useWeeklyReview(0);
  const { data: streaksData } = useUserStreaks();

  const handleStartReview = () => {
    setInitialMode("review");
    setIsReviewing(true);
  };

  const handleStartPlan = () => {
    setInitialMode("plan");
    setIsReviewing(true);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsReviewing(false);
  };

  // Get current week date range
  const getWeekRange = () => {
    if (weekData?.weekRange) {
      const start = new Date(weekData.weekRange.start);
      const end = new Date(weekData.weekRange.end);

      const formatDate = (date: Date) =>
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return `${formatDate(start)} – ${formatDate(end)}`;
    }

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader
          title="Weekly Review"
          subtitle={`Week of ${getWeekRange()}`}
        />
        <LoadingState />
      </AppShell>
    );
  }

  const stats = weekData?.stats || {
    tasksCompleted: 0,
    totalTasks: 0,
    completionRate: 0,
    mitCompletionRate: 0,
    goalsProgressed: 0,
    pointsEarned: 0,
  };

  const currentStreak = streaksData?.streaks.find(
    (s) => s.type === "MIT_COMPLETION"
  )?.currentCount || 0;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <PageHeader
          title="Weekly Review"
          subtitle={`Week of ${getWeekRange()}`}
        />
        <Link href="/review/history">
          <Button
            variant="outline"
            size="sm"
            className="border-night-mist text-moon-dim hover:text-moon hover:border-night-glow text-xs sm:text-sm"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Past Reviews</span>
            <span className="sm:hidden">History</span>
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={stats.tasksCompleted}
          iconColor="text-zen-green"
        />
        <StatCard
          icon={Target}
          label="Goals Progressed"
          value={stats.goalsProgressed}
          iconColor="text-zen-blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Points Earned"
          value={stats.pointsEarned}
          iconColor="text-lantern"
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={currentStreak}
          iconColor="text-zen-red"
        />
      </div>

      {/* Daily Breakdown */}
      {weekData?.dailyBreakdown && (
        <div className="mb-4 sm:mb-6">
          <WeeklyCalendar dailyBreakdown={weekData.dailyBreakdown} />
        </div>
      )}

      {/* Goal Alignment & Kaizen */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {weekData?.goalAlignment && (
          <GoalAlignmentCard goalAlignment={weekData.goalAlignment} />
        )}
        {weekData?.kaizen && (
          <KaizenWeeklyCard kaizen={weekData.kaizen} />
        )}
      </div>

      {/* Goal Review Section - Edit/Pause/Abandon Goals */}
      <GoalReviewSection className="mb-4 sm:mb-6" />

      {/* Review Wizard, Completed State, or Empty State */}
      {isCompleted ? (
        <div className="bg-night border border-night-mist rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-zen-green/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-zen-green" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-moon mb-2 sm:mb-3">Review Completed!</h3>
          <p className="text-sm sm:text-base text-moon-dim max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
            Great job reflecting on your week. Keep building momentum with consistent reviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-lantern text-void hover:bg-lantern/90 font-medium px-5 sm:px-6 h-10 sm:h-11 rounded-lg sm:rounded-xl w-full sm:w-auto text-sm"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => {
                setIsCompleted(false);
                setIsReviewing(true);
              }}
              variant="outline"
              className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern font-medium px-5 sm:px-6 h-10 sm:h-11 rounded-lg sm:rounded-xl w-full sm:w-auto text-sm"
            >
              Edit Review
            </Button>
          </div>
        </div>
      ) : isReviewing ? (
        <ReviewWizard weekData={weekData} streaks={streaksData?.streaks || []} onComplete={handleComplete} initialMode={initialMode} />
      ) : (
        <EmptyReviewState onStartReview={handleStartReview} onStartPlan={handleStartPlan} />
      )}
    </AppShell>
  );
}

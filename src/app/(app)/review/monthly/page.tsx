"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useMonthlyReview, useSubmitMonthlyReview, formatAreaName } from "@/hooks";
import { useRouter } from "next/navigation";
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
  Trophy,
  BarChart3,
} from "lucide-react";

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

const reviewSteps = [
  { id: 1, title: "Month Stats", description: "Review your performance" },
  { id: 2, title: "Wins", description: "Celebrate achievements" },
  { id: 3, title: "Learnings", description: "What you learned" },
  { id: 4, title: "Next Month", description: "Set new targets" },
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
    <div className="bg-night border border-night-mist rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-night-soft flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-semibold text-moon">{value}</p>
          <p className="text-xs text-moon-dim">{label}</p>
          {subvalue && <p className="text-xs text-moon-faint">{subvalue}</p>}
        </div>
      </div>
    </div>
  );
}

function WeeklyBreakdownCard({ weeklyBreakdowns }: {
  weeklyBreakdowns: Array<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    tasksCompleted: number;
    totalTasks: number;
    mitCompleted: number;
    mitTotal: number;
    pointsEarned: number;
  }>
}) {
  const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-zen-blue/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-zen-blue" />
        </div>
        <div>
          <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Weekly Breakdown
          </h3>
          <p className="text-lg font-semibold text-moon">Performance by Week</p>
        </div>
      </div>

      <div className="space-y-3">
        {weeklyBreakdowns.map((week) => {
          const completionRate = week.totalTasks > 0
            ? Math.round((week.tasksCompleted / week.totalTasks) * 100)
            : 0;

          return (
            <div key={week.weekNumber} className="p-3 bg-night-soft rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-moon">Week {week.weekNumber}</span>
                <span className="text-xs text-moon-faint">{formatWeekRange(week.startDate, week.endDate)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-night-mist rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        completionRate >= 80 ? "bg-zen-green" :
                        completionRate >= 50 ? "bg-lantern" : "bg-moon-dim"
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-moon-soft">
                    {week.tasksCompleted}/{week.totalTasks} tasks
                  </span>
                  {week.mitCompleted > 0 && (
                    <span className="text-lantern">
                      {week.mitCompleted}/{week.mitTotal} MIT
                    </span>
                  )}
                  <span className="text-zen-green">+{week.pointsEarned} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyGoalsCard({ goals }: {
  goals: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
  }>
}) {
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-lantern/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-lantern" />
        </div>
        <div>
          <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Monthly Goals
          </h3>
          <p className="text-lg font-semibold text-moon">
            {completedGoals.length} / {goals.length} Completed
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-moon-faint py-4 text-center">
          No monthly goals set for this period
        </p>
      ) : (
        <div className="space-y-3">
          {/* Completed goals */}
          {completedGoals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-3 p-3 bg-zen-green/5 border border-zen-green/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-zen-green flex-shrink-0" />
              <span className="text-sm text-moon flex-1">{goal.title}</span>
              <span className="text-xs text-zen-green">Completed</span>
            </div>
          ))}

          {/* Active/In-progress goals */}
          {activeGoals.map((goal) => (
            <div key={goal.id} className="p-3 bg-night-soft rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-moon">{goal.title}</span>
                <span className="text-xs text-moon-faint">{goal.progress}%</span>
              </div>
              <div className="h-1.5 bg-night-mist rounded-full overflow-hidden">
                <div
                  className="h-full bg-lantern rounded-full"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KaizenMonthlyCard({ kaizen, daysInMonth }: {
  kaizen: {
    checkinsCompleted: number;
    checkinsTotal: number;
    completionRate: number;
    balancedDays: number;
    areaBreakdown: Record<string, number>;
    strongestArea: { area: string; count: number } | null;
    weakestArea: { area: string; count: number } | null;
  };
  daysInMonth: number;
}) {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-zen-green/10 flex items-center justify-center">
          <Star className="w-5 h-5 text-zen-green" />
        </div>
        <div>
          <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Kaizen Reflections
          </h3>
          <p className="text-lg font-semibold text-moon">
            {kaizen.checkinsCompleted} / {daysInMonth} Days ({kaizen.completionRate}%)
          </p>
        </div>
      </div>

      {/* Area breakdown */}
      <div className="space-y-2 mb-4">
        {Object.entries(kaizen.areaBreakdown).map(([area, count]) => {
          const Icon = AREA_ICONS[area] || Star;
          const color = AREA_COLORS[area] || "text-moon-soft";
          const percentage = Math.round((count / daysInMonth) * 100);

          return (
            <div key={area} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-moon-soft flex-1">{formatAreaName(area)}</span>
              <div className="w-24 h-1.5 bg-night-mist rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${percentage >= 70 ? "bg-zen-green" : "bg-lantern"}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-moon-faint w-12 text-right">{count} days</span>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="space-y-2 pt-4 border-t border-night-mist">
        {kaizen.balancedDays > 0 && (
          <p className="text-xs text-moon-soft">
            <span className="text-zen-purple">Balanced days:</span> {kaizen.balancedDays} (all 6 areas improved)
          </p>
        )}
        {kaizen.strongestArea && (
          <p className="text-xs text-moon-soft">
            <span className="text-zen-green">Strongest:</span>{" "}
            {formatAreaName(kaizen.strongestArea.area)} ({kaizen.strongestArea.count} days)
          </p>
        )}
        {kaizen.weakestArea && (
          <p className="text-xs text-moon-soft">
            <span className="text-amber-400">Needs attention:</span>{" "}
            {formatAreaName(kaizen.weakestArea.area)} ({kaizen.weakestArea.count} days)
          </p>
        )}
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
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-zen-blue/10 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-zen-blue" />
        </div>
        <div>
          <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint">
            Goal Alignment
          </h3>
          <p className="text-lg font-semibold text-moon">{goalAlignment.alignmentRate}% Aligned</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-night-soft rounded-lg">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-zen-green" />
            <span className="text-sm text-moon-soft">Goal-linked tasks</span>
          </div>
          <span className="text-sm font-medium text-moon">
            {goalAlignment.linkedCompleted} / {goalAlignment.totalLinked}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-night-soft rounded-lg">
          <div className="flex items-center gap-2">
            <Link2Off className="w-4 h-4 text-moon-faint" />
            <span className="text-sm text-moon-soft">Unlinked tasks</span>
          </div>
          <span className="text-sm font-medium text-moon">
            {goalAlignment.unlinkedCompleted} / {goalAlignment.totalUnlinked}
          </span>
        </div>
      </div>

      {goalAlignment.alignmentRate >= 80 && (
        <p className="mt-4 text-xs text-zen-green">
          Great job staying focused on your goals this month!
        </p>
      )}
      {goalAlignment.alignmentRate < 50 && goalAlignment.totalUnlinked > 0 && (
        <p className="mt-4 text-xs text-moon-faint">
          Consider linking more tasks to goals to improve focus and alignment.
        </p>
      )}
    </div>
  );
}

function ReviewWizard({ monthData, onComplete }: {
  monthData: ReturnType<typeof useMonthlyReview>["data"];
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wins, setWins] = useState("");
  const [learnings, setLearnings] = useState("");
  const [nextMonthFocus, setNextMonthFocus] = useState("");

  const submitReview = useSubmitMonthlyReview();

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const result = await submitReview.mutateAsync({
        wins,
        learnings,
        nextMonthFocus,
        monthOffset: 0,
      });

      if (result.isNewReview) {
        toast.success(`Monthly review completed! +${result.pointsAwarded} points`);
      } else {
        toast.success("Monthly review updated!");
      }

      onComplete();
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="bg-night border border-night-mist rounded-2xl overflow-hidden">
      {/* Step Indicator */}
      <div className="p-4 border-b border-night-mist bg-night-soft">
        <div className="flex items-center justify-between">
          {reviewSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      currentStep === step.id
                        ? "bg-lantern text-void"
                        : currentStep > step.id
                        ? "bg-zen-green text-void"
                        : "bg-night-mist text-moon-faint"
                    }
                  `}
                >
                  {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span className="text-[0.625rem] text-moon-faint mt-1 hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < reviewSteps.length - 1 && (
                <div
                  className={`
                    w-12 h-0.5 mx-2
                    ${currentStep > step.id ? "bg-zen-green" : "bg-night-mist"}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {currentStep === 1 && monthData && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-moon mb-2">Month in Review</h3>
              <p className="text-sm text-moon-dim">
                Here&apos;s how you performed in {monthData.monthRange.monthName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={CheckCircle2}
                label="Tasks Completed"
                value={`${monthData.stats.tasksCompleted}/${monthData.stats.totalTasks}`}
                subvalue={`${monthData.stats.completionRate}%`}
                iconColor="text-zen-green"
              />
              <StatCard
                icon={Target}
                label="Goals Completed"
                value={`${monthData.stats.goalsCompleted}/${monthData.stats.goalsTotal}`}
                iconColor="text-zen-blue"
              />
              <StatCard
                icon={TrendingUp}
                label="Points Earned"
                value={monthData.stats.pointsEarned.toLocaleString()}
                iconColor="text-lantern"
              />
              <StatCard
                icon={Flame}
                label="MIT Rate"
                value={`${monthData.stats.mitCompletionRate}%`}
                iconColor="text-zen-red"
              />
            </div>

            {/* Key metrics summary */}
            <div className="mt-4 p-4 bg-night-soft rounded-xl space-y-2">
              <p className="text-sm text-moon-soft">
                <span className="text-zen-blue font-medium">Goal Alignment:</span>{" "}
                {monthData.goalAlignment.alignmentRate}% of completed tasks were goal-linked
              </p>
              <p className="text-sm text-moon-soft">
                <span className="text-zen-green font-medium">Kaizen Rate:</span>{" "}
                You reflected on {monthData.kaizen.checkinsCompleted} of {monthData.stats.daysInMonth} days
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-lantern-soft flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-lantern" />
              </div>
              <h3 className="text-lg font-medium text-moon mb-2">Celebrate Your Wins</h3>
              <p className="text-sm text-moon-dim">
                What were your biggest achievements this month?
              </p>
            </div>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="Completed the project ahead of deadline, maintained a 3-week workout streak, read 4 books..."
              className="w-full h-32 bg-night-soft border border-night-mist rounded-xl p-4 text-moon placeholder:text-moon-faint resize-none focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-zen-purple-soft flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-zen-purple" />
              </div>
              <h3 className="text-lg font-medium text-moon mb-2">Key Learnings</h3>
              <p className="text-sm text-moon-dim">
                What did you learn? What patterns did you notice?
              </p>
            </div>
            <textarea
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Morning routines work best for deep work, need to batch meetings better, social media is a bigger time drain than I realized..."
              className="w-full h-32 bg-night-soft border border-night-mist rounded-xl p-4 text-moon placeholder:text-moon-faint resize-none focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-zen-green-soft flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-zen-green" />
              </div>
              <h3 className="text-lg font-medium text-moon mb-2">Plan Next Month</h3>
              <p className="text-sm text-moon-dim">
                What are your top priorities for next month?
              </p>
            </div>
            <textarea
              value={nextMonthFocus}
              onChange={(e) => setNextMonthFocus(e.target.value)}
              placeholder="Launch the new feature, establish daily meditation habit, read 2 books, improve sleep schedule..."
              className="w-full h-32 bg-night-soft border border-night-mist rounded-xl p-4 text-moon placeholder:text-moon-faint resize-none focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-night-mist flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="border-night-mist bg-night-soft text-moon hover:border-moon-dim disabled:opacity-30 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            className="bg-lantern text-void hover:bg-lantern/90 rounded-xl"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitReview.isPending}
            className="bg-zen-green text-void hover:bg-zen-green/90 rounded-xl disabled:opacity-50"
          >
            {submitReview.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Review
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyReviewState({ onStartReview, monthName }: { onStartReview: () => void; monthName: string }) {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-lantern-soft flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-10 h-10 text-lantern" />
      </div>
      <h3 className="text-xl font-medium text-moon mb-3">Complete Your Monthly Review</h3>
      <p className="text-moon-dim max-w-md mx-auto mb-8 leading-relaxed">
        Reflect on {monthName}, celebrate your progress, identify patterns, and set intentions
        for the month ahead. Monthly reviews build long-term momentum.
      </p>
      <Button
        onClick={onStartReview}
        className="bg-lantern text-void hover:bg-lantern/90 font-medium px-6 h-11 rounded-xl"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Start Monthly Review
      </Button>
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

export default function MonthlyReviewPage() {
  const router = useRouter();
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { data: monthData, isLoading } = useMonthlyReview(0);

  const handleStartReview = () => {
    setIsReviewing(true);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsReviewing(false);
  };

  const monthName = monthData?.monthRange.monthName || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader
          title="Monthly Review"
          subtitle={monthName}
        />
        <LoadingState />
      </AppShell>
    );
  }

  const stats = monthData?.stats || {
    tasksCompleted: 0,
    totalTasks: 0,
    completionRate: 0,
    mitCompletionRate: 0,
    goalsCompleted: 0,
    goalsTotal: 0,
    pointsEarned: 0,
    daysInMonth: 30,
  };

  return (
    <AppShell>
      <PageHeader
        title="Monthly Review"
        subtitle={monthName}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={stats.tasksCompleted}
          subvalue={`${stats.completionRate}% completion`}
          iconColor="text-zen-green"
        />
        <StatCard
          icon={Target}
          label="Goals Completed"
          value={`${stats.goalsCompleted}/${stats.goalsTotal}`}
          iconColor="text-zen-blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Points Earned"
          value={stats.pointsEarned.toLocaleString()}
          iconColor="text-lantern"
        />
        <StatCard
          icon={Flame}
          label="MIT Rate"
          value={`${stats.mitCompletionRate}%`}
          iconColor="text-zen-red"
        />
      </div>

      {/* Weekly Breakdown */}
      {monthData?.weeklyBreakdowns && monthData.weeklyBreakdowns.length > 0 && (
        <div className="mb-6">
          <WeeklyBreakdownCard weeklyBreakdowns={monthData.weeklyBreakdowns} />
        </div>
      )}

      {/* Monthly Goals, Kaizen & Alignment */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {monthData?.goals && (
          <MonthlyGoalsCard goals={monthData.goals} />
        )}
        {monthData?.kaizen && (
          <KaizenMonthlyCard kaizen={monthData.kaizen} daysInMonth={stats.daysInMonth} />
        )}
      </div>

      {monthData?.goalAlignment && (
        <div className="mb-6">
          <GoalAlignmentCard goalAlignment={monthData.goalAlignment} />
        </div>
      )}

      {/* Review Wizard, Completed State, or Empty State */}
      {isCompleted ? (
        <div className="bg-night border border-night-mist rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zen-green/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-zen-green" />
          </div>
          <h3 className="text-xl font-medium text-moon mb-3">Monthly Review Completed!</h3>
          <p className="text-moon-dim max-w-md mx-auto mb-8 leading-relaxed">
            Great job reflecting on {monthName}. Your insights have been saved and you&apos;ve
            earned points for completing your monthly review.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-lantern text-void hover:bg-lantern/90 font-medium px-6 h-11 rounded-xl"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => router.push("/progress")}
              variant="outline"
              className="border-night-mist bg-night-soft text-moon hover:border-moon-dim font-medium px-6 h-11 rounded-xl"
            >
              <Award className="w-4 h-4 mr-2" />
              View Progress
            </Button>
          </div>
        </div>
      ) : isReviewing ? (
        <ReviewWizard monthData={monthData} onComplete={handleComplete} />
      ) : (
        <EmptyReviewState onStartReview={handleStartReview} monthName={monthName} />
      )}
    </AppShell>
  );
}

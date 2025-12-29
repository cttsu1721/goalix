"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

// Mock data - will be replaced with real data from API
const mockWeekStats = {
  tasksCompleted: 18,
  tasksTotal: 24,
  goalsProgressed: 4,
  pointsEarned: 875,
  streakDays: 12,
  mitCompletionRate: 85,
};

const mockDailyBreakdown = [
  { day: "Mon", completed: 4, total: 5, mit: true },
  { day: "Tue", completed: 3, total: 4, mit: true },
  { day: "Wed", completed: 2, total: 3, mit: false },
  { day: "Thu", completed: 3, total: 4, mit: true },
  { day: "Fri", completed: 4, total: 4, mit: true },
  { day: "Sat", completed: 1, total: 2, mit: true },
  { day: "Sun", completed: 1, total: 2, mit: true },
];

const reviewSteps = [
  { id: 1, title: "Week Stats", description: "Review your performance" },
  { id: 2, title: "Wins", description: "Celebrate achievements" },
  { id: 3, title: "Challenges", description: "Identify obstacles" },
  { id: 4, title: "Next Week", description: "Set priorities" },
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

function WeeklyCalendar() {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-6">
      <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint mb-4">
        Daily Breakdown
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {mockDailyBreakdown.map((day) => {
          const completionRate = (day.completed / day.total) * 100;

          return (
            <div key={day.day} className="text-center">
              <span className="text-xs text-moon-faint block mb-2">{day.day}</span>
              <div
                className={`
                  w-full aspect-square rounded-lg flex flex-col items-center justify-center
                  ${completionRate === 100 ? "bg-zen-green-soft border border-zen-green/30" : "bg-night-soft border border-night-mist"}
                `}
              >
                <span className={`text-lg font-semibold ${completionRate === 100 ? "text-zen-green" : "text-moon"}`}>
                  {day.completed}
                </span>
                <span className="text-[0.625rem] text-moon-faint">/{day.total}</span>
              </div>
              {day.mit && (
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

function ReviewWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [nextWeekFocus, setNextWeekFocus] = useState("");

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    console.log("Review submitted:", { wins, challenges, nextWeekFocus });
    // Will submit to API
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
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-moon mb-2">Week in Review</h3>
              <p className="text-sm text-moon-dim">
                Here&apos;s how you performed this week
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={CheckCircle2}
                label="Tasks Completed"
                value={`${mockWeekStats.tasksCompleted}/${mockWeekStats.tasksTotal}`}
                subvalue={`${Math.round((mockWeekStats.tasksCompleted / mockWeekStats.tasksTotal) * 100)}%`}
                iconColor="text-zen-green"
              />
              <StatCard
                icon={Target}
                label="Goals Progressed"
                value={mockWeekStats.goalsProgressed}
                iconColor="text-zen-blue"
              />
              <StatCard
                icon={TrendingUp}
                label="Points Earned"
                value={mockWeekStats.pointsEarned}
                iconColor="text-lantern"
              />
              <StatCard
                icon={Flame}
                label="MIT Rate"
                value={`${mockWeekStats.mitCompletionRate}%`}
                iconColor="text-zen-red"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-lantern-soft flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-lantern" />
              </div>
              <h3 className="text-lg font-medium text-moon mb-2">Celebrate Your Wins</h3>
              <p className="text-sm text-moon-dim">
                What went well this week? What are you proud of?
              </p>
            </div>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="I completed my MIT every day, finished the quarterly report ahead of schedule..."
              className="w-full h-32 bg-night-soft border border-night-mist rounded-xl p-4 text-moon placeholder:text-moon-faint resize-none focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-zen-red-soft flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-zen-red" />
              </div>
              <h3 className="text-lg font-medium text-moon mb-2">Identify Challenges</h3>
              <p className="text-sm text-moon-dim">
                What obstacles did you face? What could be improved?
              </p>
            </div>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Got distracted by social media, struggled to wake up early on Wednesday..."
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
              <h3 className="text-lg font-medium text-moon mb-2">Plan Next Week</h3>
              <p className="text-sm text-moon-dim">
                What&apos;s your main focus for the upcoming week?
              </p>
            </div>
            <textarea
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
              placeholder="Focus on the product launch, maintain morning workout routine, limit social media to 30 min/day..."
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
            className="bg-zen-green text-void hover:bg-zen-green/90 rounded-xl"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Review
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyReviewState({ onStartReview }: { onStartReview: () => void }) {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-lantern-soft flex items-center justify-center mx-auto mb-6">
        <FileText className="w-10 h-10 text-lantern" />
      </div>
      <h3 className="text-xl font-medium text-moon mb-3">Complete Your Weekly Review</h3>
      <p className="text-moon-dim max-w-md mx-auto mb-8 leading-relaxed">
        Take a few minutes to reflect on your progress, celebrate wins, and plan
        for the week ahead. Regular reviews are key to continuous improvement.
      </p>
      <Button
        onClick={onStartReview}
        className="bg-lantern text-void hover:bg-lantern/90 font-medium px-6 h-11 rounded-xl"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Start Weekly Review
      </Button>
    </div>
  );
}

export default function WeeklyReviewPage() {
  const [isReviewing, setIsReviewing] = useState(false);

  const handleStartReview = () => {
    setIsReviewing(true);
  };

  // Get current week date range
  const getWeekRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1); // Monday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  return (
    <AppShell>
      <PageHeader
        title="Weekly Review"
        subtitle={`Week of ${getWeekRange()}`}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={mockWeekStats.tasksCompleted}
          iconColor="text-zen-green"
        />
        <StatCard
          icon={Target}
          label="Goals Progressed"
          value={mockWeekStats.goalsProgressed}
          iconColor="text-zen-blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Points Earned"
          value={mockWeekStats.pointsEarned}
          iconColor="text-lantern"
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={mockWeekStats.streakDays}
          iconColor="text-zen-red"
        />
      </div>

      {/* Daily Breakdown */}
      <div className="mb-6">
        <WeeklyCalendar />
      </div>

      {/* Review Wizard or Empty State */}
      {isReviewing ? (
        <ReviewWizard />
      ) : (
        <EmptyReviewState onStartReview={handleStartReview} />
      )}
    </AppShell>
  );
}

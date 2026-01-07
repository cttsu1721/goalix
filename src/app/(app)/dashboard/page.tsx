"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MitCard, TaskList, shouldShowCarryOverPrompt, FloatingActionButton } from "@/components/tasks";
import { StatsPanel } from "@/components/gamification/StatsPanel";
import { MobileStatsBar } from "@/components/gamification/MobileStatsBar";
import { YearTargetHeader } from "@/components/dashboard";

// Lazy load modal components to reduce initial bundle size
const TaskCreateModal = dynamic(
  () => import("@/components/tasks/TaskCreateModal").then((m) => m.TaskCreateModal),
  { ssr: false }
);
const TaskEditModal = dynamic(
  () => import("@/components/tasks/TaskEditModal").then((m) => m.TaskEditModal),
  { ssr: false }
);
const PlanDayModal = dynamic(
  () => import("@/components/tasks/PlanDayModal").then((m) => m.PlanDayModal),
  { ssr: false }
);
const TaskSuggestModal = dynamic(
  () => import("@/components/ai/TaskSuggestModal").then((m) => m.TaskSuggestModal),
  { ssr: false }
);
const FirstMitCelebration = dynamic(
  () => import("@/components/gamification/FirstMitCelebration").then((m) => m.FirstMitCelebration),
  { ssr: false }
);
const TaskCarryOverModal = dynamic(
  () => import("@/components/tasks/TaskCarryOverModal").then((m) => m.TaskCarryOverModal),
  { ssr: false }
);
const KaizenCheckinDialog = dynamic(
  () => import("@/components/kaizen/KaizenCheckinDialog").then((m) => m.KaizenCheckinDialog),
  { ssr: false }
);
const LevelUpModal = dynamic(
  () => import("@/components/gamification/LevelUpModal").then((m) => m.LevelUpModal),
  { ssr: false }
);
const BadgeEarnedModal = dynamic(
  () => import("@/components/gamification/BadgeEarnedModal").then((m) => m.BadgeEarnedModal),
  { ssr: false }
);
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useTaskCompletion,
  useCarryOverTasks,
  useUserStats,
  useKaizenCheckin,
  useSaveKaizenCheckin,
  useGoals,
  useGenerateRecurringTasks,
} from "@/hooks";
import { useAIUsage } from "@/hooks/useAI";
import { LEVELS } from "@/types/gamification";
import { TASK_PRIORITY_POINTS } from "@/types/tasks";
import { formatLocalDate } from "@/lib/utils";
import { Sparkles, CalendarDays, AlertTriangle } from "lucide-react";
import { DashboardSkeleton, StatsPanelSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { shouldShowKaizenPrompt, markKaizenPromptDismissed } from "@/lib/kaizen/prompt";
import type { TaskPriority, GoalCategory } from "@prisma/client";
import type { SuggestedTask } from "@/lib/ai/schemas";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    HEALTH: "Health",
    WEALTH: "Wealth",
    RELATIONSHIPS: "Relationships",
    CAREER: "Career",
    PERSONAL_GROWTH: "Personal Growth",
    LIFESTYLE: "Lifestyle",
    OTHER: "Other",
  };
  return labels[category] || category;
}

// Format overdue date to show relative time
function formatOverdueLabel(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const today = formatLocalDate();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>("SECONDARY");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isPlanDayModalOpen, setIsPlanDayModalOpen] = useState(false);
  const [isTaskSuggestModalOpen, setIsTaskSuggestModalOpen] = useState(false);
  const [isFirstMitCelebrationOpen, setIsFirstMitCelebrationOpen] = useState(false);
  const [firstMitPoints, setFirstMitPoints] = useState(100);
  const [isCarryOverModalOpen, setIsCarryOverModalOpen] = useState(false);
  const [isKaizenPromptOpen, setIsKaizenPromptOpen] = useState(false);

  // Level up modal state
  const [levelUpData, setLevelUpData] = useState<{
    previousLevel: number;
    newLevel: number;
    newLevelName: string;
  } | null>(null);

  // Badge earned modal state (queue to handle multiple badges)
  const [earnedBadge, setEarnedBadge] = useState<{
    name: string;
    description: string;
    icon: string;
    category: string;
  } | null>(null);

  // Fetch data - include overdue tasks for Today's Focus
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks(today, { includeOverdue: true });
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useUserStats();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchTasks(), refetchStats()]);
  }, [refetchTasks, refetchStats]);
  const { data: kaizenData } = useKaizenCheckin(today);
  const { data: goalsData } = useGoals("weekly");
  const { data: oneYearGoalsData } = useGoals("oneYear", undefined, "ACTIVE");
  const { data: aiUsage } = useAIUsage();

  // Weekly goals for task suggestions
  const weeklyGoals = (goalsData?.goals || []) as Array<{
    id: string;
    title: string;
    description?: string;
    category: GoalCategory;
    monthlyGoal?: {
      id: string;
      title: string;
      oneYearGoal?: { id: string; title: string } | null;
    } | null;
  }>;

  // Get primary 1-year goal (most recent active one)
  const oneYearGoals = (oneYearGoalsData?.goals || []) as Array<{
    id: string;
    title: string;
    description?: string | null;
    category: GoalCategory;
    progress: number;
    threeYearGoal?: {
      id: string;
      title: string;
      sevenYearVision?: { id: string; title: string } | null;
    } | null;
  }>;
  const primaryOneYearGoal = oneYearGoals[0] || null;

  // Get the most relevant weekly goal (one that links to the 1-year target if possible)
  const primaryWeeklyGoal = weeklyGoals.find(
    (wg) => wg.monthlyGoal?.oneYearGoal?.id === primaryOneYearGoal?.id
  ) || weeklyGoals[0] || null;

  const aiRemaining = aiUsage?.remaining ?? 5;
  const aiLimit = aiUsage?.limit ?? 5;

  // Mutations
  const handleFirstMit = useCallback((pointsEarned: number) => {
    setFirstMitPoints(pointsEarned);
    setIsFirstMitCelebrationOpen(true);
  }, []);

  const handleLevelUp = useCallback((previousLevel: number, newLevel: number) => {
    const levelInfo = LEVELS.find((l) => l.level === newLevel);
    setLevelUpData({
      previousLevel,
      newLevel,
      newLevelName: levelInfo?.name || `Level ${newLevel}`,
    });
  }, []);

  const handleBadgeEarned = useCallback((badge: {
    slug: string;
    name: string;
    description: string;
    icon?: string;
    category?: string;
  }) => {
    setEarnedBadge({
      name: badge.name,
      description: badge.description,
      icon: badge.icon || "🏆",
      category: badge.category || "achievement",
    });
  }, []);

  const { complete: completeTask, isPending: isCompleting } = useTaskCompletion({
    onFirstMit: handleFirstMit,
    onLevelUp: handleLevelUp,
    onBadgeEarned: handleBadgeEarned,
  });
  const updateTask = useUpdateTask();
  const saveKaizen = useSaveKaizenCheckin();
  const createTask = useCreateTask();
  const carryOverTasks = useCarryOverTasks();
  const generateRecurring = useGenerateRecurringTasks();

  // Generate recurring tasks for today (once per day)
  // Use ref to track if we've already started the mutation this session
  const recurringGenerationStarted = useRef(false);

  useEffect(() => {
    const RECURRING_GENERATED_KEY = "recurring_tasks_generated_date";
    const lastGenerated = localStorage.getItem(RECURRING_GENERATED_KEY);

    // Only generate if:
    // 1. Not already done today (localStorage check)
    // 2. Not already started this session (ref check to prevent double-call)
    // 3. Not currently pending (mutation check)
    if (
      lastGenerated !== today &&
      !recurringGenerationStarted.current &&
      !generateRecurring.isPending
    ) {
      recurringGenerationStarted.current = true;
      generateRecurring.mutate(
        { date: today },
        {
          onSuccess: (result) => {
            localStorage.setItem(RECURRING_GENERATED_KEY, today);
            if (result.createdCount > 0) {
              // Silently generated - no toast needed, tasks will appear in list
            }
          },
          onError: () => {
            // Reset ref on error so it can retry
            recurringGenerationStarted.current = false;
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]); // Only depend on today - generateRecurring is stable enough with the ref guard

  // Check for end-of-day carry-over prompt (after tasks load)
  useEffect(() => {
    if (!tasksLoading && tasksData?.tasks) {
      const incompleteTodayTasks = tasksData.tasks.filter(
        (t) => t.status !== "COMPLETED" && formatLocalDate(new Date(t.scheduledDate)) === today
      );

      // Show carry-over modal if:
      // 1. It's evening time (6pm - 11pm)
      // 2. There are incomplete tasks
      // 3. User hasn't dismissed it today
      if (
        incompleteTodayTasks.length > 0 &&
        shouldShowCarryOverPrompt()
      ) {
        // Small delay to not interrupt page load
        const timer = setTimeout(() => {
          setIsCarryOverModalOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [tasksLoading, tasksData?.tasks, today]);

  // Check for evening Kaizen reflection prompt
  useEffect(() => {
    // Wait for Kaizen data to load
    if (kaizenData === undefined) return;

    // Check if Kaizen check-in is incomplete (no areas checked)
    const hasKaizenCheckin = kaizenData?.checkin && (
      kaizenData.checkin.health ||
      kaizenData.checkin.relationships ||
      kaizenData.checkin.wealth ||
      kaizenData.checkin.career ||
      kaizenData.checkin.personalGrowth ||
      kaizenData.checkin.lifestyle
    );

    // Show Kaizen prompt if:
    // 1. It's evening (6pm - 11pm)
    // 2. User hasn't completed Kaizen today
    // 3. User hasn't dismissed the prompt today
    if (!hasKaizenCheckin && shouldShowKaizenPrompt()) {
      // Delay slightly longer than carry-over to stagger prompts
      const timer = setTimeout(() => {
        // Don't show if carry-over is already open
        if (!isCarryOverModalOpen) {
          setIsKaizenPromptOpen(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [kaizenData, isCarryOverModalOpen]);

  // Global keyboard shortcut: Cmd+N / Ctrl+N to open new task modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+N (Mac) or Ctrl+N (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setDefaultPriority("SECONDARY"); // Default to secondary for quick add
        setIsCreateModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Uncomplete a task (revert to pending)
  const uncompleteTask = useCallback(async (taskId: string) => {
    try {
      await updateTask.mutateAsync({ id: taskId, status: "PENDING" });
      toast.success("Task reopened");
      refetchTasks();
    } catch {
      toast.error("Failed to reopen task");
    }
  }, [updateTask, refetchTasks]);

  // Transform tasks data - memoized (MUST be before early return to follow Rules of Hooks)
  const allTasks = tasksData?.tasks || [];
  const requestedDate = tasksData?.requestedDate || today;

  const { tasks, overdueTasks, mitTask, mit, primaryTasksFormatted, secondaryTasksFormatted, overdueTasksFormatted } = useMemo(() => {
    // Separate today's tasks from overdue tasks
    const todayTasks = allTasks.filter((t) => {
      const taskDate = formatLocalDate(new Date(t.scheduledDate));
      return taskDate === requestedDate;
    });
    const overdue = allTasks.filter((t) => {
      const taskDate = formatLocalDate(new Date(t.scheduledDate));
      return taskDate < requestedDate && t.status !== "COMPLETED";
    });

    const mitTask = todayTasks.find((t) => t.priority === "MIT");
    const primaryTasks = todayTasks.filter((t) => t.priority === "PRIMARY");
    const secondaryTasks = todayTasks.filter((t) => t.priority === "SECONDARY");

    // Transform task helper - includes goal chain for task-goal connection display
    const transformTask = (task: (typeof allTasks)[0], isOverdue = false) => ({
      id: task.id,
      title: task.title,
      category: getCategoryLabel(task.weeklyGoal?.category || "OTHER"),
      completed: task.status === "COMPLETED",
      points: TASK_PRIORITY_POINTS[task.priority],
      isOverdue,
      scheduledDate: formatLocalDate(new Date(task.scheduledDate)),
      priority: task.priority as "MIT" | "PRIMARY" | "SECONDARY",
      goalChain: task.weeklyGoal
        ? {
            weeklyGoal: { id: task.weeklyGoal.id, title: task.weeklyGoal.title },
            oneYearGoal: task.weeklyGoal.monthlyGoal?.oneYearGoal || null,
          }
        : undefined,
    });

    return {
      tasks: todayTasks,
      overdueTasks: overdue,
      mitTask,
      mit: mitTask
        ? {
            id: mitTask.id,
            title: mitTask.title,
            category: getCategoryLabel(mitTask.weeklyGoal?.category || "OTHER"),
            estimatedMinutes: mitTask.estimatedMinutes || undefined,
            completed: mitTask.status === "COMPLETED",
            goalChain: mitTask.weeklyGoal
              ? {
                  weeklyGoal: { id: mitTask.weeklyGoal.id, title: mitTask.weeklyGoal.title },
                  oneYearGoal: mitTask.weeklyGoal.monthlyGoal?.oneYearGoal || null,
                }
              : undefined,
          }
        : undefined,
      primaryTasksFormatted: primaryTasks.map((t) => transformTask(t)),
      secondaryTasksFormatted: secondaryTasks.map((t) => transformTask(t)),
      overdueTasksFormatted: overdue.map((t) => transformTask(t, true)),
    };
  }, [allTasks, requestedDate]);

  // Handle task toggle (complete or uncomplete) - memoized with useCallback (MUST be before early return)
  const handleToggleMit = useCallback(() => {
    if (!mitTask || isCompleting || updateTask.isPending) return;

    if (mitTask.status === "COMPLETED") {
      uncompleteTask(mitTask.id);
    } else {
      completeTask(mitTask.id, true); // true = MIT, triggers confetti
    }
  }, [mitTask, isCompleting, updateTask.isPending, completeTask, uncompleteTask]);

  const handleTogglePrimary = useCallback((taskId: string) => {
    if (isCompleting || updateTask.isPending) return;

    const task = tasks.find((t) => t.id === taskId && t.priority === "PRIMARY");
    if (!task) return;

    if (task.status === "COMPLETED") {
      uncompleteTask(taskId);
    } else {
      completeTask(taskId, false);
    }
  }, [tasks, isCompleting, updateTask.isPending, completeTask, uncompleteTask]);

  const handleToggleSecondary = useCallback((taskId: string) => {
    if (isCompleting || updateTask.isPending) return;

    const task = tasks.find((t) => t.id === taskId && t.priority === "SECONDARY");
    if (!task) return;

    if (task.status === "COMPLETED") {
      uncompleteTask(taskId);
    } else {
      completeTask(taskId, false);
    }
  }, [tasks, isCompleting, updateTask.isPending, completeTask, uncompleteTask]);

  // Handle toggle for overdue tasks
  const handleToggleOverdue = useCallback((taskId: string) => {
    if (isCompleting || updateTask.isPending) return;

    const task = overdueTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === "COMPLETED") {
      uncompleteTask(taskId);
    } else {
      // Completing an overdue task - treat MIT as special
      completeTask(taskId, task.priority === "MIT");
    }
  }, [overdueTasks, isCompleting, updateTask.isPending, completeTask, uncompleteTask]);

  // Handle drag-to-promote: promote a task to MIT
  const handlePromoteToMit = useCallback(async (droppedTask: { id: string; title: string; priority: "PRIMARY" | "SECONDARY" }) => {
    if (updateTask.isPending) return;

    try {
      // If there's already an MIT, demote it to the dropped task's original priority
      if (mitTask) {
        await updateTask.mutateAsync({
          id: mitTask.id,
          priority: droppedTask.priority,
        });
      }

      // Promote the dropped task to MIT
      await updateTask.mutateAsync({
        id: droppedTask.id,
        priority: "MIT",
      });

      // Show success message
      if (mitTask) {
        toast.success(`Swapped! "${droppedTask.title}" is now your MIT`);
      } else {
        toast.success(`"${droppedTask.title}" promoted to MIT!`);
      }

      refetchTasks();
    } catch {
      toast.error("Failed to promote task");
    }
  }, [mitTask, updateTask, refetchTasks]);

  // Open create modal with specific priority
  const openCreateModal = (priority: TaskPriority) => {
    setDefaultPriority(priority);
    setIsCreateModalOpen(true);
  };

  // Open edit modal for a task
  const openEditModal = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsEditModalOpen(true);
  };

  // Loading state (after all hooks) - show skeleton
  if (tasksLoading || statsLoading) {
    return (
      <AppShell rightPanel={<StatsPanelSkeleton />}>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  // Handle AI task suggestions
  const handleOpenTaskSuggest = () => {
    if (weeklyGoals.length === 0) {
      toast.error("Create a weekly goal first to get AI task suggestions");
      return;
    }
    setIsTaskSuggestModalOpen(true);
  };

  const handleApplySuggestedTasks = async (suggestedTasks: SuggestedTask[], weeklyGoalId?: string) => {
    try {
      // Check current task limits
      const hasMit = tasks.some((t) => t.priority === "MIT");
      const primaryCount = tasks.filter((t) => t.priority === "PRIMARY").length;

      let addedCount = 0;
      let primaryAdded = primaryCount;

      // Create tasks sequentially to maintain order
      for (const task of suggestedTasks) {
        let priority = task.priority;

        // Handle priority conflicts
        if (priority === "MIT" && hasMit) {
          // Already have a MIT, try to add as PRIMARY
          if (primaryAdded < 3) {
            priority = "PRIMARY";
            primaryAdded++;
          } else {
            priority = "SECONDARY";
          }
        } else if (priority === "PRIMARY" && primaryAdded >= 3) {
          priority = "SECONDARY";
        } else if (priority === "PRIMARY") {
          primaryAdded++;
        }

        await createTask.mutateAsync({
          title: task.title,
          priority,
          scheduledDate: today,
          estimatedMinutes: task.estimated_minutes,
          weeklyGoalId,
        });
        addedCount++;
      }

      if (hasMit && suggestedTasks.some((t) => t.priority === "MIT")) {
        toast.success(`Added ${addedCount} tasks (MIT → Primary since you already have one)`);
      } else {
        toast.success(`Added ${addedCount} tasks to your day!`);
      }
      refetchTasks();
    } catch {
      toast.error("Failed to create some tasks");
    }
  };

  // Calculate stats for today's tasks
  const todayFormattedTasks = [...(mit ? [mit] : []), ...primaryTasksFormatted, ...secondaryTasksFormatted];
  const completedCount = todayFormattedTasks.filter((t) => t.completed).length;
  const pointsEarned = tasksData?.stats?.mit?.pointsEarned
    ? tasks.reduce((sum, t) => sum + t.pointsEarned, 0)
    : 0;

  // Transform stats data
  const currentLevel = LEVELS.find((l) => l.level === (statsData?.level || 1)) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === (statsData?.level || 1) + 1);

  // Get streak (MIT completion streak)
  const mitStreak = statsData?.streaks?.find((s) => s.type === "MIT_COMPLETION");

  // Transform badges
  const badges = (statsData?.badges || []).slice(0, 5).map((eb) => ({
    id: eb.badge.slug,
    icon: getBadgeIcon(eb.badge.slug),
    name: eb.badge.name,
    earned: true,
  }));

  // Check if kaizen is complete
  const kaizenCheckin = kaizenData?.checkin;
  const kaizenComplete = !!(
    kaizenCheckin &&
    (kaizenCheckin.health ||
      kaizenCheckin.relationships ||
      kaizenCheckin.wealth ||
      kaizenCheckin.career ||
      kaizenCheckin.personalGrowth ||
      kaizenCheckin.lifestyle)
  );

  // Transform kaizen areas
  const kaizenAreas = [
    { id: "health", name: "Health", icon: "💪", checked: kaizenCheckin?.health || false },
    { id: "relationships", name: "Relations", icon: "❤️", checked: kaizenCheckin?.relationships || false },
    { id: "wealth", name: "Wealth", icon: "💰", checked: kaizenCheckin?.wealth || false },
    { id: "career", name: "Career", icon: "💼", checked: kaizenCheckin?.career || false },
    { id: "personalGrowth", name: "Growth", icon: "📚", checked: kaizenCheckin?.personalGrowth || false },
    { id: "lifestyle", name: "Lifestyle", icon: "🌿", checked: kaizenCheckin?.lifestyle || false },
  ];

  // Handle kaizen save
  const handleKaizenSave = (checkedAreas: string[]) => {
    saveKaizen.mutate({
      health: checkedAreas.includes("health"),
      relationships: checkedAreas.includes("relationships"),
      wealth: checkedAreas.includes("wealth"),
      career: checkedAreas.includes("career"),
      personalGrowth: checkedAreas.includes("personalGrowth"),
      lifestyle: checkedAreas.includes("lifestyle"),
      date: today,
    });
  };

  // Calculate goal alignment (percentage of tasks linked to goals)
  const linkedTasks = tasks.filter((t) => t.weeklyGoalId).length;
  const goalAlignment = tasks.length > 0 ? Math.round((linkedTasks / tasks.length) * 100) : 0;

  // Get user's first name
  const userName = session?.user?.name?.split(" ")[0] || "there";

  const statsPanel = (
    <StatsPanel
      streak={mitStreak?.currentCount || 0}
      streakFreezes={statsData?.streakFreezes || 0}
      level={{
        name: currentLevel.name,
        currentXp: statsData?.totalPoints || 0,
        requiredXp: nextLevel?.pointsRequired || currentLevel.pointsRequired,
      }}
      today={{
        tasksCompleted: completedCount,
        tasksTotal: todayFormattedTasks.length,
        pointsEarned: statsData?.todayStats?.pointsEarned || pointsEarned,
      }}
      goalAlignment={goalAlignment}
      linkedTasks={linkedTasks}
      totalTasks={tasks.length}
      kaizenComplete={kaizenComplete}
      kaizenAreas={kaizenAreas}
      badges={badges}
      onKaizenSave={handleKaizenSave}
    />
  );

  return (
    <AppShell rightPanel={statsPanel} onRefresh={handleRefresh}>
      <PageHeader
        greeting={`${getGreeting()}, ${userName}`}
        title="Today's Focus"
        subtitle={formatDate()}
        showAiButton
        aiUsesRemaining={aiRemaining}
        aiUsesTotal={aiLimit}
        onAiClick={handleOpenTaskSuggest}
        showSettingsIcon
      />

      {/* Mobile Stats Bar - tap to see full Progress page */}
      <MobileStatsBar
        streak={mitStreak?.currentCount || 0}
        todayPoints={statsData?.todayStats?.pointsEarned || pointsEarned}
        goalAlignment={goalAlignment}
        levelName={currentLevel.name}
      />

      {/* 1-Year Target Header - The Decision Filter */}
      <YearTargetHeader
        oneYearGoal={primaryOneYearGoal}
        weeklyGoal={primaryWeeklyGoal}
        tasksCompleted={completedCount}
        tasksTotal={todayFormattedTasks.length}
        goalAlignedTasks={linkedTasks}
      />

      {/* Overdue Tasks Section - shown when there are overdue tasks */}
      {overdueTasksFormatted.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zen-red/20">
            <AlertTriangle className="w-4 h-4 text-zen-red" />
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-zen-red">
              Overdue
            </h2>
            <span className="text-xs text-zen-red/70">
              {overdueTasksFormatted.length} task{overdueTasksFormatted.length !== 1 ? "s" : ""} from previous days
            </span>
          </div>
          <div className="flex flex-col bg-zen-red/5 rounded-xl border border-zen-red/20 px-4">
            {overdueTasksFormatted.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-3 sm:gap-4 py-4 border-b border-zen-red/10 last:border-b-0"
              >
                {/* Checkbox */}
                <button
                  className="w-11 h-11 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center -ml-2 sm:-ml-1 rounded-xl transition-all duration-200 active:scale-90"
                  onClick={() => handleToggleOverdue(task.id)}
                >
                  <div className="w-6 h-6 sm:w-[22px] sm:h-[22px] rounded-lg border-2 border-zen-red/50 flex items-center justify-center transition-all duration-200" />
                </button>

                {/* Content */}
                <button className="flex-1 text-left min-w-0" onClick={() => openEditModal(task.id)}>
                  <div className="text-[0.9375rem] font-normal mb-0.5 truncate text-moon">
                    {task.title}
                  </div>
                  <div className="text-xs text-moon-faint truncate flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-zen-red flex-shrink-0" />
                    <span className="text-zen-red">{formatOverdueLabel(task.scheduledDate)}</span>
                    <span className="text-moon-faint/50">·</span>
                    {task.goalChain ? (
                      <span className="truncate">
                        {task.goalChain.weeklyGoal.title}
                        {task.goalChain.oneYearGoal && (
                          <span className="text-lantern/70"> → {task.goalChain.oneYearGoal.title}</span>
                        )}
                      </span>
                    ) : (
                      task.category
                    )}
                  </div>
                </button>

                {/* Points */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium tabular-nums text-moon-faint">
                    {task.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State - No tasks planned */}
      {tasks.length === 0 && overdueTasksFormatted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lantern/20 to-zen-green/10 border border-night-glow flex items-center justify-center mb-6 animate-pulse">
            <CalendarDays className="w-10 h-10 text-lantern" />
          </div>
          <h3 className="text-xl font-light text-moon mb-2">Ready to make progress?</h3>
          <p className="text-moon-dim text-center mb-4 max-w-sm">
            Start your day with intention. What&apos;s the ONE thing that would make today a win?
          </p>
          <p className="text-xs text-moon-faint/60 italic mb-8">
            &ldquo;Small daily improvements lead to stunning results.&rdquo;
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsPlanDayModalOpen(true)}
              variant="outline"
              className="border-night-glow text-moon hover:bg-night-soft h-12 px-6"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Plan Manually
            </Button>
            <Button
              onClick={handleOpenTaskSuggest}
              className="bg-zen-purple text-void hover:bg-zen-purple/90 h-12 px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggest Tasks
            </Button>
          </div>
        </div>
      ) : tasks.length > 0 ? (
        <>
          <MitCard
            task={mit}
            onToggle={handleToggleMit}
            onAiSuggest={handleOpenTaskSuggest}
            onDrop={handlePromoteToMit}
          />

          <TaskList
            title="Primary"
            tasks={primaryTasksFormatted}
            onTaskToggle={handleTogglePrimary}
            onTaskEdit={openEditModal}
            onAddTask={() => openCreateModal("PRIMARY")}
            draggable
          />

          <TaskList
            title="Secondary"
            tasks={secondaryTasksFormatted}
            onTaskToggle={handleToggleSecondary}
            onTaskEdit={openEditModal}
            onAddTask={() => openCreateModal("SECONDARY")}
            draggable
          />
        </>
      ) : null}

      {/* Task Create Modal */}
      <TaskCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultPriority={defaultPriority}
        scheduledDate={today}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingTaskId(null);
        }}
        task={editingTaskId ? allTasks.find((t) => t.id === editingTaskId) || null : null}
      />

      {/* Plan Your Day Modal */}
      <PlanDayModal
        open={isPlanDayModalOpen}
        onOpenChange={setIsPlanDayModalOpen}
        date={today}
        onComplete={() => refetchTasks()}
      />

      {/* AI Task Suggester Modal */}
      <TaskSuggestModal
        open={isTaskSuggestModalOpen}
        onOpenChange={setIsTaskSuggestModalOpen}
        weeklyGoals={weeklyGoals}
        onApply={handleApplySuggestedTasks}
      />

      {/* First MIT Celebration Modal */}
      <FirstMitCelebration
        open={isFirstMitCelebrationOpen}
        onOpenChange={setIsFirstMitCelebrationOpen}
        pointsEarned={firstMitPoints}
      />

      {/* Task Carry-Over Modal (End of Day) */}
      <TaskCarryOverModal
        open={isCarryOverModalOpen}
        onOpenChange={setIsCarryOverModalOpen}
        incompleteTasks={tasks
          .filter((t) => t.status !== "COMPLETED")
          .map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            category: getCategoryLabel(t.weeklyGoal?.category || "OTHER"),
          }))}
        onCarryOver={async (taskIds) => {
          await carryOverTasks.mutateAsync(taskIds);
          toast.success(`Moved ${taskIds.length} task${taskIds.length !== 1 ? "s" : ""} to tomorrow`);
          refetchTasks();
        }}
        onSkip={() => setIsCarryOverModalOpen(false)}
      />

      {/* Evening Kaizen Reflection Prompt */}
      <KaizenCheckinDialog
        open={isKaizenPromptOpen}
        onOpenChange={(open) => {
          setIsKaizenPromptOpen(open);
          if (!open) {
            // Mark as dismissed when closed (skip or complete)
            markKaizenPromptDismissed();
          }
        }}
        existingCheckin={kaizenData?.checkin || null}
        onComplete={(data) => {
          if (data.isBalancedDay) {
            toast.success("Balanced day! +35 points earned", {
              icon: "🌟",
            });
          } else if (data.pointsEarned > 0) {
            toast.success(`+${data.pointsEarned} points for reflecting`, {
              icon: "🌱",
            });
          }
        }}
      />

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        open={!!levelUpData}
        onOpenChange={(open) => {
          if (!open) setLevelUpData(null);
        }}
        previousLevel={levelUpData?.previousLevel ?? 1}
        newLevel={levelUpData?.newLevel ?? 2}
        newLevelName={levelUpData?.newLevelName ?? ""}
      />

      {/* Badge Earned Celebration Modal */}
      <BadgeEarnedModal
        open={!!earnedBadge}
        onOpenChange={(open) => {
          if (!open) setEarnedBadge(null);
        }}
        badge={earnedBadge}
      />

      {/* Floating Action Button - Mobile Quick Add */}
      <FloatingActionButton onClick={() => openCreateModal("SECONDARY")} />
    </AppShell>
  );
}

// Helper to get badge icon
function getBadgeIcon(slug: string): string {
  const icons: Record<string, string> = {
    first_blood: "⚔️",
    on_fire_7: "🔥",
    on_fire_30: "🔥",
    rockstar: "🎸",
    century_club: "💯",
    goal_getter: "🎯",
    dream_starter: "⭐",
    planner_pro: "📋",
    visionary: "👁️",
    health_nut: "💪",
    wealth_builder: "💰",
  };
  return icons[slug] || "🏆";
}

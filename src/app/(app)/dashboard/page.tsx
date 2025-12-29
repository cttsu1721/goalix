"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MitCard, TaskList, TaskCreateModal, TaskEditModal, PlanDayModal } from "@/components/tasks";
import { StatsPanel } from "@/components/gamification/StatsPanel";
import { TaskSuggestModal } from "@/components/ai";
import {
  useTasks,
  useCreateTask,
  useTaskCompletion,
  useUserStats,
  useKaizenCheckin,
  useSaveKaizenCheckin,
  useGoals,
} from "@/hooks";
import { useAIUsage } from "@/hooks/useAI";
import { LEVELS } from "@/types/gamification";
import { TASK_PRIORITY_POINTS } from "@/types/tasks";
import { Loader2, Sparkles, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TaskPriority } from "@prisma/client";
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split("T")[0];

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>("SECONDARY");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isPlanDayModalOpen, setIsPlanDayModalOpen] = useState(false);
  const [isTaskSuggestModalOpen, setIsTaskSuggestModalOpen] = useState(false);
  const [selectedWeeklyGoal, setSelectedWeeklyGoal] = useState<{
    id?: string;
    title: string;
    description?: string;
  } | null>(null);

  // Fetch data
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks(today);
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const { data: kaizenData } = useKaizenCheckin(today);
  const { data: goalsData } = useGoals("weekly");
  const { data: aiUsage } = useAIUsage();

  // Weekly goals for task suggestions
  const weeklyGoals = (goalsData?.goals || []) as Array<{ id: string; title: string; description?: string }>;
  const aiRemaining = aiUsage?.remaining ?? 5;
  const aiLimit = aiUsage?.limit ?? 5;

  // Mutations
  const { complete: completeTask, isPending: isCompleting } = useTaskCompletion();
  const saveKaizen = useSaveKaizenCheckin();
  const createTask = useCreateTask();

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

  // Loading state
  if (tasksLoading || statsLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-lantern" />
        </div>
      </AppShell>
    );
  }

  // Transform tasks data
  const tasks = tasksData?.tasks || [];
  const mitTask = tasks.find((t) => t.priority === "MIT");
  const primaryTasks = tasks.filter((t) => t.priority === "PRIMARY");
  const secondaryTasks = tasks.filter((t) => t.priority === "SECONDARY");

  // Transform MIT for component
  const mit = mitTask
    ? {
        id: mitTask.id,
        title: mitTask.title,
        category: getCategoryLabel(mitTask.weeklyGoal?.category || "OTHER"),
        estimatedMinutes: mitTask.estimatedMinutes || undefined,
        completed: mitTask.status === "COMPLETED",
      }
    : undefined;

  // Transform other tasks for component
  const transformTask = (task: (typeof tasks)[0]) => ({
    id: task.id,
    title: task.title,
    category: getCategoryLabel(task.weeklyGoal?.category || "OTHER"),
    completed: task.status === "COMPLETED",
    points: TASK_PRIORITY_POINTS[task.priority],
  });

  const primaryTasksFormatted = primaryTasks.map(transformTask);
  const secondaryTasksFormatted = secondaryTasks.map(transformTask);

  // Handle task completion
  const handleToggleMit = () => {
    if (mitTask && mitTask.status !== "COMPLETED" && !isCompleting) {
      completeTask(mitTask.id, true); // true = MIT, triggers confetti
    }
  };

  const handleTogglePrimary = (taskId: string) => {
    const task = primaryTasks.find((t) => t.id === taskId);
    if (task && task.status !== "COMPLETED" && !isCompleting) {
      completeTask(taskId, false);
    }
  };

  const handleToggleSecondary = (taskId: string) => {
    const task = secondaryTasks.find((t) => t.id === taskId);
    if (task && task.status !== "COMPLETED" && !isCompleting) {
      completeTask(taskId, false);
    }
  };

  // Handle AI task suggestions
  const handleOpenTaskSuggest = () => {
    if (weeklyGoals.length === 0) {
      toast.error("Create a weekly goal first to get AI task suggestions");
      return;
    }
    // Default to first weekly goal, user can change in modal
    const firstGoal = weeklyGoals[0];
    setSelectedWeeklyGoal({
      id: firstGoal.id,
      title: firstGoal.title,
      description: firstGoal.description,
    });
    setIsTaskSuggestModalOpen(true);
  };

  const handleApplySuggestedTasks = async (suggestedTasks: SuggestedTask[]) => {
    try {
      // Create tasks sequentially to maintain order
      for (const task of suggestedTasks) {
        await createTask.mutateAsync({
          title: task.title,
          priority: task.priority,
          scheduledDate: today,
          estimatedMinutes: task.estimated_minutes,
          weeklyGoalId: selectedWeeklyGoal?.id,
        });
      }
      toast.success(`Added ${suggestedTasks.length} tasks to your day!`);
      refetchTasks();
    } catch (error) {
      toast.error("Failed to create some tasks");
    }
  };

  // Calculate stats
  const allTasks = [...(mit ? [mit] : []), ...primaryTasksFormatted, ...secondaryTasksFormatted];
  const completedCount = allTasks.filter((t) => t.completed).length;
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
      level={{
        name: currentLevel.name,
        currentXp: statsData?.totalPoints || 0,
        requiredXp: nextLevel?.pointsRequired || currentLevel.pointsRequired,
      }}
      today={{
        tasksCompleted: completedCount,
        tasksTotal: allTasks.length,
        pointsEarned: statsData?.todayStats?.pointsEarned || pointsEarned,
      }}
      goalAlignment={goalAlignment}
      kaizenComplete={kaizenComplete}
      badges={badges}
      onKaizenSave={handleKaizenSave}
    />
  );

  return (
    <AppShell rightPanel={statsPanel}>
      <PageHeader
        greeting={`${getGreeting()}, ${userName}`}
        title="Today's Focus"
        subtitle={formatDate()}
        showAiButton
        aiUsesRemaining={aiRemaining}
        aiUsesTotal={aiLimit}
        onAiClick={handleOpenTaskSuggest}
      />

      {/* Empty State - No tasks planned */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-night-soft border border-night-glow flex items-center justify-center mb-6">
            <CalendarDays className="w-10 h-10 text-lantern" />
          </div>
          <h3 className="text-xl font-light text-moon mb-2">No tasks planned yet</h3>
          <p className="text-moon-dim text-center mb-8 max-w-sm">
            Start your day with intention. Plan your MIT and key tasks to stay focused and productive.
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
      ) : (
        <>
          <MitCard
            task={mit}
            onToggle={handleToggleMit}
            onAiSuggest={handleOpenTaskSuggest}
          />

          <TaskList
            title="Primary"
            tasks={primaryTasksFormatted}
            onTaskToggle={handleTogglePrimary}
            onTaskEdit={openEditModal}
            onAddTask={() => openCreateModal("PRIMARY")}
          />

          <TaskList
            title="Secondary"
            tasks={secondaryTasksFormatted}
            onTaskToggle={handleToggleSecondary}
            onTaskEdit={openEditModal}
            onAddTask={() => openCreateModal("SECONDARY")}
          />
        </>
      )}

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
        task={editingTaskId ? tasks.find((t) => t.id === editingTaskId) || null : null}
      />

      {/* Plan Your Day Modal */}
      <PlanDayModal
        open={isPlanDayModalOpen}
        onOpenChange={setIsPlanDayModalOpen}
        date={today}
        onComplete={() => refetchTasks()}
      />

      {/* AI Task Suggester Modal */}
      {selectedWeeklyGoal && (
        <TaskSuggestModal
          open={isTaskSuggestModalOpen}
          onOpenChange={setIsTaskSuggestModalOpen}
          weeklyGoalId={selectedWeeklyGoal.id}
          weeklyGoalTitle={selectedWeeklyGoal.title}
          weeklyGoalDescription={selectedWeeklyGoal.description}
          onApply={handleApplySuggestedTasks}
        />
      )}
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

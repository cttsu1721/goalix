// Task hooks
export {
  useTasks,
  useWeekTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useUncompleteTask,
  useCarryOverTasks,
  useRescheduleOverdue,
} from "./useTasks";

export { useTaskCompletion } from "./useTaskCompletion";

// Goal hooks
export {
  useGoals,
  useVisions,
  useDreams,
  useGoal,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useUnlinkedGoals,
  useSiblingGoals,
} from "./useGoals";

// Gamification hooks
export {
  useUserStats,
  useUserStreaks,
  useUserSettings,
  useUpdateUserSettings,
  useCategoryStats,
} from "./useGamification";

// Kaizen hooks
export {
  useKaizenCheckin,
  useKaizenCheckins,
  useSaveKaizenCheckin,
} from "./useKaizen";

// Vision Builder hook
export {
  useVisionBuilder,
  useDreamBuilder,
  type VisionBuilderStep,
  type DreamBuilderStep,
  type GoalPath,
} from "./useVisionBuilder";

// Weekly Review hook
export {
  useWeeklyReview,
  useSubmitWeeklyReview,
  formatAreaName,
  useReviewHistory,
  useAllReviewHistory,
} from "./useWeeklyReview";

// Monthly Review hook
export { useMonthlyReview, useSubmitMonthlyReview } from "./useMonthlyReview";

// Gesture hooks
export { useSwipeGesture } from "./useSwipeGesture";

// Recurring Tasks hooks
export {
  useRecurringTemplates,
  useRecurringTemplate,
  useCreateRecurringTemplate,
  useUpdateRecurringTemplate,
  useDeleteRecurringTemplate,
  useGenerateRecurringTasks,
  formatRecurrencePattern,
  type RecurringTemplateWithGoal,
  type CreateRecurringTemplateInput,
  type UpdateRecurringTemplateInput,
} from "./useRecurringTasks";

// Accessibility hooks
export { useReducedMotion, prefersReducedMotion } from "./useReducedMotion";

// Form helpers
export { useUnsavedChanges } from "./useUnsavedChanges";
export { useScrollIntoView, scrollInputIntoView, useAutoScrollForm } from "./useScrollIntoView";

// Notification hooks
export {
  useNotifications,
  isSundayEvening,
  shouldShowWeeklyNotification,
  markWeeklyNotificationShown,
} from "./useNotifications";

// Sound effects hooks
export {
  useSoundEffects,
  useCompletionFeedback,
  type SoundEffect,
} from "./useSoundEffects";

// Optimistic update hooks
export {
  useOptimisticUpdate,
  useOptimisticTaskComplete,
  useOptimisticList,
} from "./useOptimisticUpdate";

// Mobile view hooks
export {
  useMobileView,
  useViewMode,
  useDaySwipeNavigation,
  type ViewToggleProps,
} from "./useMobileView";

// Focus mode hook
export { useFocusMode } from "./useFocusMode";

// Subtask hooks
export {
  useSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  useReorderSubtasks,
  type Subtask,
} from "./useSubtasks";

// AI hooks
export {
  useAIUsage,
  useGoalSharpen,
  useTaskSuggest,
  useGoalSuggest,
  useGoalLinkSuggest,
} from "./useAI";

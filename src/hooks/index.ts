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
} from "./useGoals";

// Gamification hooks
export {
  useUserStats,
  useUserStreaks,
  useUserSettings,
  useUpdateUserSettings,
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
export { useWeeklyReview, useSubmitWeeklyReview, formatAreaName } from "./useWeeklyReview";

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

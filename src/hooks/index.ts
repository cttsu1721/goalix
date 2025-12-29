// Task hooks
export {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
} from "./useTasks";

export { useTaskCompletion } from "./useTaskCompletion";

// Goal hooks
export {
  useGoals,
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

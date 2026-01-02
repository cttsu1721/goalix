import type { TaskPriority } from "@prisma/client";

// Goal Sharpener Response Schema
export interface GoalSharpenResponse {
  sharpened_title: string;
  description: string;
  measurable_outcomes: string[];
  suggested_timeframe: string;
  first_step: string;
}

// Task Suggester Response Schema
export interface SuggestedTask {
  title: string;
  priority: TaskPriority;
  estimated_minutes: number;
  reasoning: string;
  sequence: number;
}

export interface TaskSuggestResponse {
  tasks: SuggestedTask[];
  mit_rationale: string;
}

// Task Suggester with Context Response Schema
export interface TaskSuggestWithContextResponse {
  tasks: SuggestedTask[];
  mit_rationale: string;
  alignment_insight: string;
}

// Goal Suggester Response Schema
export interface SuggestedGoal {
  title: string;
  description: string;
  reasoning: string;
  priority: number;
}

export interface GoalSuggestResponse {
  suggestions: SuggestedGoal[];
  strategy_note: string;
}

// Vision Builder Response Schema
export interface VisionBuilderGoal {
  title: string;
  description: string;
}

export type VisionBuilderWeeklyGoal = VisionBuilderGoal;

export interface VisionBuilderMonthlyGoal extends VisionBuilderGoal {
  weeklyGoal: VisionBuilderWeeklyGoal;
}

export interface VisionBuilderOneYearGoal extends VisionBuilderGoal {
  monthlyGoal: VisionBuilderMonthlyGoal;
}

export interface VisionBuilderThreeYearGoal extends VisionBuilderGoal {
  oneYearGoals: VisionBuilderOneYearGoal[];
}

export interface VisionBuilderResponse {
  vision: VisionBuilderGoal;
  threeYearGoals: VisionBuilderThreeYearGoal[];
  strategyNote: string;
}

// Backward compatibility aliases
export type DreamBuilderGoal = VisionBuilderGoal;
export type DreamBuilderWeeklyGoal = VisionBuilderWeeklyGoal;
export type DreamBuilderMonthlyGoal = VisionBuilderMonthlyGoal;
export type DreamBuilderOneYearGoal = VisionBuilderOneYearGoal;
export type DreamBuilderFiveYearGoal = VisionBuilderThreeYearGoal;
export type DreamBuilderResponse = VisionBuilderResponse;

// AI Interaction Types
export type AIInteractionType = "GOAL_SHARPEN" | "TASK_SUGGEST" | "GOAL_SUGGEST" | "VISION_BUILD";

// Rate limit configuration
export const AI_RATE_LIMITS = {
  // Free tier: 5 AI interactions per day
  freeLimit: 5,
  // Reset at midnight (user's timezone)
  resetInterval: "daily",
} as const;

// Validation helpers
export function validateGoalSharpenResponse(data: unknown): data is GoalSharpenResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.sharpened_title === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.measurable_outcomes) &&
    obj.measurable_outcomes.every((o) => typeof o === "string") &&
    typeof obj.suggested_timeframe === "string" &&
    typeof obj.first_step === "string"
  );
}

export function validateTaskSuggestResponse(data: unknown): data is TaskSuggestResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.tasks) || typeof obj.mit_rationale !== "string") {
    return false;
  }

  return obj.tasks.every((task: unknown) => {
    if (!task || typeof task !== "object") return false;
    const t = task as Record<string, unknown>;

    return (
      typeof t.title === "string" &&
      ["MIT", "PRIMARY", "SECONDARY"].includes(t.priority as string) &&
      typeof t.estimated_minutes === "number" &&
      typeof t.reasoning === "string" &&
      typeof t.sequence === "number"
    );
  });
}

export function validateTaskSuggestWithContextResponse(
  data: unknown
): data is TaskSuggestWithContextResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (
    !Array.isArray(obj.tasks) ||
    typeof obj.mit_rationale !== "string" ||
    typeof obj.alignment_insight !== "string"
  ) {
    return false;
  }

  return obj.tasks.every((task: unknown) => {
    if (!task || typeof task !== "object") return false;
    const t = task as Record<string, unknown>;

    return (
      typeof t.title === "string" &&
      ["MIT", "PRIMARY", "SECONDARY"].includes(t.priority as string) &&
      typeof t.estimated_minutes === "number" &&
      typeof t.reasoning === "string" &&
      typeof t.sequence === "number"
    );
  });
}

export function validateGoalSuggestResponse(data: unknown): data is GoalSuggestResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.suggestions) || typeof obj.strategy_note !== "string") {
    return false;
  }

  return obj.suggestions.every((suggestion: unknown) => {
    if (!suggestion || typeof suggestion !== "object") return false;
    const s = suggestion as Record<string, unknown>;

    return (
      typeof s.title === "string" &&
      typeof s.description === "string" &&
      typeof s.reasoning === "string" &&
      typeof s.priority === "number"
    );
  });
}

export function validateVisionBuilderResponse(data: unknown): data is VisionBuilderResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  // Validate vision
  if (!obj.vision || typeof obj.vision !== "object") return false;
  const vision = obj.vision as Record<string, unknown>;
  if (typeof vision.title !== "string" || typeof vision.description !== "string") return false;

  // Validate strategyNote
  if (typeof obj.strategyNote !== "string") return false;

  // Validate threeYearGoals array
  if (!Array.isArray(obj.threeYearGoals) || obj.threeYearGoals.length === 0) return false;

  return obj.threeYearGoals.every((threeYear: unknown) => {
    if (!threeYear || typeof threeYear !== "object") return false;
    const ty = threeYear as Record<string, unknown>;
    if (typeof ty.title !== "string" || typeof ty.description !== "string") return false;

    // Validate oneYearGoals array
    if (!Array.isArray(ty.oneYearGoals) || ty.oneYearGoals.length === 0) return false;

    return ty.oneYearGoals.every((oneYear: unknown) => {
      if (!oneYear || typeof oneYear !== "object") return false;
      const oy = oneYear as Record<string, unknown>;
      if (typeof oy.title !== "string" || typeof oy.description !== "string") return false;

      // Validate monthlyGoal
      if (!oy.monthlyGoal || typeof oy.monthlyGoal !== "object") return false;
      const mg = oy.monthlyGoal as Record<string, unknown>;
      if (typeof mg.title !== "string" || typeof mg.description !== "string") return false;

      // Validate weeklyGoal
      if (!mg.weeklyGoal || typeof mg.weeklyGoal !== "object") return false;
      const wg = mg.weeklyGoal as Record<string, unknown>;
      if (typeof wg.title !== "string" || typeof wg.description !== "string") return false;

      return true;
    });
  });
}

// Backward compatibility alias
export const validateDreamBuilderResponse = validateVisionBuilderResponse;

// Parse JSON from AI response (handles markdown code blocks)
export function parseAIResponse<T>(text: string): T {
  // Remove markdown code blocks if present
  let jsonStr = text.trim();

  // Handle ```json ... ``` blocks
  const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    jsonStr = jsonBlockMatch[1].trim();
  }

  return JSON.parse(jsonStr);
}

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

// AI Interaction Types
export type AIInteractionType = "GOAL_SHARPEN" | "TASK_SUGGEST" | "GOAL_SUGGEST";

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

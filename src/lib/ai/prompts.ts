// Goal Sharpener System Prompt
export const GOAL_SHARPENER_PROMPT = `You are an expert goal-setting coach specializing in the SMART framework. Your role is to transform vague goals into specific, measurable, achievable, relevant, and time-bound objectives.

When given a goal, you will:
1. Analyze the intent behind the goal
2. Make it more specific and actionable
3. Add measurable success criteria
4. Ensure it's realistic yet challenging
5. Suggest a clear timeframe if not specified

Your response must be in JSON format with the following structure:
{
  "sharpened_title": "A concise, action-oriented goal title (max 100 characters)",
  "description": "A detailed description with clear success criteria (2-3 sentences)",
  "measurable_outcomes": ["Specific measurable outcome 1", "Specific measurable outcome 2", "Specific measurable outcome 3"],
  "suggested_timeframe": "e.g., '6 months', '1 year', '90 days'",
  "first_step": "The immediate next action to start working on this goal"
}

Guidelines:
- Keep the essence of the original goal intact
- Use action verbs (achieve, complete, build, create, etc.)
- Include specific numbers or metrics where possible
- Make outcomes observable and verifiable
- The first step should be completable within 24-48 hours
- Be encouraging but realistic`;

// Task Suggester System Prompt
export const TASK_SUGGESTER_PROMPT = `You are a productivity expert helping break down weekly goals into actionable daily tasks. Your role is to suggest a prioritized list of tasks that will help achieve the weekly goal.

When given a weekly goal, you will:
1. Identify the key activities needed to achieve the goal
2. Prioritize them by impact (MIT > PRIMARY > SECONDARY)
3. Estimate realistic time for each task
4. Explain why each task matters

Your response must be in JSON format with the following structure:
{
  "tasks": [
    {
      "title": "Clear, actionable task description (max 100 characters)",
      "priority": "MIT" | "PRIMARY" | "SECONDARY",
      "estimated_minutes": 30,
      "reasoning": "Brief explanation of why this task is important",
      "sequence": 1
    }
  ],
  "mit_rationale": "Explanation of why the MIT task is the most important for achieving the weekly goal"
}

Priority Guidelines:
- MIT (Most Important Task): The single task that will have the biggest impact. Only ONE task should be MIT.
- PRIMARY: Core tasks that directly contribute to the goal. Maximum 3 PRIMARY tasks.
- SECONDARY: Supporting tasks that help but aren't critical. These can be unlimited.

Task Guidelines:
- Each task should be completable in one sitting (15-120 minutes)
- Use clear action verbs (Write, Review, Create, Schedule, etc.)
- Be specific about what needs to be done
- Consider dependencies between tasks
- Suggest 4-7 tasks total`;

// Goal Suggester System Prompt - for cascading goal suggestions
export const GOAL_SUGGESTER_PROMPT = `You are an expert goal strategist specializing in MJ DeMarco's 1/5/10 goal methodology. Your role is to suggest meaningful goals that cascade down from higher-level visions to actionable objectives.

The 1/5/10 Hierarchy:
- 10-Year Dream: The ultimate vision (wealth, lifestyle, impact)
- 5-Year Goal: Major milestone toward the dream
- 1-Year Goal: Annual objective toward 5-year goals
- Monthly Goal: Monthly target toward 1-year goals
- Weekly Goal: Weekly focus toward monthly goals

When suggesting goals, you will:
1. Analyze the parent goal's intent and desired outcome
2. Identify 3-5 actionable sub-goals that directly contribute to achieving the parent
3. Ensure each suggestion is specific, measurable, and time-appropriate
4. Consider the category and maintain alignment
5. Make suggestions challenging yet achievable

Your response must be in JSON format with the following structure:
{
  "suggestions": [
    {
      "title": "Clear, actionable goal title (max 100 characters)",
      "description": "2-3 sentence description with success criteria",
      "reasoning": "Why this goal helps achieve the parent goal",
      "priority": 1
    }
  ],
  "strategy_note": "Brief explanation of how these goals collectively contribute to the parent goal"
}

Guidelines:
- Each goal should be a meaningful step toward the parent goal
- Use action verbs (Build, Launch, Achieve, Complete, etc.)
- Include measurable outcomes where possible
- Consider dependencies and logical sequencing
- Suggestions should be diverse but complementary
- For dreams (no parent), suggest inspiring 10-year visions based on the category`;

// Task Suggester System Prompt with cascading context
export const TASK_SUGGESTER_WITH_CONTEXT_PROMPT = `You are a productivity expert helping break down goals into actionable daily tasks. Your role is to suggest prioritized tasks that align with the entire goal hierarchy.

You will be given:
1. The immediate weekly goal (what needs to be accomplished this week)
2. The cascading context (monthly → yearly → 5-year → dream)

Your response must be in JSON format with the following structure:
{
  "tasks": [
    {
      "title": "Clear, actionable task description (max 100 characters)",
      "priority": "MIT" | "PRIMARY" | "SECONDARY",
      "estimated_minutes": 30,
      "reasoning": "Brief explanation connecting this task to the goal hierarchy",
      "sequence": 1
    }
  ],
  "mit_rationale": "Explanation of why the MIT task is the highest-leverage action toward the bigger vision",
  "alignment_insight": "How these daily actions connect to the long-term dream"
}

Priority Guidelines:
- MIT (Most Important Task): The single highest-leverage task. Only ONE MIT.
- PRIMARY: Core tasks that directly move the needle. Maximum 3.
- SECONDARY: Supporting tasks that help but aren't critical.

Task Guidelines:
- Each task should be completable in one sitting (15-120 minutes)
- Prioritize tasks that have compound effects on the goal hierarchy
- Consider the "Decision Compass" - every task should pass the filter: "Does this move me toward my 1-Year Target?"
- Suggest 4-7 tasks total`;

// User message templates
export function createGoalSharpenMessage(
  goalTitle: string,
  context?: string,
  category?: string
): string {
  let message = `Please sharpen this goal: "${goalTitle}"`;

  if (category) {
    message += `\n\nCategory: ${category}`;
  }

  if (context) {
    message += `\n\nAdditional context: ${context}`;
  }

  return message;
}

export function createTaskSuggestMessage(
  weeklyGoalTitle: string,
  weeklyGoalDescription?: string,
  parentGoalTitle?: string,
  cascadingContext?: CascadingContext
): string {
  let message = `Please suggest daily tasks for this weekly goal: "${weeklyGoalTitle}"`;

  if (weeklyGoalDescription) {
    message += `\n\nGoal description: ${weeklyGoalDescription}`;
  }

  if (parentGoalTitle) {
    message += `\n\nThis weekly goal is part of the larger goal: "${parentGoalTitle}"`;
  }

  // Add full cascading context if available
  if (cascadingContext) {
    message += `\n\n## Full Goal Hierarchy Context`;

    if (cascadingContext.dream) {
      message += `\n\n### 10-Year Dream (ultimate vision)\n"${cascadingContext.dream.title}"`;
      if (cascadingContext.dream.description) {
        message += `\n${cascadingContext.dream.description}`;
      }
    }

    if (cascadingContext.fiveYear) {
      message += `\n\n### 5-Year Goal\n"${cascadingContext.fiveYear.title}"`;
      if (cascadingContext.fiveYear.description) {
        message += `\n${cascadingContext.fiveYear.description}`;
      }
    }

    if (cascadingContext.oneYear) {
      message += `\n\n### 1-Year Goal\n"${cascadingContext.oneYear.title}"`;
      if (cascadingContext.oneYear.description) {
        message += `\n${cascadingContext.oneYear.description}`;
      }
    }

    if (cascadingContext.monthly) {
      message += `\n\n### Monthly Goal (immediate parent)\n"${cascadingContext.monthly.title}"`;
      if (cascadingContext.monthly.description) {
        message += `\n${cascadingContext.monthly.description}`;
      }
    }

    message += `\n\nSuggest tasks that not only complete the weekly goal but also move the needle on the larger vision.`;
  }

  return message;
}

// Cascading context for goal hierarchy
export interface CascadingContext {
  dream?: { title: string; description?: string };
  fiveYear?: { title: string; description?: string };
  oneYear?: { title: string; description?: string };
  monthly?: { title: string; description?: string };
  weekly?: { title: string; description?: string };
}

export type GoalLevelForSuggestion = "dream" | "fiveYear" | "oneYear" | "monthly" | "weekly";

export function createGoalSuggestMessage(
  level: GoalLevelForSuggestion,
  category: string,
  parentGoal?: { title: string; description?: string },
  cascadingContext?: CascadingContext
): string {
  const levelLabels: Record<GoalLevelForSuggestion, string> = {
    dream: "10-Year Dream",
    fiveYear: "5-Year Goal",
    oneYear: "1-Year Goal",
    monthly: "Monthly Goal",
    weekly: "Weekly Goal",
  };

  let message = `Please suggest ${levelLabels[level]}s for the category: ${category}`;

  if (parentGoal) {
    message += `\n\n## Parent Goal\nTitle: "${parentGoal.title}"`;
    if (parentGoal.description) {
      message += `\nDescription: ${parentGoal.description}`;
    }
  }

  if (cascadingContext) {
    message += `\n\n## Full Goal Hierarchy Context`;

    if (cascadingContext.dream) {
      message += `\n\n### 10-Year Dream\n"${cascadingContext.dream.title}"`;
      if (cascadingContext.dream.description) {
        message += `\n${cascadingContext.dream.description}`;
      }
    }

    if (cascadingContext.fiveYear) {
      message += `\n\n### 5-Year Goal\n"${cascadingContext.fiveYear.title}"`;
      if (cascadingContext.fiveYear.description) {
        message += `\n${cascadingContext.fiveYear.description}`;
      }
    }

    if (cascadingContext.oneYear) {
      message += `\n\n### 1-Year Goal\n"${cascadingContext.oneYear.title}"`;
      if (cascadingContext.oneYear.description) {
        message += `\n${cascadingContext.oneYear.description}`;
      }
    }

    if (cascadingContext.monthly) {
      message += `\n\n### Monthly Goal\n"${cascadingContext.monthly.title}"`;
      if (cascadingContext.monthly.description) {
        message += `\n${cascadingContext.monthly.description}`;
      }
    }
  }

  message += `\n\nPlease suggest 3-5 ${levelLabels[level]}s that will help achieve the parent goal and align with the broader vision.`;

  return message;
}

export function createTaskSuggestWithContextMessage(
  weeklyGoal: { title: string; description?: string },
  cascadingContext?: CascadingContext
): string {
  let message = `Please suggest daily tasks for this weekly goal:\n\n"${weeklyGoal.title}"`;

  if (weeklyGoal.description) {
    message += `\nDescription: ${weeklyGoal.description}`;
  }

  if (cascadingContext) {
    message += `\n\n## Goal Hierarchy Context`;

    if (cascadingContext.monthly) {
      message += `\n\n### Monthly Goal (immediate parent)\n"${cascadingContext.monthly.title}"`;
    }

    if (cascadingContext.oneYear) {
      message += `\n\n### 1-Year Goal\n"${cascadingContext.oneYear.title}"`;
    }

    if (cascadingContext.fiveYear) {
      message += `\n\n### 5-Year Goal\n"${cascadingContext.fiveYear.title}"`;
    }

    if (cascadingContext.dream) {
      message += `\n\n### 10-Year Dream (ultimate vision)\n"${cascadingContext.dream.title}"`;
    }
  }

  message += `\n\nSuggest tasks that not only complete the weekly goal but also move the needle on the larger vision.`;

  return message;
}

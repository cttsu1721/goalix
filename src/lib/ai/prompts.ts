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
5. AVOID suggesting tasks that duplicate or closely overlap with existing tasks

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
- Suggest 4-7 tasks total
- IMPORTANT: If existing tasks are provided, DO NOT suggest similar or duplicate tasks. Build upon what's already planned.`;

// Goal Suggester System Prompt - for cascading goal suggestions
export const GOAL_SUGGESTER_PROMPT = `You are an expert goal strategist. Your role is to suggest meaningful goals that cascade down from higher-level visions to actionable objectives.

The Goal Hierarchy:
- 7-Year Vision: The ultimate vision (wealth, lifestyle, impact)
- 3-Year Goal: Major milestone toward the vision
- 1-Year Goal: Annual objective toward 3-year goals
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
- For visions (no parent), suggest inspiring 7-year visions based on the category`;

// Task Suggester System Prompt with cascading context
export const TASK_SUGGESTER_WITH_CONTEXT_PROMPT = `You are a productivity expert helping break down goals into actionable daily tasks. Your role is to suggest prioritized tasks that align with the entire goal hierarchy.

You will be given:
1. The immediate weekly goal (what needs to be accomplished this week)
2. The cascading context (monthly → yearly → 3-year → vision)

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
  "alignment_insight": "How these daily actions connect to the long-term vision"
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

// Existing task context for context-aware suggestions
export interface ExistingTaskContext {
  title: string;
  priority: "MIT" | "PRIMARY" | "SECONDARY";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
}

export function createTaskSuggestMessage(
  weeklyGoalTitle: string,
  weeklyGoalDescription?: string,
  parentGoalTitle?: string,
  cascadingContext?: CascadingContext,
  existingTasks?: ExistingTaskContext[]
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

    if (cascadingContext.sevenYear) {
      message += `\n\n### 7-Year Vision (ultimate vision)\n"${cascadingContext.sevenYear.title}"`;
      if (cascadingContext.sevenYear.description) {
        message += `\n${cascadingContext.sevenYear.description}`;
      }
    }

    if (cascadingContext.threeYear) {
      message += `\n\n### 3-Year Goal\n"${cascadingContext.threeYear.title}"`;
      if (cascadingContext.threeYear.description) {
        message += `\n${cascadingContext.threeYear.description}`;
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

  // Add existing tasks context
  if (existingTasks && existingTasks.length > 0) {
    message += `\n\n## Existing Tasks (DO NOT duplicate these)`;

    const pendingTasks = existingTasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS");
    const completedTasks = existingTasks.filter(t => t.status === "COMPLETED");

    if (pendingTasks.length > 0) {
      message += `\n\n### Pending/In Progress Tasks:`;
      pendingTasks.forEach(task => {
        message += `\n- [${task.priority}] ${task.title}`;
      });
    }

    if (completedTasks.length > 0) {
      message += `\n\n### Already Completed:`;
      completedTasks.forEach(task => {
        message += `\n- ✓ ${task.title}`;
      });
    }

    message += `\n\nIMPORTANT: Suggest NEW tasks that complement (not duplicate) the existing ones. Focus on gaps or next logical steps.`;
  }

  return message;
}

// Cascading context for goal hierarchy
export interface CascadingContext {
  sevenYear?: { title: string; description?: string };
  threeYear?: { title: string; description?: string };
  oneYear?: { title: string; description?: string };
  monthly?: { title: string; description?: string };
  weekly?: { title: string; description?: string };
}

export type GoalLevelForSuggestion = "sevenYear" | "threeYear" | "oneYear" | "monthly" | "weekly";

export function createGoalSuggestMessage(
  level: GoalLevelForSuggestion,
  category: string,
  parentGoal?: { title: string; description?: string },
  cascadingContext?: CascadingContext
): string {
  const levelLabels: Record<GoalLevelForSuggestion, string> = {
    sevenYear: "7-Year Vision",
    threeYear: "3-Year Goal",
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

    if (cascadingContext.sevenYear) {
      message += `\n\n### 7-Year Vision\n"${cascadingContext.sevenYear.title}"`;
      if (cascadingContext.sevenYear.description) {
        message += `\n${cascadingContext.sevenYear.description}`;
      }
    }

    if (cascadingContext.threeYear) {
      message += `\n\n### 3-Year Goal\n"${cascadingContext.threeYear.title}"`;
      if (cascadingContext.threeYear.description) {
        message += `\n${cascadingContext.threeYear.description}`;
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

    if (cascadingContext.threeYear) {
      message += `\n\n### 3-Year Goal\n"${cascadingContext.threeYear.title}"`;
    }

    if (cascadingContext.sevenYear) {
      message += `\n\n### 7-Year Vision (ultimate vision)\n"${cascadingContext.sevenYear.title}"`;
    }
  }

  message += `\n\nSuggest tasks that not only complete the weekly goal but also move the needle on the larger vision.`;

  return message;
}

// Vision Builder System Prompt - generates complete goal hierarchy from user's vision
export const VISION_BUILDER_PROMPT = `You are an expert goal architect. Your role is to transform a user's rough vision into a complete, actionable goal hierarchy.

The Goal Hierarchy:
- 7-Year Vision: The ultimate vision (wealth, lifestyle, impact, freedom)
- 3-Year Goal: Major milestones toward the vision (2-3 goals)
- 1-Year Goal: Annual objectives toward each 3-year goal (2 per 3-year)
- Monthly Goal: This month's targets toward 1-year goals (1 per 1-year)
- Weekly Goal: This week's focus toward monthly goals (1 per monthly)

Given a user's rough vision idea and category, you will:
1. Refine their vision into a compelling 7-year goal
2. Break it down into 2-3 strategic 3-year milestones
3. For each 3-year goal, create 2 focused 1-year objectives
4. For each 1-year goal, create 1 monthly goal for this month
5. For each monthly goal, create 1 weekly goal for this week

Your response must be in JSON format with the following structure:
{
  "vision": {
    "title": "Compelling 7-year vision title (max 100 characters)",
    "description": "2-3 sentences describing the ultimate outcome and why it matters"
  },
  "threeYearGoals": [
    {
      "title": "3-year milestone title",
      "description": "What success looks like at year 3",
      "oneYearGoals": [
        {
          "title": "1-year objective title",
          "description": "What to achieve this year toward the 3-year goal",
          "monthlyGoal": {
            "title": "This month's target",
            "description": "Specific outcome for this month",
            "weeklyGoal": {
              "title": "This week's focus",
              "description": "What to accomplish this week"
            }
          }
        }
      ]
    }
  ],
  "strategyNote": "Brief explanation of how this hierarchy works together as a system"
}

Guidelines:
- Vision should be inspiring but achievable (7-year horizon allows for significant change)
- 3-year goals should be major milestones that prove progress toward the vision
- 1-year goals should be stretch goals but realistic
- Monthly goals should be concrete and measurable
- Weekly goals should be immediately actionable (start this week)
- All goals should align with the specified category
- Use action verbs (Build, Launch, Achieve, Create, Establish, etc.)
- Include specific metrics where appropriate
- Each level should logically cascade from its parent
- The entire system should feel cohesive and motivating`;

export function createVisionBuilderMessage(
  idea: string,
  category: string,
  currentDate?: Date
): string {
  const now = currentDate || new Date();
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday of current week
  const weekLabel = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  let message = `## Vision Idea\n"${idea}"\n\n`;
  message += `## Category\n${category}\n\n`;
  message += `## Current Timeframe\n`;
  message += `- Current Month: ${monthName}\n`;
  message += `- Current Week: ${weekLabel}\n\n`;
  message += `Please create a complete goal hierarchy from this vision. `;
  message += `Generate 2-3 three-year goals, each with 2 one-year goals, and cascade down to monthly and weekly goals for the current timeframe.`;

  return message;
}

// Keep old names as aliases for backward compatibility during migration
export const DREAM_BUILDER_PROMPT = VISION_BUILDER_PROMPT;
export const createDreamBuilderMessage = createVisionBuilderMessage;

// Goal Link Suggestion Prompt - suggests which goal to link a task to
export const GOAL_LINK_SUGGEST_PROMPT = `You are an expert at matching tasks to goals. Given a task title and a list of available weekly goals, suggest which goal the task best aligns with.

Your response must be in JSON format:
{
  "suggestion": {
    "goalId": "the_goal_id",
    "goalTitle": "the_goal_title",
    "confidence": "high" | "medium" | "low",
    "reasoning": "Brief explanation of why this task aligns with this goal"
  } | null,
  "alternatives": [
    {
      "goalId": "alternative_goal_id",
      "goalTitle": "alternative_goal_title",
      "confidence": "medium" | "low",
      "reasoning": "Why this could also be a match"
    }
  ]
}

Guidelines:
- Return null for suggestion if no goal is a good match (task seems unrelated to any goal)
- "high" confidence: Task clearly and directly contributes to the goal
- "medium" confidence: Task is related but the connection is indirect
- "low" confidence: Task might be tangentially related
- Include 0-2 alternatives if there are other plausible matches
- Consider both explicit keywords and semantic meaning
- Focus on action alignment (does completing this task advance the goal?)`;

export interface GoalForLinking {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

export function createGoalLinkSuggestMessage(
  taskTitle: string,
  availableGoals: GoalForLinking[]
): string {
  let message = `## Task to Link\n"${taskTitle}"\n\n`;
  message += `## Available Weekly Goals\n`;

  availableGoals.forEach((goal, index) => {
    message += `\n${index + 1}. **ID:** ${goal.id}\n`;
    message += `   **Title:** "${goal.title}"`;
    if (goal.description) {
      message += `\n   **Description:** ${goal.description}`;
    }
    if (goal.category) {
      message += `\n   **Category:** ${goal.category}`;
    }
  });

  message += `\n\nWhich goal does this task best align with? Respond with the goal ID, title, confidence level, and reasoning.`;

  return message;
}

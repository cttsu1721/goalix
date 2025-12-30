import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAIRateLimit } from "@/lib/redis";
import {
  anthropic,
  AI_CONFIG,
  GOAL_SUGGESTER_PROMPT,
  createGoalSuggestMessage,
  parseAIResponse,
  validateGoalSuggestResponse,
  type GoalSuggestResponse,
  type CascadingContext,
  type GoalLevelForSuggestion,
} from "@/lib/ai";

// Helper to fetch cascading context from a parent goal
async function fetchCascadingContext(
  parentId: string,
  parentLevel: GoalLevelForSuggestion
): Promise<CascadingContext> {
  const context: CascadingContext = {};

  switch (parentLevel) {
    case "dream": {
      const dream = await prisma.dream.findUnique({
        where: { id: parentId },
        select: { title: true, description: true },
      });
      if (dream) context.dream = { title: dream.title, description: dream.description || undefined };
      break;
    }

    case "fiveYear": {
      const fiveYear = await prisma.fiveYearGoal.findUnique({
        where: { id: parentId },
        select: {
          title: true,
          description: true,
          dream: { select: { title: true, description: true } },
        },
      });
      if (fiveYear) {
        context.fiveYear = { title: fiveYear.title, description: fiveYear.description || undefined };
        if (fiveYear.dream) context.dream = { title: fiveYear.dream.title, description: fiveYear.dream.description || undefined };
      }
      break;
    }

    case "oneYear": {
      const oneYear = await prisma.oneYearGoal.findUnique({
        where: { id: parentId },
        select: {
          title: true,
          description: true,
          fiveYearGoal: {
            select: {
              title: true,
              description: true,
              dream: { select: { title: true, description: true } },
            },
          },
        },
      });
      if (oneYear) {
        context.oneYear = { title: oneYear.title, description: oneYear.description || undefined };
        if (oneYear.fiveYearGoal) {
          context.fiveYear = { title: oneYear.fiveYearGoal.title, description: oneYear.fiveYearGoal.description || undefined };
          if (oneYear.fiveYearGoal.dream) {
            context.dream = { title: oneYear.fiveYearGoal.dream.title, description: oneYear.fiveYearGoal.dream.description || undefined };
          }
        }
      }
      break;
    }

    case "monthly": {
      const monthly = await prisma.monthlyGoal.findUnique({
        where: { id: parentId },
        select: {
          title: true,
          description: true,
          oneYearGoal: {
            select: {
              title: true,
              description: true,
              fiveYearGoal: {
                select: {
                  title: true,
                  description: true,
                  dream: { select: { title: true, description: true } },
                },
              },
            },
          },
        },
      });
      if (monthly) {
        context.monthly = { title: monthly.title, description: monthly.description || undefined };
        if (monthly.oneYearGoal) {
          context.oneYear = { title: monthly.oneYearGoal.title, description: monthly.oneYearGoal.description || undefined };
          if (monthly.oneYearGoal.fiveYearGoal) {
            context.fiveYear = { title: monthly.oneYearGoal.fiveYearGoal.title, description: monthly.oneYearGoal.fiveYearGoal.description || undefined };
            if (monthly.oneYearGoal.fiveYearGoal.dream) {
              context.dream = { title: monthly.oneYearGoal.fiveYearGoal.dream.title, description: monthly.oneYearGoal.fiveYearGoal.dream.description || undefined };
            }
          }
        }
      }
      break;
    }

    case "weekly": {
      const weekly = await prisma.weeklyGoal.findUnique({
        where: { id: parentId },
        select: {
          title: true,
          description: true,
          monthlyGoal: {
            select: {
              title: true,
              description: true,
              oneYearGoal: {
                select: {
                  title: true,
                  description: true,
                  fiveYearGoal: {
                    select: {
                      title: true,
                      description: true,
                      dream: { select: { title: true, description: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (weekly) {
        context.weekly = { title: weekly.title, description: weekly.description || undefined };
        if (weekly.monthlyGoal) {
          context.monthly = { title: weekly.monthlyGoal.title, description: weekly.monthlyGoal.description || undefined };
          if (weekly.monthlyGoal.oneYearGoal) {
            context.oneYear = { title: weekly.monthlyGoal.oneYearGoal.title, description: weekly.monthlyGoal.oneYearGoal.description || undefined };
            if (weekly.monthlyGoal.oneYearGoal.fiveYearGoal) {
              context.fiveYear = { title: weekly.monthlyGoal.oneYearGoal.fiveYearGoal.title, description: weekly.monthlyGoal.oneYearGoal.fiveYearGoal.description || undefined };
              if (weekly.monthlyGoal.oneYearGoal.fiveYearGoal.dream) {
                context.dream = { title: weekly.monthlyGoal.oneYearGoal.fiveYearGoal.dream.title, description: weekly.monthlyGoal.oneYearGoal.fiveYearGoal.dream.description || undefined };
              }
            }
          }
        }
      }
      break;
    }
  }

  return context;
}

// POST /api/ai/suggest-goal - Suggest goals based on cascading context
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { level, category, parentId, parentLevel } = await request.json();

    // Validate required fields
    if (!level || !category) {
      return NextResponse.json(
        { error: "Level and category are required" },
        { status: 400 }
      );
    }

    const validLevels: GoalLevelForSuggestion[] = ["dream", "fiveYear", "oneYear", "monthly", "weekly"];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid goal level" },
        { status: 400 }
      );
    }

    // Check rate limit using Redis
    const rateLimit = await checkAIRateLimit(session.user.id, session.user.email || undefined);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Daily AI limit reached",
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
        },
        { status: 429 }
      );
    }

    // Fetch cascading context if parent is provided
    let cascadingContext: CascadingContext | undefined;
    let parentGoal: { title: string; description?: string } | undefined;

    if (parentId && parentLevel) {
      cascadingContext = await fetchCascadingContext(parentId, parentLevel);

      // Set the parent goal based on level
      switch (parentLevel) {
        case "dream":
          parentGoal = cascadingContext.dream;
          break;
        case "fiveYear":
          parentGoal = cascadingContext.fiveYear;
          break;
        case "oneYear":
          parentGoal = cascadingContext.oneYear;
          break;
        case "monthly":
          parentGoal = cascadingContext.monthly;
          break;
        case "weekly":
          parentGoal = cascadingContext.weekly;
          break;
      }
    }

    // Create the user message with context
    const userMessage = createGoalSuggestMessage(
      level,
      category,
      parentGoal,
      cascadingContext
    );

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      system: GOAL_SUGGESTER_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse and validate response
    const result = parseAIResponse<GoalSuggestResponse>(textContent.text);

    if (!validateGoalSuggestResponse(result)) {
      throw new Error("Invalid AI response format");
    }

    // Log the interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.user.id,
        type: "GOAL_SUGGEST",
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        prompt: userMessage,
        response: JSON.stringify(result),
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      usage: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
      },
    });
  } catch (error) {
    console.error("Error in goal suggest:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to suggest goals" },
      { status: 500 }
    );
  }
}

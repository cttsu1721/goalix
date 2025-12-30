import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAIRateLimit } from "@/lib/redis";
import {
  anthropic,
  AI_CONFIG,
  TASK_SUGGESTER_PROMPT,
  createTaskSuggestMessage,
  parseAIResponse,
  validateTaskSuggestResponse,
  type TaskSuggestResponse,
  type CascadingContext,
} from "@/lib/ai";

// POST /api/ai/suggest - Suggest tasks for a weekly goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weeklyGoalId, weeklyGoalTitle, weeklyGoalDescription, parentGoalTitle } =
      await request.json();

    // Either weeklyGoalId or weeklyGoalTitle is required
    if (!weeklyGoalId && !weeklyGoalTitle) {
      return NextResponse.json(
        { error: "Weekly goal ID or title is required" },
        { status: 400 }
      );
    }

    // Check rate limit using Redis (fast, no DB query)
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

    // If weeklyGoalId provided, fetch the goal details with full cascading context
    let goalTitle = weeklyGoalTitle;
    let goalDescription = weeklyGoalDescription;
    let parentTitle = parentGoalTitle;
    let cascadingContext: CascadingContext | undefined;

    if (weeklyGoalId) {
      const weeklyGoal = await prisma.weeklyGoal.findUnique({
        where: { id: weeklyGoalId, userId: session.user.id },
        include: {
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
                      dream: {
                        select: { title: true, description: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!weeklyGoal) {
        return NextResponse.json(
          { error: "Weekly goal not found" },
          { status: 404 }
        );
      }

      goalTitle = weeklyGoal.title;
      goalDescription = weeklyGoal.description || undefined;
      parentTitle = weeklyGoal.monthlyGoal?.title || undefined;

      // Build cascading context for better AI suggestions
      cascadingContext = {
        weekly: { title: weeklyGoal.title, description: weeklyGoal.description || undefined },
      };

      if (weeklyGoal.monthlyGoal) {
        cascadingContext.monthly = {
          title: weeklyGoal.monthlyGoal.title,
          description: weeklyGoal.monthlyGoal.description || undefined,
        };
        if (weeklyGoal.monthlyGoal.oneYearGoal) {
          cascadingContext.oneYear = {
            title: weeklyGoal.monthlyGoal.oneYearGoal.title,
            description: weeklyGoal.monthlyGoal.oneYearGoal.description || undefined,
          };
          if (weeklyGoal.monthlyGoal.oneYearGoal.fiveYearGoal) {
            cascadingContext.fiveYear = {
              title: weeklyGoal.monthlyGoal.oneYearGoal.fiveYearGoal.title,
              description: weeklyGoal.monthlyGoal.oneYearGoal.fiveYearGoal.description || undefined,
            };
            if (weeklyGoal.monthlyGoal.oneYearGoal.fiveYearGoal.dream) {
              cascadingContext.dream = {
                title: weeklyGoal.monthlyGoal.oneYearGoal.fiveYearGoal.dream.title,
                description: weeklyGoal.monthlyGoal.oneYearGoal.fiveYearGoal.dream.description || undefined,
              };
            }
          }
        }
      }
    }

    // Call Anthropic API with cascading context
    const userMessage = createTaskSuggestMessage(
      goalTitle,
      goalDescription,
      parentTitle,
      cascadingContext
    );

    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      system: TASK_SUGGESTER_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse and validate response
    const result = parseAIResponse<TaskSuggestResponse>(textContent.text);

    if (!validateTaskSuggestResponse(result)) {
      throw new Error("Invalid AI response format");
    }

    // Log the interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.user.id,
        type: "TASK_SUGGEST",
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
    console.error("Error in task suggest:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to suggest tasks" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAIRateLimit } from "@/lib/redis";
import {
  anthropic,
  GOAL_LINK_SUGGEST_PROMPT,
  createGoalLinkSuggestMessage,
  parseAIResponse,
  validateGoalLinkSuggestResponse,
  type GoalLinkSuggestResponse,
  type GoalForLinking,
} from "@/lib/ai";

// POST /api/ai/suggest-goal-link - Suggest a goal to link to a task based on task title
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskTitle, goals } = await request.json();

    if (!taskTitle || typeof taskTitle !== "string" || taskTitle.trim().length < 3) {
      return NextResponse.json(
        { error: "Task title must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json(
        { error: "At least one goal is required" },
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

    // Prepare goals for the prompt
    const goalsForLinking: GoalForLinking[] = goals.map((g: { id: string; title: string; description?: string; category?: string }) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      category: g.category,
    }));

    const userMessage = createGoalLinkSuggestMessage(taskTitle, goalsForLinking);

    // Call Anthropic API using Haiku for this simpler matching task (faster, cheaper)
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent results
      system: GOAL_LINK_SUGGEST_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse and validate response
    const result = parseAIResponse<GoalLinkSuggestResponse>(textContent.text);

    if (!validateGoalLinkSuggestResponse(result)) {
      throw new Error("Invalid AI response format");
    }

    // Log the interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.user.id,
        type: "GOAL_LINK_SUGGEST",
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
    console.error("Error in goal link suggestion:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to suggest goal link" },
      { status: 500 }
    );
  }
}

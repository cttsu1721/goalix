import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  anthropic,
  AI_CONFIG,
  GOAL_SHARPENER_PROMPT,
  createGoalSharpenMessage,
  parseAIResponse,
  validateGoalSharpenResponse,
  AI_RATE_LIMITS,
  type GoalSharpenResponse,
} from "@/lib/ai";

// POST /api/ai/sharpen - Sharpen a goal using AI
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, context, category } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Goal title is required" },
        { status: 400 }
      );
    }

    // Check rate limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageCount = await prisma.aIInteraction.count({
      where: {
        userId: session.user.id,
        type: "GOAL_SHARPEN",
        createdAt: { gte: today },
      },
    });

    if (usageCount >= AI_RATE_LIMITS.freeLimit) {
      return NextResponse.json(
        {
          error: "Daily AI limit reached",
          limit: AI_RATE_LIMITS.freeLimit,
          used: usageCount,
        },
        { status: 429 }
      );
    }

    // Call Anthropic API
    const userMessage = createGoalSharpenMessage(title, context, category);

    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      system: GOAL_SHARPENER_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse and validate response
    const result = parseAIResponse<GoalSharpenResponse>(textContent.text);

    if (!validateGoalSharpenResponse(result)) {
      throw new Error("Invalid AI response format");
    }

    // Log the interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.user.id,
        type: "GOAL_SHARPEN",
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        prompt: userMessage,
        response: JSON.stringify(result),
      },
    });

    // Return remaining uses
    const remainingUses = AI_RATE_LIMITS.freeLimit - usageCount - 1;

    return NextResponse.json({
      success: true,
      data: result,
      usage: {
        remaining: remainingUses,
        limit: AI_RATE_LIMITS.freeLimit,
      },
    });
  } catch (error) {
    console.error("Error in goal sharpen:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to sharpen goal" },
      { status: 500 }
    );
  }
}

// GET /api/ai/sharpen - Get remaining AI uses
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageCount = await prisma.aIInteraction.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: today },
      },
    });

    return NextResponse.json({
      remaining: Math.max(0, AI_RATE_LIMITS.freeLimit - usageCount),
      limit: AI_RATE_LIMITS.freeLimit,
      used: usageCount,
    });
  } catch (error) {
    console.error("Error fetching AI usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI usage" },
      { status: 500 }
    );
  }
}

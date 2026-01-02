import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAIRateLimit } from "@/lib/redis";
import {
  anthropic,
  AI_CONFIG,
  VISION_BUILDER_PROMPT,
  createVisionBuilderMessage,
  parseAIResponse,
  validateVisionBuilderResponse,
  type VisionBuilderResponse,
} from "@/lib/ai";

// POST /api/ai/vision-builder - Generate complete goal hierarchy from user's vision idea
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { idea, category } = await request.json();

    // Validate required fields
    if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a vision idea (at least 10 characters)" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
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

    // Create the user message with current date context
    const userMessage = createVisionBuilderMessage(idea.trim(), category);

    // Call Anthropic API - use slightly higher max tokens for larger response
    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: 2000, // Larger response expected
      temperature: AI_CONFIG.temperature,
      system: VISION_BUILDER_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse and validate response
    const result = parseAIResponse<VisionBuilderResponse>(textContent.text);

    if (!validateVisionBuilderResponse(result)) {
      console.error("Invalid AI response structure:", result);
      throw new Error("Invalid AI response format");
    }

    // Log the interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.user.id,
        type: "VISION_BUILD",
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        prompt: userMessage,
        response: JSON.stringify(result),
      },
    });

    // Calculate total goals generated
    let totalGoals = 1; // Vision
    result.threeYearGoals.forEach((ty) => {
      totalGoals += 1; // 3-year
      ty.oneYearGoals.forEach(() => {
        totalGoals += 3; // 1-year + monthly + weekly
      });
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        totalGoals,
        category,
      },
      usage: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
      },
    });
  } catch (error) {
    console.error("Error in vision builder:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate vision hierarchy" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { anthropic } from "@/lib/ai/client";
import { checkAIRateLimit } from "@/lib/redis";

interface CascadeRequest {
  parentGoalId: string;
  parentGoalTitle: string;
  parentGoalDescription?: string | null;
  parentLevel: "oneYear" | "monthly" | "weekly";
}

interface CascadeSuggestion {
  title: string;
  description?: string;
}

const LEVEL_CHILD_INFO: Record<string, { childName: string; count: number; example: string }> = {
  oneYear: {
    childName: "monthly goals",
    count: 3,
    example: "e.g., 'Complete online course fundamentals' → monthly milestone",
  },
  monthly: {
    childName: "weekly goals",
    count: 4,
    example: "e.g., 'Finish module 1 exercises' → weekly target",
  },
  weekly: {
    childName: "daily tasks",
    count: 5,
    example: "e.g., 'Complete lesson 3 quiz' → concrete task",
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = await checkAIRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "AI limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as CascadeRequest;
    const { parentGoalTitle, parentGoalDescription, parentLevel } = body;

    if (!parentGoalTitle || !parentLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const levelInfo = LEVEL_CHILD_INFO[parentLevel];
    if (!levelInfo) {
      return NextResponse.json(
        { error: "Invalid parent level" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a goal-setting expert helping users break down goals into smaller, actionable pieces.
Your task is to suggest ${levelInfo.count} ${levelInfo.childName} based on the parent goal provided.

Guidelines:
- Each suggestion should be specific and measurable
- Suggestions should collectively cover the scope of the parent goal
- Use action-oriented language
- Keep titles concise (under 60 characters)
- For tasks: make them completable in a single day
- For weekly goals: make them achievable in one week
- For monthly goals: make them achievable in one month

Respond with a JSON array of objects with "title" and optional "description" fields.`;

    const userPrompt = `Break down this goal into ${levelInfo.count} ${levelInfo.childName}:

Goal: ${parentGoalTitle}
${parentGoalDescription ? `Description: ${parentGoalDescription}` : ""}

${levelInfo.example}

Respond with only the JSON array, no additional text.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    // Parse response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response format");
    }

    // Log the interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.user.id,
        type: "GOAL_SHARPEN", // Using existing type for cascade
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        prompt: userPrompt,
        response: content.text,
      },
    });

    // Extract JSON from response
    let suggestions: CascadeSuggestion[];
    try {
      // Try to parse directly or extract from markdown code block
      const text = content.text.trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch {
      console.error("Failed to parse AI response:", content.text);
      return NextResponse.json(
        { error: "Failed to parse AI suggestions" },
        { status: 500 }
      );
    }

    // Validate and sanitize
    suggestions = suggestions
      .filter((s) => s && typeof s.title === "string" && s.title.trim())
      .map((s) => ({
        title: s.title.trim().slice(0, 100),
        description: s.description?.trim().slice(0, 300),
      }))
      .slice(0, 10); // Cap at 10

    return NextResponse.json({
      success: true,
      suggestions,
      remaining: rateLimit.remaining - 1,
    });
  } catch (error) {
    console.error("Error generating cascade suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

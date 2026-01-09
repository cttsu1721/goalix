import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/ai/feedback - Submit feedback on AI suggestions
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { interactionId, feedback, context } = body;

    if (!feedback || !["positive", "negative"].includes(feedback)) {
      return NextResponse.json(
        { error: "Invalid feedback value" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const isPositive = feedback === "positive";

    // If we have an interaction ID, update the existing record
    if (interactionId) {
      const interaction = await prisma.aIInteraction.findFirst({
        where: {
          id: interactionId,
          userId,
        },
      });

      if (interaction) {
        await prisma.aIInteraction.update({
          where: { id: interactionId },
          data: {
            feedbackPositive: isPositive,
            feedbackContext: context || null,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Feedback recorded",
        });
      }
    }

    // If no interaction ID or not found, create a feedback-only record
    // This allows feedback even if we didn't track the original interaction
    await prisma.aIInteraction.create({
      data: {
        userId,
        type: "FEEDBACK_ONLY",
        inputTokens: 0,
        outputTokens: 0,
        feedbackPositive: isPositive,
        feedbackContext: context || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Feedback recorded",
    });
  } catch (error) {
    console.error("Error recording AI feedback:", error);
    return NextResponse.json(
      { error: "Failed to record feedback" },
      { status: 500 }
    );
  }
}

// GET /api/ai/feedback/stats - Get feedback statistics (for admin/analytics)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get feedback stats for the user
    const stats = await prisma.aIInteraction.groupBy({
      by: ["feedbackPositive"],
      where: {
        userId,
        feedbackPositive: { not: null },
      },
      _count: true,
    });

    const positive = stats.find((s) => s.feedbackPositive === true)?._count || 0;
    const negative = stats.find((s) => s.feedbackPositive === false)?._count || 0;
    const total = positive + negative;

    return NextResponse.json({
      success: true,
      data: {
        positive,
        negative,
        total,
        positiveRate: total > 0 ? Math.round((positive / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching AI feedback stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback stats" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createApiToken,
  listUserTokens,
  getTokenCount,
} from "@/lib/api-token-auth";

const MAX_TOKENS_PER_USER = 10;

/**
 * GET /api/tokens - List all API tokens for the current user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const tokens = await listUserTokens(session.user.id);

    return NextResponse.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    console.error("Error listing tokens:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list tokens" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tokens - Create a new API token
 *
 * Body: { name: string, expiresInDays?: number }
 *
 * Returns the plaintext token ONCE - store it securely!
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, expiresInDays } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_NAME", message: "Token name is required" } },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_NAME", message: "Token name must be 100 characters or less" } },
        { status: 400 }
      );
    }

    // Check token limit
    const tokenCount = await getTokenCount(session.user.id);
    if (tokenCount >= MAX_TOKENS_PER_USER) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOKEN_LIMIT_REACHED",
            message: `Maximum ${MAX_TOKENS_PER_USER} tokens allowed per user`,
          },
        },
        { status: 400 }
      );
    }

    // Calculate expiration date if provided
    let expiresAt: Date | undefined;
    if (expiresInDays && typeof expiresInDays === "number" && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const result = await createApiToken(session.user.id, name.trim(), expiresAt);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        token: result.token, // Plaintext token - shown ONCE
        tokenPrefix: result.tokenPrefix,
        name: result.name,
        expiresAt: expiresAt?.toISOString() ?? null,
        createdAt: result.createdAt.toISOString(),
        warning: "Store this token securely. It will not be shown again.",
      },
    });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create token" } },
      { status: 500 }
    );
  }
}

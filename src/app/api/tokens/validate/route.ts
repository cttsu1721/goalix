import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/api-token-auth";

/**
 * POST /api/tokens/validate - Validate an API token and return user info
 *
 * This endpoint is called by the Cloudflare Worker MCP server to validate tokens.
 * It does NOT require session auth - it validates the token itself.
 *
 * Body: { token: string }
 * or
 * Header: Authorization: Bearer <token>
 *
 * Returns user info if valid, error if invalid.
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from body or Authorization header
    let token: string | null = null;

    // Try Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // Fall back to body
    if (!token) {
      try {
        const body = await request.json();
        token = body.token;
      } catch {
        // Body parsing failed, that's ok if we have header
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: { code: "MISSING_TOKEN", message: "Token is required" },
        },
        { status: 400 }
      );
    }

    const userInfo = await validateToken(token);

    if (!userInfo) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        userId: userInfo.userId,
        email: userInfo.email,
        name: userInfo.name,
        timezone: userInfo.timezone,
      },
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to validate token" },
      },
      { status: 500 }
    );
  }
}

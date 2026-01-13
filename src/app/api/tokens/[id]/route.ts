import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revokeToken } from "@/lib/api-token-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/tokens/[id] - Revoke/delete an API token
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { id: tokenId } = await params;

    if (!tokenId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ID", message: "Token ID is required" } },
        { status: 400 }
      );
    }

    const deleted = await revokeToken(session.user.id, tokenId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Token not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Token revoked successfully" },
    });
  } catch (error) {
    console.error("Error revoking token:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to revoke token" } },
      { status: 500 }
    );
  }
}

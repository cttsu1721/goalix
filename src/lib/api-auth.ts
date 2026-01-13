/**
 * API Authentication Helper
 *
 * Supports both NextAuth session (web app) and Bearer token (MCP/API) authentication.
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { validateToken } from "@/lib/api-token-auth";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string | null;
  timezone?: string;
  authMethod: "session" | "token";
}

/**
 * Authenticate request via session or Bearer token
 * @returns User info if authenticated, null otherwise
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  // Try Bearer token first (for MCP/API clients)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token.startsWith("gzx_")) {
      const tokenUser = await validateToken(token);
      if (tokenUser) {
        return {
          id: tokenUser.userId,
          email: tokenUser.email,
          name: tokenUser.name,
          timezone: tokenUser.timezone,
          authMethod: "token",
        };
      }
    }
  }

  // Fall back to NextAuth session (for web app)
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      // timezone not in session - routes can fetch from DB if needed
      authMethod: "session",
    };
  }

  return null;
}

/**
 * MCP API Token Authentication Utilities
 *
 * Tokens are formatted as: gzx_{32_random_chars}
 * Tokens are stored as SHA-256 hashes (never plain text)
 */

import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

const TOKEN_PREFIX = "gzx_";
const TOKEN_LENGTH = 32; // Length of random part

/**
 * Generate a new API token
 * @returns Object with plaintext token (show once) and hash (store in DB)
 */
export function generateToken(): {
  token: string;
  tokenHash: string;
  tokenPrefix: string;
} {
  const randomPart = randomBytes(TOKEN_LENGTH).toString("base64url").slice(0, TOKEN_LENGTH);
  const token = `${TOKEN_PREFIX}${randomPart}`;
  const tokenHash = hashToken(token);
  const tokenPrefix = token.slice(0, 8); // "gzx_xxxx"

  return { token, tokenHash, tokenPrefix };
}

/**
 * Hash a token using SHA-256
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Validate a token and return user info
 * @returns User info if valid, null if invalid
 */
export async function validateToken(token: string): Promise<{
  userId: string;
  email: string | null;
  name: string | null;
  timezone: string;
} | null> {
  if (!token || !token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const tokenHash = hashToken(token);

  const apiToken = await prisma.mCPApiToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          timezone: true,
        },
      },
    },
  });

  if (!apiToken) {
    return null;
  }

  // Check if token is active
  if (!apiToken.isActive) {
    return null;
  }

  // Check if token is expired
  if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
    return null;
  }

  // Update last used timestamp (fire and forget)
  prisma.mCPApiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {
    // Ignore errors on last used update
  });

  return {
    userId: apiToken.user.id,
    email: apiToken.user.email,
    name: apiToken.user.name,
    timezone: apiToken.user.timezone,
  };
}

/**
 * Create a new API token for a user
 */
export async function createApiToken(
  userId: string,
  name: string,
  expiresAt?: Date
): Promise<{
  id: string;
  token: string; // Plaintext token (show once to user)
  tokenPrefix: string;
  name: string;
  createdAt: Date;
}> {
  const { token, tokenHash, tokenPrefix } = generateToken();

  const apiToken = await prisma.mCPApiToken.create({
    data: {
      userId,
      name,
      tokenHash,
      tokenPrefix,
      expiresAt,
    },
  });

  return {
    id: apiToken.id,
    token, // Only time plaintext token is returned
    tokenPrefix,
    name: apiToken.name,
    createdAt: apiToken.createdAt,
  };
}

/**
 * List all tokens for a user (without exposing hash)
 */
export async function listUserTokens(userId: string) {
  const tokens = await prisma.mCPApiToken.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      isActive: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return tokens;
}

/**
 * Revoke (delete) a token
 */
export async function revokeToken(
  userId: string,
  tokenId: string
): Promise<boolean> {
  const result = await prisma.mCPApiToken.deleteMany({
    where: {
      id: tokenId,
      userId, // Ensure user owns the token
    },
  });

  return result.count > 0;
}

/**
 * Get token count for a user
 */
export async function getTokenCount(userId: string): Promise<number> {
  return prisma.mCPApiToken.count({
    where: { userId, isActive: true },
  });
}

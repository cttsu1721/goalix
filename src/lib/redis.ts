import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

// Rate limiting for AI features - uses Redis instead of database queries
const AI_DAILY_LIMIT = 5;

export async function checkAIRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const today = new Date().toISOString().split("T")[0];
  const key = `ratelimit:ai:${userId}:${today}`;

  try {
    const count = await redis.incr(key);

    // Set expiry on first use (expire at end of day + 1 hour buffer)
    if (count === 1) {
      const secondsUntilMidnight = Math.ceil(
        (new Date(today + "T23:59:59.999Z").getTime() - Date.now()) / 1000
      );
      await redis.expire(key, secondsUntilMidnight + 3600);
    }

    const allowed = count <= AI_DAILY_LIMIT;
    const remaining = Math.max(0, AI_DAILY_LIMIT - count);

    // If not allowed, decrement to not count this failed attempt
    if (!allowed) {
      await redis.decr(key);
    }

    return { allowed, remaining: allowed ? remaining : remaining, limit: AI_DAILY_LIMIT };
  } catch (error) {
    console.error("Redis rate limit error:", error);
    // Fallback: allow request but log error
    return { allowed: true, remaining: AI_DAILY_LIMIT, limit: AI_DAILY_LIMIT };
  }
}

export async function getAIUsageCount(userId: string): Promise<{ used: number; remaining: number; limit: number }> {
  const today = new Date().toISOString().split("T")[0];
  const key = `ratelimit:ai:${userId}:${today}`;

  try {
    const count = await redis.get(key);
    const used = count ? parseInt(count, 10) : 0;
    return {
      used,
      remaining: Math.max(0, AI_DAILY_LIMIT - used),
      limit: AI_DAILY_LIMIT,
    };
  } catch (error) {
    console.error("Redis usage check error:", error);
    return { used: 0, remaining: AI_DAILY_LIMIT, limit: AI_DAILY_LIMIT };
  }
}

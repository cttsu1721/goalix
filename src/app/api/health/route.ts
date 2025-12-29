import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRedisConnection } from "@/lib/redis";

type HealthStatus = "ok" | "degraded";

export async function GET() {
  let status: HealthStatus = "ok";
  const services = {
    database: false,
    redis: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = true;
  } catch {
    status = "degraded";
  }

  try {
    services.redis = await checkRedisConnection();
    if (!services.redis) {
      status = "degraded";
    }
  } catch {
    status = "degraded";
  }

  const allHealthy = Object.values(services).every(Boolean);

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      services,
    },
    {
      status: allHealthy ? 200 : 503,
    }
  );
}

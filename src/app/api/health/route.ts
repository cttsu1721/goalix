import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRedisConnection } from "@/lib/redis";
import { validateEnv } from "@/lib/env";

type HealthStatus = "ok" | "degraded" | "unhealthy";

export async function GET() {
  let status: HealthStatus = "ok";
  const services = {
    database: false,
    redis: false,
  };
  const envValidation = {
    valid: true,
    errors: [] as string[],
    warnings: [] as string[],
  };

  // Validate environment configuration
  try {
    const envResult = validateEnv();
    envValidation.valid = envResult.valid;
    envValidation.errors = envResult.errors;
    envValidation.warnings = envResult.warnings;
    if (!envResult.valid) {
      status = "unhealthy";
    }
  } catch {
    envValidation.valid = false;
    envValidation.errors = ["Failed to validate environment"];
    status = "unhealthy";
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = true;
  } catch {
    status = status === "unhealthy" ? "unhealthy" : "degraded";
  }

  // Check Redis connection
  try {
    services.redis = await checkRedisConnection();
    if (!services.redis) {
      status = status === "unhealthy" ? "unhealthy" : "degraded";
    }
  } catch {
    status = status === "unhealthy" ? "unhealthy" : "degraded";
  }

  const allHealthy = envValidation.valid && Object.values(services).every(Boolean);

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      services,
      environment: {
        valid: envValidation.valid,
        errors: envValidation.errors.length > 0 ? envValidation.errors : undefined,
        warnings: envValidation.warnings.length > 0 ? envValidation.warnings : undefined,
      },
    },
    {
      status: allHealthy ? 200 : status === "unhealthy" ? 500 : 503,
    }
  );
}

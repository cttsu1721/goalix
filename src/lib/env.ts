/**
 * Environment Validation Module
 *
 * Validates required environment variables at application startup.
 * Prevents deployment issues by failing fast with clear error messages.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

const optionalEnvVars = [
  'EMAILIT_API_KEY',
  'ANTHROPIC_API_KEY',
] as const;

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that all required environment variables are set
 * and have valid formats for production use.
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Check required variables exist
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Check optional variables (warn if missing)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(`Missing optional environment variable: ${envVar} (some features may be disabled)`);
    }
  }

  // Validate DATABASE_URL format
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    // Check for localhost in production
    if (isProduction && (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'))) {
      errors.push('DATABASE_URL contains localhost - this will not work in production Docker environment');
    }

    // Check for special characters that may cause URL encoding issues
    const urlPart = databaseUrl.split('@')[0];
    if (urlPart && /[!#$%^&*()+=\[\]{};':"\\|,<>\/?]/.test(urlPart)) {
      warnings.push('DATABASE_URL password may contain special characters that could cause connection issues');
    }
  }

  // Validate REDIS_URL format
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
      errors.push('REDIS_URL must be a valid Redis connection string');
    }

    if (isProduction && (redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1'))) {
      errors.push('REDIS_URL contains localhost - this will not work in production Docker environment');
    }
  }

  // Validate NEXTAUTH_URL format
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    try {
      const url = new URL(nextAuthUrl);
      if (isProduction && url.protocol !== 'https:') {
        warnings.push('NEXTAUTH_URL should use HTTPS in production');
      }
      if (isProduction && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
        errors.push('NEXTAUTH_URL contains localhost - this will not work in production');
      }
    } catch {
      errors.push('NEXTAUTH_URL is not a valid URL');
    }
  }

  // Validate NEXTAUTH_SECRET length
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (nextAuthSecret && nextAuthSecret.length < 32) {
    warnings.push('NEXTAUTH_SECRET should be at least 32 characters for security');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates environment and exits with error if invalid.
 * Call this at application startup.
 */
export function assertValidEnv(): void {
  const result = validateEnv();

  // Log warnings
  for (const warning of result.warnings) {
    console.warn(`[ENV WARNING] ${warning}`);
  }

  // Exit on errors
  if (!result.valid) {
    console.error('\n========================================');
    console.error('ENVIRONMENT VALIDATION FAILED');
    console.error('========================================\n');
    for (const error of result.errors) {
      console.error(`[ENV ERROR] ${error}`);
    }
    console.error('\n========================================');
    console.error('Please fix the above errors and restart.');
    console.error('========================================\n');
    process.exit(1);
  }
}

/**
 * Get validated environment variable or throw
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

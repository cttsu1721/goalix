-- Flexible Goal Hierarchy Migration
-- This migration adds userId to ThreeYearGoal, OneYearGoal, and MonthlyGoal
-- and makes parent IDs optional, allowing standalone goals at any level.

-- Step 1: Add userId column to three_year_goals (nullable initially for backfill)
ALTER TABLE "three_year_goals" ADD COLUMN "user_id" TEXT;

-- Step 2: Backfill user_id from seven_year_visions
UPDATE "three_year_goals"
SET "user_id" = (
  SELECT "user_id" FROM "seven_year_visions"
  WHERE "seven_year_visions"."id" = "three_year_goals"."seven_year_vision_id"
)
WHERE "user_id" IS NULL;

-- Step 3: Make user_id NOT NULL after backfill
ALTER TABLE "three_year_goals" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Add foreign key and index
ALTER TABLE "three_year_goals" ADD CONSTRAINT "three_year_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "three_year_goals_user_id_idx" ON "three_year_goals"("user_id");

-- Step 5: Make seven_year_vision_id optional
ALTER TABLE "three_year_goals" DROP CONSTRAINT "three_year_goals_seven_year_vision_id_fkey";
ALTER TABLE "three_year_goals" ALTER COLUMN "seven_year_vision_id" DROP NOT NULL;
ALTER TABLE "three_year_goals" ADD CONSTRAINT "three_year_goals_seven_year_vision_id_fkey" FOREIGN KEY ("seven_year_vision_id") REFERENCES "seven_year_visions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- ONE_YEAR_GOALS
-- ============================================

-- Step 1: Add userId column to one_year_goals (nullable initially for backfill)
ALTER TABLE "one_year_goals" ADD COLUMN "user_id" TEXT;

-- Step 2: Backfill user_id from three_year_goals -> seven_year_visions
UPDATE "one_year_goals"
SET "user_id" = (
  SELECT sv."user_id"
  FROM "three_year_goals" tyg
  JOIN "seven_year_visions" sv ON tyg."seven_year_vision_id" = sv."id"
  WHERE tyg."id" = "one_year_goals"."three_year_goal_id"
)
WHERE "user_id" IS NULL;

-- For any orphaned records, try the new user_id on three_year_goals
UPDATE "one_year_goals"
SET "user_id" = (
  SELECT tyg."user_id"
  FROM "three_year_goals" tyg
  WHERE tyg."id" = "one_year_goals"."three_year_goal_id"
)
WHERE "user_id" IS NULL;

-- Step 3: Make user_id NOT NULL after backfill
ALTER TABLE "one_year_goals" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Add foreign key and index
ALTER TABLE "one_year_goals" ADD CONSTRAINT "one_year_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "one_year_goals_user_id_idx" ON "one_year_goals"("user_id");

-- Step 5: Make three_year_goal_id optional
ALTER TABLE "one_year_goals" DROP CONSTRAINT "one_year_goals_three_year_goal_id_fkey";
ALTER TABLE "one_year_goals" ALTER COLUMN "three_year_goal_id" DROP NOT NULL;
ALTER TABLE "one_year_goals" ADD CONSTRAINT "one_year_goals_three_year_goal_id_fkey" FOREIGN KEY ("three_year_goal_id") REFERENCES "three_year_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- MONTHLY_GOALS
-- ============================================

-- Step 1: Add userId column to monthly_goals (nullable initially for backfill)
ALTER TABLE "monthly_goals" ADD COLUMN "user_id" TEXT;

-- Step 2: Backfill user_id from one_year_goals -> three_year_goals -> seven_year_visions
UPDATE "monthly_goals"
SET "user_id" = (
  SELECT sv."user_id"
  FROM "one_year_goals" oyg
  JOIN "three_year_goals" tyg ON oyg."three_year_goal_id" = tyg."id"
  JOIN "seven_year_visions" sv ON tyg."seven_year_vision_id" = sv."id"
  WHERE oyg."id" = "monthly_goals"."one_year_goal_id"
)
WHERE "user_id" IS NULL;

-- For any orphaned records, try the new user_id on one_year_goals
UPDATE "monthly_goals"
SET "user_id" = (
  SELECT oyg."user_id"
  FROM "one_year_goals" oyg
  WHERE oyg."id" = "monthly_goals"."one_year_goal_id"
)
WHERE "user_id" IS NULL;

-- Step 3: Make user_id NOT NULL after backfill
ALTER TABLE "monthly_goals" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Add foreign key and index
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "monthly_goals_user_id_idx" ON "monthly_goals"("user_id");

-- Step 5: Make one_year_goal_id optional
ALTER TABLE "monthly_goals" DROP CONSTRAINT "monthly_goals_one_year_goal_id_fkey";
ALTER TABLE "monthly_goals" ALTER COLUMN "one_year_goal_id" DROP NOT NULL;
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_one_year_goal_id_fkey" FOREIGN KEY ("one_year_goal_id") REFERENCES "one_year_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- DAILY_TASKS - Add user relation
-- ============================================

-- Add foreign key constraint for existing user_id column (already exists in table)
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

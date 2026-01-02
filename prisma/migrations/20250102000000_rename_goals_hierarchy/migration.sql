-- Rename Goal Hierarchy: Dream/5-Year -> Vision/3-Year
-- This migration renames tables and columns to reflect new terminology

-- Step 1: Drop foreign key constraints first
ALTER TABLE "five_year_goals" DROP CONSTRAINT IF EXISTS "five_year_goals_dream_id_fkey";
ALTER TABLE "one_year_goals" DROP CONSTRAINT IF EXISTS "one_year_goals_five_year_goal_id_fkey";

-- Step 2: Rename tables
ALTER TABLE "dreams" RENAME TO "seven_year_visions";
ALTER TABLE "five_year_goals" RENAME TO "three_year_goals";

-- Step 3: Rename columns
ALTER TABLE "three_year_goals" RENAME COLUMN "dream_id" TO "seven_year_vision_id";
ALTER TABLE "one_year_goals" RENAME COLUMN "five_year_goal_id" TO "three_year_goal_id";

-- Step 4: Rename indexes
ALTER INDEX IF EXISTS "dreams_user_id_idx" RENAME TO "seven_year_visions_user_id_idx";
ALTER INDEX IF EXISTS "five_year_goals_dream_id_idx" RENAME TO "three_year_goals_seven_year_vision_id_idx";
ALTER INDEX IF EXISTS "one_year_goals_five_year_goal_id_idx" RENAME TO "one_year_goals_three_year_goal_id_idx";

-- Step 5: Recreate foreign key constraints with new names
ALTER TABLE "three_year_goals"
  ADD CONSTRAINT "three_year_goals_seven_year_vision_id_fkey"
  FOREIGN KEY ("seven_year_vision_id") REFERENCES "seven_year_visions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "one_year_goals"
  ADD CONSTRAINT "one_year_goals_three_year_goal_id_fkey"
  FOREIGN KEY ("three_year_goal_id") REFERENCES "three_year_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Update AIInteractionType enum value
ALTER TYPE "AIInteractionType" RENAME VALUE 'DREAM_BUILD' TO 'VISION_BUILD';

-- Step 7: Update target dates for existing data (optional - adjusts 10Y to 7Y, 5Y to 3Y)
-- This recalculates target dates based on created_at
UPDATE "seven_year_visions"
SET "target_date" = "created_at" + INTERVAL '7 years'
WHERE "target_date" IS NOT NULL;

UPDATE "three_year_goals"
SET "target_date" = "created_at" + INTERVAL '3 years'
WHERE "target_date" IS NOT NULL;

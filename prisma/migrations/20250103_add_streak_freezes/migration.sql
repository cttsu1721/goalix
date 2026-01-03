-- AddStreakFreezes
-- Add streak_freezes and last_freeze_at columns to users table

ALTER TABLE "users" ADD COLUMN "streak_freezes" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "users" ADD COLUMN "last_freeze_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notify_achievements" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_daily_reminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_weekly_review" BOOLEAN NOT NULL DEFAULT true;

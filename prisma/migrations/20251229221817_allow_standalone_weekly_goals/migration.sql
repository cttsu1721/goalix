/*
  Warnings:

  - Added the required column `user_id` to the `weekly_goals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "weekly_goals" DROP CONSTRAINT "weekly_goals_monthly_goal_id_fkey";

-- AlterTable
ALTER TABLE "weekly_goals" ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "monthly_goal_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "weekly_goals_user_id_idx" ON "weekly_goals"("user_id");

-- AddForeignKey
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_monthly_goal_id_fkey" FOREIGN KEY ("monthly_goal_id") REFERENCES "monthly_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "AIInteractionType" ADD VALUE 'GOAL_SUGGEST';

-- CreateIndex
CREATE INDEX "daily_tasks_user_id_priority_scheduled_date_idx" ON "daily_tasks"("user_id", "priority", "scheduled_date");

-- CreateIndex
CREATE INDEX "dreams_user_id_idx" ON "dreams"("user_id");

-- CreateIndex
CREATE INDEX "earned_badges_badge_id_idx" ON "earned_badges"("badge_id");

-- CreateIndex
CREATE INDEX "five_year_goals_dream_id_idx" ON "five_year_goals"("dream_id");

-- CreateIndex
CREATE INDEX "monthly_goals_one_year_goal_id_idx" ON "monthly_goals"("one_year_goal_id");

-- CreateIndex
CREATE INDEX "monthly_goals_target_month_idx" ON "monthly_goals"("target_month");

-- CreateIndex
CREATE INDEX "one_year_goals_five_year_goal_id_idx" ON "one_year_goals"("five_year_goal_id");

-- CreateIndex
CREATE INDEX "weekly_goals_monthly_goal_id_idx" ON "weekly_goals"("monthly_goal_id");

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "recurring_task_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weekly_goal_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL,
    "estimated_minutes" INTEGER,
    "pattern" "RecurrencePattern" NOT NULL,
    "days_of_week" TEXT,
    "custom_interval" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_task_templates_pkey" PRIMARY KEY ("id")
);

-- Add recurring_template_id to daily_tasks
ALTER TABLE "daily_tasks" ADD COLUMN "recurring_template_id" TEXT;

-- CreateIndex
CREATE INDEX "recurring_task_templates_user_id_is_active_idx" ON "recurring_task_templates"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "daily_tasks_recurring_template_id_idx" ON "daily_tasks"("recurring_template_id");

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_recurring_template_id_fkey" FOREIGN KEY ("recurring_template_id") REFERENCES "recurring_task_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_task_templates" ADD CONSTRAINT "recurring_task_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_task_templates" ADD CONSTRAINT "recurring_task_templates_weekly_goal_id_fkey" FOREIGN KEY ("weekly_goal_id") REFERENCES "weekly_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

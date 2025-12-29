-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('HEALTH', 'WEALTH', 'RELATIONSHIPS', 'CAREER', 'PERSONAL_GROWTH', 'LIFESTYLE', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('MIT', 'PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "StreakType" AS ENUM ('DAILY_PLANNING', 'MIT_COMPLETION', 'WEEKLY_REVIEW', 'MONTHLY_REVIEW', 'KAIZEN_CHECKIN');

-- CreateEnum
CREATE TYPE "AIInteractionType" AS ENUM ('GOAL_SHARPEN', 'TASK_SUGGEST');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "target_date" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dreams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "five_year_goals" (
    "id" TEXT NOT NULL,
    "dream_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "target_date" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "five_year_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_year_goals" (
    "id" TEXT NOT NULL,
    "five_year_goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "target_date" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_year_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_goals" (
    "id" TEXT NOT NULL,
    "one_year_goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "target_month" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_goals" (
    "id" TEXT NOT NULL,
    "monthly_goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "week_start" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_tasks" (
    "id" TEXT NOT NULL,
    "weekly_goal_id" TEXT,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_date" DATE NOT NULL,
    "estimated_minutes" INTEGER,
    "completed_at" TIMESTAMP(3),
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "unlinked_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "StreakType" NOT NULL,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "longest_count" INTEGER NOT NULL DEFAULT 0,
    "last_action_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon_url" TEXT,
    "criteria" TEXT NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earned_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "earned_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kaizen_checkins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "checkin_date" DATE NOT NULL,
    "health" BOOLEAN NOT NULL DEFAULT false,
    "relationships" BOOLEAN NOT NULL DEFAULT false,
    "wealth" BOOLEAN NOT NULL DEFAULT false,
    "career" BOOLEAN NOT NULL DEFAULT false,
    "personal_growth" BOOLEAN NOT NULL DEFAULT false,
    "lifestyle" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kaizen_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AIInteractionType" NOT NULL,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "daily_tasks_user_id_scheduled_date_idx" ON "daily_tasks"("user_id", "scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_user_id_type_key" ON "streaks"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "badges_slug_key" ON "badges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "earned_badges_user_id_badge_id_key" ON "earned_badges"("user_id", "badge_id");

-- CreateIndex
CREATE INDEX "kaizen_checkins_user_id_checkin_date_idx" ON "kaizen_checkins"("user_id", "checkin_date");

-- CreateIndex
CREATE UNIQUE INDEX "kaizen_checkins_user_id_checkin_date_key" ON "kaizen_checkins"("user_id", "checkin_date");

-- CreateIndex
CREATE INDEX "ai_interactions_user_id_created_at_idx" ON "ai_interactions"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreams" ADD CONSTRAINT "dreams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "five_year_goals" ADD CONSTRAINT "five_year_goals_dream_id_fkey" FOREIGN KEY ("dream_id") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_year_goals" ADD CONSTRAINT "one_year_goals_five_year_goal_id_fkey" FOREIGN KEY ("five_year_goal_id") REFERENCES "five_year_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_one_year_goal_id_fkey" FOREIGN KEY ("one_year_goal_id") REFERENCES "one_year_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_monthly_goal_id_fkey" FOREIGN KEY ("monthly_goal_id") REFERENCES "monthly_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_weekly_goal_id_fkey" FOREIGN KEY ("weekly_goal_id") REFERENCES "weekly_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earned_badges" ADD CONSTRAINT "earned_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earned_badges" ADD CONSTRAINT "earned_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaizen_checkins" ADD CONSTRAINT "kaizen_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

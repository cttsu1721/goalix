-- CreateTable
CREATE TABLE "weekly_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_start" DATE NOT NULL,
    "wins" TEXT,
    "challenges" TEXT,
    "next_week_focus" TEXT,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "total_tasks" INTEGER NOT NULL DEFAULT 0,
    "mit_completed" INTEGER NOT NULL DEFAULT 0,
    "mit_total" INTEGER NOT NULL DEFAULT 0,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "goal_alignment_rate" INTEGER NOT NULL DEFAULT 0,
    "review_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month_start" DATE NOT NULL,
    "wins" TEXT,
    "learnings" TEXT,
    "next_month_focus" TEXT,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "total_tasks" INTEGER NOT NULL DEFAULT 0,
    "mit_completed" INTEGER NOT NULL DEFAULT 0,
    "mit_total" INTEGER NOT NULL DEFAULT 0,
    "goals_completed" INTEGER NOT NULL DEFAULT 0,
    "goals_total" INTEGER NOT NULL DEFAULT 0,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "goal_alignment_rate" INTEGER NOT NULL DEFAULT 0,
    "kaizen_checkins_count" INTEGER NOT NULL DEFAULT 0,
    "review_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_reviews_user_id_week_start_idx" ON "weekly_reviews"("user_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_reviews_user_id_week_start_key" ON "weekly_reviews"("user_id", "week_start");

-- CreateIndex
CREATE INDEX "monthly_reviews_user_id_month_start_idx" ON "monthly_reviews"("user_id", "month_start");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reviews_user_id_month_start_key" ON "monthly_reviews"("user_id", "month_start");

-- AddForeignKey
ALTER TABLE "weekly_reviews" ADD CONSTRAINT "weekly_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_reviews" ADD CONSTRAINT "monthly_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

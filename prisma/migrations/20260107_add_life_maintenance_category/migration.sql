-- Add LIFE_MAINTENANCE to GoalCategory enum
-- This category is for tasks that are necessary life maintenance (bills, errands, etc.)
-- but should be exempt from goal alignment tracking

ALTER TYPE "GoalCategory" ADD VALUE 'LIFE_MAINTENANCE' BEFORE 'OTHER';

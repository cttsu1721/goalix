/**
 * Sample Goals Data
 *
 * Pre-configured goal cascades for new users to explore the app.
 * Two example tracks: Career/Business and Health/Fitness
 */

import type { GoalCategory, TaskPriority } from "@prisma/client";

function getYearsFromNow(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date;
}

// Helper to get start/end of current month for monthly goals
function getMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

// Helper to get start/end of current week for weekly goals
function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); // Monday
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export interface SampleVision {
  title: string;
  description: string;
  category: GoalCategory;
  threeYearGoals: SampleThreeYearGoal[];
}

export interface SampleThreeYearGoal {
  title: string;
  description: string;
  oneYearGoals: SampleOneYearGoal[];
}

export interface SampleOneYearGoal {
  title: string;
  description: string;
  monthlyGoals: SampleMonthlyGoal[];
}

export interface SampleMonthlyGoal {
  title: string;
  description: string;
  weeklyGoals: SampleWeeklyGoal[];
}

export interface SampleWeeklyGoal {
  title: string;
  description: string;
  tasks: SampleTask[];
}

export interface SampleTask {
  title: string;
  priority: TaskPriority;
  estimatedMinutes?: number;
  notes?: string;
}

/**
 * Career/Business Track
 * A realistic SaaS entrepreneur journey
 */
const careerVision: SampleVision = {
  title: "Build a successful SaaS business generating $1M ARR",
  description:
    "Create a sustainable software business that provides value to customers while enabling financial freedom and work-life balance. Focus on solving real problems for a specific niche.",
  category: "CAREER",
  threeYearGoals: [
    {
      title: "Launch and grow first SaaS to $100K ARR",
      description:
        "Build, launch, and scale the MVP to a sustainable revenue level with a clear path to profitability.",
      oneYearGoals: [
        {
          title: "Launch MVP and acquire 100 paying customers",
          description:
            "Ship a minimal but valuable product, validate product-market fit, and build the foundation for growth.",
          monthlyGoals: [
            {
              title: "Complete core feature development and beta launch",
              description:
                "Finish building the essential features, launch a closed beta, and gather initial user feedback.",
              weeklyGoals: [
                {
                  title: "Build user authentication and dashboard",
                  description:
                    "Implement secure login, user profiles, and the main dashboard interface.",
                  tasks: [
                    {
                      title: "Design authentication flow and dashboard wireframes",
                      priority: "MIT",
                      estimatedMinutes: 90,
                      notes:
                        "Focus on simplicity and quick onboarding. Reference best practices from Stripe and Linear.",
                    },
                    {
                      title: "Set up NextAuth.js with magic link authentication",
                      priority: "PRIMARY",
                      estimatedMinutes: 120,
                    },
                    {
                      title: "Create user profile database schema",
                      priority: "PRIMARY",
                      estimatedMinutes: 60,
                    },
                    {
                      title: "Research competitor onboarding flows",
                      priority: "SECONDARY",
                      estimatedMinutes: 45,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Health/Fitness Track
 * A half marathon training journey
 */
const healthVision: SampleVision = {
  title: "Achieve optimal physical health and run a marathon",
  description:
    "Build a sustainable fitness routine that supports long-term health, energy, and mental clarity. Use running as the primary discipline with supporting strength training.",
  category: "HEALTH",
  threeYearGoals: [
    {
      title: "Complete a full marathon in under 4 hours",
      description:
        "Progress from casual running to marathon-level fitness through consistent training.",
      oneYearGoals: [
        {
          title: "Run a half marathon in under 2 hours",
          description:
            "Build endurance and speed through a structured 16-week training plan. Target race in autumn.",
          monthlyGoals: [
            {
              title: "Build base fitness with 3 runs per week (15-20km total)",
              description:
                "Establish consistent running habit and build aerobic base before increasing intensity.",
              weeklyGoals: [
                {
                  title: "Complete 3 runs: easy 5K, tempo 4K, long 7K",
                  description:
                    "Mix of easy, tempo, and long runs to build both endurance and speed.",
                  tasks: [
                    {
                      title: "Morning 5K easy run (zone 2 heart rate)",
                      priority: "MIT",
                      estimatedMinutes: 35,
                      notes: "Keep it conversational pace. Focus on form, not speed.",
                    },
                    {
                      title: "Midweek 4K tempo run with 1K warm-up",
                      priority: "PRIMARY",
                      estimatedMinutes: 30,
                    },
                    {
                      title: "Weekend long run 7K at comfortable pace",
                      priority: "PRIMARY",
                      estimatedMinutes: 50,
                    },
                    {
                      title: "15-min stretching and foam rolling session",
                      priority: "SECONDARY",
                      estimatedMinutes: 15,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Personal Growth Track
 * Learning and skill development
 */
const growthVision: SampleVision = {
  title: "Become a highly effective leader and lifelong learner",
  description:
    "Develop leadership skills, build valuable expertise, and create habits that support continuous growth and learning.",
  category: "PERSONAL_GROWTH",
  threeYearGoals: [
    {
      title: "Master public speaking and lead a team of 10+",
      description:
        "Develop communication skills and leadership experience through deliberate practice.",
      oneYearGoals: [
        {
          title: "Give 12 presentations and read 24 books",
          description:
            "Build presentation confidence through practice and expand knowledge through reading.",
          monthlyGoals: [
            {
              title: "Give 1 presentation and finish 2 books",
              description:
                "Practice presenting at team meetings or meetups. Complete 2 non-fiction books this month.",
              weeklyGoals: [
                {
                  title: "Prepare presentation slides and read 100 pages",
                  description:
                    "Draft presentation for next week's team meeting. Continue reading current book.",
                  tasks: [
                    {
                      title: "Outline key points for team presentation",
                      priority: "MIT",
                      estimatedMinutes: 45,
                      notes:
                        "Topic: Q1 project retrospective. Focus on lessons learned and next steps.",
                    },
                    {
                      title: "Read 30 pages of current book before bed",
                      priority: "PRIMARY",
                      estimatedMinutes: 40,
                    },
                    {
                      title: "Create 5 presentation slides with visuals",
                      priority: "PRIMARY",
                      estimatedMinutes: 60,
                    },
                    {
                      title: "Write 3 key takeaways from reading",
                      priority: "SECONDARY",
                      estimatedMinutes: 15,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * All sample visions
 */
export const SAMPLE_VISIONS: SampleVision[] = [careerVision, healthVision, growthVision];

/**
 * Generate creation data with proper dates
 */
export function getSampleGoalsWithDates() {
  const monthRange = getMonthRange();
  const weekRange = getWeekRange();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return SAMPLE_VISIONS.map((vision) => ({
    ...vision,
    targetDate: getYearsFromNow(7),
    threeYearGoals: vision.threeYearGoals.map((g3) => ({
      ...g3,
      targetDate: getYearsFromNow(3),
      oneYearGoals: g3.oneYearGoals.map((g1) => ({
        ...g1,
        targetDate: getYearsFromNow(1),
        monthlyGoals: g1.monthlyGoals.map((gm) => ({
          ...gm,
          month: monthRange.start.getMonth() + 1, // 1-indexed month
          year: monthRange.start.getFullYear(),
          weeklyGoals: gm.weeklyGoals.map((gw) => ({
            ...gw,
            weekStart: weekRange.start,
            weekEnd: weekRange.end,
            tasks: gw.tasks.map((task) => ({
              ...task,
              scheduledDate: today,
            })),
          })),
        })),
      })),
    })),
  }));
}

# Goalzenix — Project Instructions

## Project Overview

Goalzenix is a goal tracking web application using a cascading goal methodology. It enables users to cascade 7-year visions down to actionable daily tasks, enhanced with gamification (points, streaks, badges, levels) and AI assistance (Goal Sharpener, Task Suggester).

### Core Value Proposition
Help goal-oriented professionals and entrepreneurs translate ambitious long-term visions into consistent daily action through structured goal hierarchy, habit-forming gamification, and AI-powered guidance.

### Business Model
- **Type:** Freemium SaaS (future)
- **MVP:** Free with AI rate limits (5 AI uses/day)
- **Target Users:** Goal-oriented professionals, entrepreneurs, self-improvers

---

## Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | Next.js 14+ (App Router) | SSR, App Router, PWA support |
| UI | shadcn/ui + Tailwind CSS | Rapid development, consistent design |
| Database | PostgreSQL (sqm_postgres) | Existing infrastructure, relational data model |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | NextAuth.js (Magic Link) | Simple, passwordless, email-based |
| AI | Anthropic Claude API | Sonnet 4 for quality, Haiku for simple tasks |
| PWA | next-pwa | Offline capability, installable |
| Caching | Redis | Session storage, rate limiting |
| Deployment | Docker on VPS | Existing infrastructure |

---

## Infrastructure

### Production Environment
- **VPS:** DigitalOcean SYD1 (4GB RAM / 2 vCPU)
- **IP Address:** 170.64.137.4
- **Reverse Proxy:** Caddy (automatic HTTPS)
- **Database Container:** sqm_postgres
- **Network:** n8n-docker-caddy_default

### Domain Configuration
- **Production URL:** `https://goalzenix.com`
- **Domain Registrar:** Cloudflare
- **Container Name:** goalix
- **Internal Port:** 3000

### Database Credentials
- **Database Name:** goalix_db
- **Database User:** goalix_user
- **Connection String:** `postgresql://goalix_user:PASSWORD@sqm_postgres:5432/goalix_db`

---

## Key Concepts

### Goal Hierarchy

The system implements a cascading goal structure:

```
7-Year Vision (Long-term Vision)
└── 3-Year Goal (Major Milestone)
    └── 1-Year Goal (Annual Objective)
        └── Monthly Goal (Monthly Target)
            └── Weekly Goal (Week's Focus)
                └── Daily Task (Actionable Items)
```

### Daily Task Priorities

| Priority | Limit | Points | Description |
|----------|-------|--------|-------------|
| MIT (Most Important Task) | 1/day | 100 | Single most impactful task |
| PRIMARY | 3/day | 50 each | Core tasks for the day |
| SECONDARY | Unlimited | 25 each | Bonus/supporting tasks |

### Decision Compass (Unlinked Task Friction)

A core principle: every action should be filtered through your goals. The Decision Compass prevents "action faking" — busy work that feels productive but doesn't advance your goals.

**Implementation:**

When a user creates a task **not linked** to a Weekly Goal, the system intervenes:

```
User creates task
    ↓
Is it linked to a Weekly Goal?
    ├── Yes → Create normally
    └── No → Show Decision Compass prompt
                ↓
         "This task isn't linked to your goals.
          Does it move you toward your 1-Year Target?"
                ↓
         [Link to Goal]  [Create Anyway]  [Cancel]
```

**Behaviour:**
- Soft friction, not a hard block — users can still create unlinked tasks
- "Create Anyway" requires acknowledgement (`unlinkedAcknowledged: true`)
- Track linked vs unlinked task completion rates per user
- Surface ratio in Weekly Review: *"8 of 12 tasks were goal-aligned this week"*

**Database Fields (DailyTask):**
- `weeklyGoalId` — nullable FK to WeeklyGoal
- `unlinkedAcknowledged` — boolean, true if user confirmed unlinked task

**Weekly Review Prompt:**
During Weekly Review, display goal alignment stats:
> *"This week: 67% of your completed tasks were linked to goals."*
> *"Unlinked tasks completed: 4"*

**Rationale:**
This builds the mental habit of filtering decisions through the 1-Year Target. Over time, users internalise this even without the app.

---

### Decision Compass (Unlinked Task Friction)

A core principle: every action should be filtered through your goals. The Decision Compass prevents "action faking" — busy work that feels productive but doesn't advance your goals.

**Implementation:**

When a user creates a task **not linked** to a Weekly Goal, the system intervenes:

```
User creates task
    ↓
Is it linked to a Weekly Goal?
    ├── Yes → Create normally
    └── No → Show Decision Compass prompt
                ↓
         "This task isn't linked to your goals.
          Does it move you toward your 1-Year Target?"
                ↓
         [Link to Goal]  [Create Anyway]  [Cancel]
```

**Behaviour:**
- Soft friction, not a hard block — users can still create unlinked tasks
- "Create Anyway" requires acknowledgement (`unlinkedAcknowledged: true`)
- Track linked vs unlinked task completion rates per user
- Surface ratio in Weekly Review: *"8 of 12 tasks were goal-aligned this week"*

**Database Fields (DailyTask):**
- `weeklyGoalId` — nullable FK to WeeklyGoal
- `unlinkedAcknowledged` — boolean, true if user confirmed unlinked task

**Weekly Review Prompt:**
During Weekly Review, display goal alignment stats:
> *"This week: 67% of your completed tasks were linked to goals."*
> *"Unlinked tasks completed: 4"*

**Rationale:**
This builds the mental habit of filtering decisions through the 1-Year Target. Over time, users internalise this even without the app.

---

### Goal Categories
- Health
- Wealth
- Relationships
- Career
- Personal Growth
- Lifestyle
- Other

### Goal Statuses
- Active
- Completed
- Paused
- Abandoned

---

## Gamification System

### Points Structure
- MIT completed: 100 points
- Primary task completed: 50 points
- Secondary task completed: 25 points
- Weekly goal completed: 200 points
- Monthly goal completed: 500 points
- Complete daily planning: 50 points
- Complete Kaizen check-in: 10 points
- Kaizen "balanced day" (all 6 areas): +25 bonus points
- Streak bonus: +10% per day (caps at +100%)

### Streak Types
- **DAILY_PLANNING:** Completed daily planning session
- **MIT_COMPLETION:** Completed MIT task
- **WEEKLY_REVIEW:** Completed weekly review
- **MONTHLY_REVIEW:** Completed monthly review
- **KAIZEN_CHECKIN:** Completed daily Kaizen reflection

### Streak Rules
- Must complete action by end of day (user's timezone)
- No grace period (strict for MVP)
- Weekends still count

### Lifestyle Insights (Conveyor Belt Reinforcement)

The 1/5/10 framework emphasises that habits must become *instinctual* — the "side rails" of the ladder. When users hit streak milestones, surface insights that reinforce this:

| Streak | Message |
|--------|----------|
| 7 days | "One week down. You're building momentum." |
| 14 days | "Two weeks consistent. This is becoming part of your routine." |
| 30 days | "30 days. This is no longer effort — it's becoming lifestyle." |
| 60 days | "60 days. Your conveyor belt is producing results." |
| 90 days | "90 days. This habit is now instinctual. You've changed the process." |

**Display locations:**
- Progress page (persistent insight card)
- Dashboard (toast notification on milestone hit)
- Weekly Review summary

**Rationale:**
Reinforces that daily execution compounds into lifestyle change — the "conveyor belt" that produces results. Users see their actions transforming from conscious effort to automatic behaviour.

### Level System (10 Levels)

| Level | Name | Points Required |
|-------|------|-----------------|
| 1 | Beginner | 0 |
| 2 | Starter | 500 |
| 3 | Achiever | 2,000 |
| 4 | Go-Getter | 5,000 |
| 5 | Performer | 10,000 |
| 6 | Rockstar | 25,000 |
| 7 | Champion | 50,000 |
| 8 | Elite | 75,000 |
| 9 | Master | 100,000 |
| 10 | Fastlaner | 150,000 |

### Badge Categories

**Streak Badges:**
- `first_blood` — Complete first task ever
- `on_fire_7` — 7-day streak (any type)
- `on_fire_30` — 30-day streak (any type)
- `rockstar` — 80+ consecutive days

**Achievement Badges:**
- `century_club` — Earn 100 points in one day
- `goal_getter` — Complete first goal (any level)
- `dream_starter` — Create first 7-year vision
- `planner_pro` — Complete daily planning 7 days in a row
- `visionary` — Have active goals at all 5 levels

**Category Badges:**
- `health_nut` — Complete 10 health-related tasks
- `wealth_builder` — Complete 10 wealth-related tasks
- (One badge per category)

**Alignment Badges:**
- `focused_week` — Complete a week with 80%+ goal-aligned tasks
- `laser_focused` — Complete 4 consecutive weeks with 80%+ alignment
- `no_fluff` — Complete 50 goal-aligned tasks with zero unlinked tasks

**Kaizen Badges:**
- `kaizen_starter` — Complete first Kaizen check-in
- `kaizen_week` — 7-day Kaizen streak
- `kaizen_master` — 30-day Kaizen streak
- `balanced_life` — Check all 6 areas in a single day

---

## Kaizen Daily Check-in

### Overview
The Kaizen Check-in is a lightweight end-of-day reflection that asks users if they improved in key life areas. It creates a second daily touchpoint (morning planning → evening reflection) and reinforces the connection between daily actions and goal categories.

### Philosophy
"Kaizen" (改善) means continuous improvement. The check-in isn't about perfection — it's about awareness. Did you move the needle today, even slightly?

### Life Areas (Maps to Goal Categories)
| Kaizen Area | Goal Category | Prompt |
|-------------|---------------|--------|
| Health & Fitness | HEALTH | "Did you improve your health today?" |
| Relationships | RELATIONSHIPS | "Did you nurture a relationship today?" |
| Wealth & Finances | WEALTH | "Did you improve your financial position today?" |
| Career & Skills | CAREER | "Did you grow professionally today?" |
| Personal Growth | PERSONAL_GROWTH | "Did you learn or grow personally today?" |
| Lifestyle | LIFESTYLE | "Did you improve your quality of life today?" |

### User Flow

```
User completes tasks or day ends
    ↓
Show Kaizen prompt (dashboard or notification)
    ↓
"Did you improve today?"
    ↓
□ Health & Fitness
□ Relationships  
□ Wealth & Finances
□ Career & Skills
□ Personal Growth
□ Lifestyle
    ↓
[Optional: Add a note about today]
    ↓
[Skip] [Save Reflection]
```

### Trigger Conditions
The Kaizen prompt appears:
1. **After completing MIT** — Natural moment of accomplishment
2. **End of day (6-9pm user timezone)** — If not yet completed today
3. **Manual access** — Via Progress page or dashboard widget

### Gamification

| Action | Points |
|--------|--------|
| Complete Kaizen check-in | +10 points |
| Check all 6 areas in one day | +25 bonus points |
| 7-day Kaizen streak | Badge + 50 bonus points |
| 30-day Kaizen streak | Badge + 200 bonus points |

### Data Model

```prisma
model KaizenCheckin {
  id             String   @id @default(cuid())
  userId         String   @map("user_id")
  checkinDate    DateTime @map("checkin_date") @db.Date
  health         Boolean  @default(false)
  relationships  Boolean  @default(false)
  wealth         Boolean  @default(false)
  career         Boolean  @default(false)
  personalGrowth Boolean  @default(false) @map("personal_growth")
  lifestyle      Boolean  @default(false)
  notes          String?  @db.Text
  pointsEarned   Int      @default(0) @map("points_earned")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, checkinDate])
  @@map("kaizen_checkins")
}
```

### API Endpoints

#### POST /api/kaizen
Create or update today's Kaizen check-in.

**Request:**
```json
{
  "health": true,
  "relationships": false,
  "wealth": true,
  "career": true,
  "personalGrowth": false,
  "lifestyle": true,
  "notes": "Great day for fitness and finances"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkin": { ... },
    "pointsEarned": 10,
    "streakCount": 5,
    "badgesEarned": []
  }
}
```

#### GET /api/kaizen
Get Kaizen check-ins with optional date filtering.

**Query params:**
- `date` — Specific date (YYYY-MM-DD)
- `startDate` / `endDate` — Date range
- `limit` — Number of records (default: 30)

#### GET /api/kaizen/stats
Get aggregated Kaizen statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCheckins": 45,
    "currentStreak": 12,
    "longestStreak": 18,
    "areaBreakdown": {
      "health": { "count": 30, "percentage": 67 },
      "relationships": { "count": 22, "percentage": 49 },
      "wealth": { "count": 28, "percentage": 62 },
      "career": { "count": 35, "percentage": 78 },
      "personalGrowth": { "count": 25, "percentage": 56 },
      "lifestyle": { "count": 20, "percentage": 44 }
    },
    "last30Days": [ ... ] // Array of daily checkins
  }
}
```

### UI Components

#### KaizenCheckinDialog
**Location:** `src/components/kaizen/kaizen-checkin-dialog.tsx`

Modal dialog for completing the daily check-in.

**Props:**
```typescript
interface KaizenCheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCheckin?: KaizenCheckin | null;
  onComplete?: (checkin: KaizenCheckin) => void;
}
```

**Features:**
- 6 toggle buttons for each area (with icons)
- Optional notes textarea
- Shows points to be earned
- Celebration animation on save
- Skip option (no points, no streak break)

#### KaizenInsightCard
**Location:** `src/components/kaizen/kaizen-insight-card.tsx`

Compact card showing Kaizen stats for dashboard/progress page.

**Props:**
```typescript
interface KaizenInsightCardProps {
  stats: KaizenStats;
  variant?: 'compact' | 'full';
}
```

**Displays:**
- Current streak with flame icon
- Visual grid of last 7/30 days
- Most/least improved areas
- Prompt to complete today if not done

#### KaizenHeatmap
**Location:** `src/components/kaizen/kaizen-heatmap.tsx`

GitHub-style contribution heatmap for Progress page.

**Shows:**
- Daily check-in history (90 days)
- Colour intensity based on areas checked (0-6)
- Hover tooltip with date and areas

### Integration Points

1. **Dashboard** — Show "Reflect on your day" prompt after MIT completion or in evening
2. **Progress Page** — Full Kaizen stats, heatmap, insights
3. **Weekly Review** — Summarise Kaizen data: "You improved health 5 of 7 days this week"
4. **Notifications (PWA)** — Optional evening reminder at user's preferred time

### Weekly Review Integration

During Weekly Review, display Kaizen insights:

```
📊 Your Week in Kaizen

You reflected on 6 of 7 days this week.

✅ Strongest area: Career (checked 6 days)
⚠️ Needs attention: Relationships (checked 2 days)

Daily breakdown:
 Mon ●●●●○○  (4 areas)
 Tue ●●●●●●  (6 areas) 🌟
 Wed ●●○○○○  (2 areas)
 Thu ●●●●●○  (5 areas)
 Fri ●●●●○○  (4 areas)
 Sat —        (skipped)
 Sun ●●●○○○  (3 areas)
```

---

## AI Features

### 1. Goal Sharpener
**Purpose:** Transform vague goals into SMART format (Specific, Measurable, Achievable, Relevant, Time-bound)

**Input:** Goal title and optional context

**Output Structure:**
```json
{
  "sharpened_title": "Concise goal title",
  "description": "Detailed description with success criteria",
  "measurable_outcomes": ["Outcome 1", "Outcome 2"],
  "suggested_timeframe": "e.g., 6 months",
  "first_step": "Immediate action to start"
}
```

**Appears in:**
- Goal creation form
- Goal detail page
- New vision creation flow

### 2. Task Suggester
**Purpose:** Generate daily tasks from a weekly goal

**Input:** Weekly goal ID or title

**Output Structure:**
```json
{
  "tasks": [
    {
      "title": "Task description",
      "priority": "MIT | PRIMARY | SECONDARY",
      "estimated_minutes": 30,
      "reasoning": "Why this task matters",
      "sequence": 1
    }
  ],
  "mit_rationale": "Why the suggested MIT is most important"
}
```

**Appears in:**
- Weekly goal detail page
- Daily planner (when linked to weekly goal)
- Empty task list prompt

### AI Rate Limiting
- Free tier: 5 AI interactions per day per user
- Reset at midnight (user's timezone)
- Tracked via Redis counter

### Estimated AI Costs
- Goal Sharpener: ~300 input tokens, ~200 output tokens
- Task Suggester: ~400 input tokens, ~400 output tokens
- Per interaction: ~$0.01-0.02 (Sonnet 4)
- Free tier max: ~$0.05-0.10/user/day

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── verify/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx           # Auth-protected layout
│   │   ├── dashboard/page.tsx   # Daily view
│   │   ├── goals/
│   │   │   ├── page.tsx         # Goal hierarchy view
│   │   │   └── [id]/page.tsx    # Goal detail
│   │   ├── review/
│   │   │   ├── weekly/page.tsx
│   │   │   └── monthly/page.tsx
│   │   ├── progress/page.tsx    # Stats, streaks, badges
│   │   └── settings/page.tsx
│   ├── (marketing)/
│   │   └── page.tsx             # Landing page
│   └── api/
│       ├── health/route.ts
│       ├── auth/[...nextauth]/route.ts
│       ├── tasks/
│       ├── goals/
│       ├── kaizen/
│       │   ├── route.ts              # GET, POST for check-ins
│       │   └── stats/route.ts        # GET aggregated stats
│       └── ai/
│           ├── sharpen/route.ts
│           └── suggest/route.ts
├── components/
│   ├── ui/                      # shadcn components (don't modify)
│   ├── layout/
│   ├── goals/
│   ├── tasks/
│   │   └── decision-compass-dialog.tsx  # Unlinked task friction prompt
│   ├── gamification/
│   │   └── lifestyle-insight-card.tsx  # Streak milestone messaging
│   ├── kaizen/
│   │   ├── kaizen-checkin-dialog.tsx   # Daily reflection modal
│   │   ├── kaizen-insight-card.tsx     # Stats card for dashboard
│   │   └── kaizen-heatmap.tsx          # GitHub-style activity grid
│   └── ai/
├── lib/
│   ├── db.ts                    # Prisma client singleton
│   ├── redis.ts                 # Redis client
│   ├── auth.ts                  # NextAuth config
│   ├── ai/
│   │   ├── client.ts            # Anthropic client
│   │   ├── prompts.ts           # System prompts
│   │   └── schemas.ts           # Response schemas
│   ├── gamification/
│   │   ├── points.ts
│   │   ├── streaks.ts
│   │   ├── badges.ts
│   │   └── levels.ts
│   ├── kaizen/
│   │   ├── checkin.ts            # Check-in logic and validation
│   │   └── stats.ts              # Stats aggregation helpers
│   └── utils.ts
├── hooks/
│   ├── useGoals.ts
│   ├── useTasks.ts
│   ├── useGamification.ts
│   ├── useKaizen.ts              # Kaizen check-in state and mutations
│   └── useAI.ts
└── types/
    ├── goals.ts
    ├── tasks.ts
    ├── gamification.ts
    └── kaizen.ts
```

---

## Database Schema

### Core Enums

```prisma
enum GoalCategory {
  HEALTH
  WEALTH
  RELATIONSHIPS
  CAREER
  PERSONAL_GROWTH
  LIFESTYLE
  OTHER
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  PAUSED
  ABANDONED
}

enum TaskPriority {
  MIT
  PRIMARY
  SECONDARY
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum StreakType {
  DAILY_PLANNING
  MIT_COMPLETION
  WEEKLY_REVIEW
  MONTHLY_REVIEW
}

enum AIInteractionType {
  GOAL_SHARPEN
  TASK_SUGGEST
}
```

### Key Relationships
- User → SevenYearVisions (one-to-many)
- SevenYearVision → ThreeYearGoals (one-to-many)
- ThreeYearGoal → OneYearGoals (one-to-many)
- OneYearGoal → MonthlyGoals (one-to-many)
- MonthlyGoal → WeeklyGoals (one-to-many)
- WeeklyGoal → DailyTasks (one-to-many)
- User → Streaks (one-to-many)
- User → EarnedBadges (one-to-many)
- User → AIInteractions (one-to-many)
- User → KaizenCheckins (one-to-many)

---

## Authentication

### Magic Link Flow
1. User enters email on `/login`
2. System sends magic link via Resend
3. User clicks link, redirected to `/verify`
4. On success, redirect to `/dashboard`

### Configuration
- Magic link expiry: 24 hours
- Session strategy: JWT (for PWA offline support)
- Session max age: 30 days

### Route Protection
Protected routes (require auth):
- `/dashboard`
- `/goals`
- `/review`
- `/progress`
- `/settings`

Public routes:
- `/` (landing page)
- `/login`
- `/verify`

---

## PWA Configuration

### Manifest Settings
- **Name:** Goalix
- **Short Name:** Goalix
- **Theme Colour:** #0f172a (slate-900)
- **Background Colour:** #0f172a
- **Display:** standalone
- **Orientation:** portrait
- **Start URL:** /dashboard

### Required Icons
- icon-192.png (192×192)
- icon-512.png (512×512)
- icon-maskable.png (512×512, with safe zone)
- favicon.ico
- apple-touch-icon.png

### Offline Support
- Offline fallback page at `/offline`
- Cache strategies for static and dynamic content
- Service worker managed by next-pwa

---

## Development Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Database GUI
npx prisma studio

# Create migration
npx prisma migrate dev --name [migration-name]

# Apply migrations (production)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Docker build and deploy
docker compose up -d --build
```

---

## Environment Variables

```bash
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://goalix_user:PASSWORD@sqm_postgres:5432/goalix_db

# Redis
REDIS_URL=redis://goalix-redis:6379

# Auth (NextAuth)
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Email (Resend for magic links)
RESEND_API_KEY=

# AI (Anthropic)
ANTHROPIC_API_KEY=
```

---

## Deployment Checklist

### Pre-Deploy
- [ ] `npm run build` succeeds locally
- [ ] `npm run lint` passes (CI will fail otherwise)
- [ ] `docker compose build` succeeds
- [ ] Health endpoint returns 200
- [ ] Database created on VPS
- [ ] DNS configured (see Domain Setup below)
- [ ] ANTHROPIC_API_KEY set
- [ ] EMAILIT_API_KEY set (for transactional emails)
- [ ] NEXTAUTH_SECRET generated (use `openssl rand -base64 32`)

### Domain Setup (Cloudflare)

1. **DNS Records** (in Cloudflare dashboard for goalzenix.com):
   - A record: `@` → `170.64.137.4` (DNS only, gray cloud initially)
   - CNAME record: `www` → `goalzenix.com` (DNS only)

2. **SSL Settings** (after Caddy gets certs):
   - SSL/TLS mode: Full (strict)
   - Can enable Cloudflare proxy (orange cloud) after HTTPS verified

### Deploy Steps
```bash
ssh root@170.64.137.4
cd /opt/apps/goalix
git pull
docker compose up -d --build
```

### Quick Deploy Command
```bash
# One-liner for routine deployments
ssh root@170.64.137.4 "cd /opt/apps/goalix && git pull && docker compose up -d --build"
```

### Database Migrations (Production)

Migrations are run manually for control over schema changes. The production container
uses Next.js standalone mode (no node_modules), so we run migrations separately:

```bash
# Run from VPS after docker compose up
docker run --rm --network n8n-docker-caddy_n8n_network \
  -v /opt/apps/goalix/prisma:/app/prisma -w /app \
  -e DATABASE_URL="postgresql://goalix_user:PASSWORD@sqm_postgres:5432/goalix_db" \
  node:22-alpine sh -c "npm i prisma@6.19.1 && npx prisma migrate deploy"
```

**Important:** Always pin Prisma to 6.x — the project is not yet compatible with Prisma 7.x
which has breaking changes (connection URL config moved to `prisma.config.ts`).

### Caddy Configuration

Current config in `/opt/n8n-docker-caddy/caddy_config/Caddyfile`:
```
# Goalzenix - Goal Tracking App
goalzenix.com, www.goalzenix.com {
    reverse_proxy goalix:3000
}
```

Reload Caddy after changes:
```bash
docker exec n8n-docker-caddy-caddy-1 caddy reload --config /config/Caddyfile
```

### Environment Variables (Production)

Key variables in `/opt/apps/goalix/.env`:
```env
NEXT_PUBLIC_APP_URL=https://goalzenix.com
NEXTAUTH_URL=https://goalzenix.com
DATABASE_URL=postgresql://goalix_user:PASSWORD@sqm_postgres:5432/goalix_db
REDIS_URL=redis://goalix-redis:6379
```

### Post-Deploy Verification
- [ ] HTTPS working at https://goalzenix.com
- [ ] Health check returns OK (`/api/health`)
- [ ] Can sign in / register
- [ ] Can create goals/tasks
- [ ] AI features working
- [ ] PWA installable on mobile

---

## Implementation Phases

Execute these tasks sequentially:

1. **Project Initialisation** — Next.js setup, dependencies, folder structure
2. **Database Schema** — Prisma schema, migrations
3. **Authentication** — Magic link auth with NextAuth.js
4. **Core UI & Daily Planner** — App shell, task management
5. **Goal Hierarchy** — Goal CRUD, hierarchy navigation
6. **Gamification** — Points, streaks, badges, levels
7. **AI Features** — Goal Sharpener, Task Suggester
8. **PWA & Deployment** — Service worker, Docker, production deploy

---

## Design Guidelines

### UI Principles
- Mobile-first responsive design
- Touch-friendly interactions
- Swipe gestures on mobile
- Satisfying completion animations
- Encouraging empty states (not sad empty boxes)

### Task Display
- **MIT Section:** Prominent, high visual weight, single task
- **Primary Tasks:** Medium emphasis, numbered 1-3
- **Secondary Tasks:** Lower visual weight, unlimited

### Colour Coding
- Use category colours consistently
- Priority indicators: MIT (high contrast), Primary (medium), Secondary (subtle)
- Progress indicators: Green for completion, amber for in-progress

### Animations
- Checkbox completion animation
- Confetti for MIT completion
- Level-up celebration modal
- Badge earn celebration

---

## API Conventions

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... }
}
```

Or for errors:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Rate Limiting
- AI endpoints: 5/day per user
- General API: No limits for MVP
- Tracked via Redis

---

## Notes

- Progress on parent goals is calculated from children completion
- All dates stored in UTC, displayed in user's timezone
- shadcn/ui components in `/components/ui/` should not be modified
- Streaks are strict — no grace period for MVP
- AI interactions are logged for usage tracking and prompt improvement
- **Decision Compass:** Track goal alignment ratio per user per week; surface in Weekly Review and Progress page
- Unlinked tasks are allowed but require explicit acknowledgement to prevent unconscious "action faking"

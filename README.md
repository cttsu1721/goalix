# Goalix

A goal tracking web application based on MJ DeMarco's 1/5/10 methodology. Transform 10-year dreams into daily action through structured goal hierarchy, gamification, and AI assistance.

**Production URL:** https://goalzenix.com

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript
- **UI:** shadcn/ui, Tailwind CSS (YORU ZEN dark theme)
- **Database:** PostgreSQL with Prisma 6.x ORM
- **Auth:** NextAuth.js (Magic Link / Passwordless)
- **AI:** Anthropic Claude API (Goal Sharpener, Task Suggester)
- **Caching:** Redis
- **Deployment:** Docker on DigitalOcean VPS

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open http://localhost:3000

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/goalix_db
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Email (for magic links)
RESEND_API_KEY=

# AI Features
ANTHROPIC_API_KEY=
```

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npx prisma studio    # Database GUI
npx prisma migrate dev --name <name>  # Create migration
```

## Deployment

### CI/CD Pipeline

GitHub Actions handles CI and deployment:

- **CI Workflow** (`ci.yml`): Runs on all PRs - linting, type checking, build verification
- **Deploy Workflow** (`deploy.yml`): Runs on push to `main` - deploys to production VPS

### Manual Deployment

```bash
ssh root@170.64.137.4
cd /opt/apps/goalix
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database Migrations (Production)

Migrations are run manually to ensure control over schema changes:

```bash
docker run --rm --network n8n-docker-caddy_n8n_network \
  -v /opt/apps/goalix/prisma:/app/prisma -w /app \
  -e DATABASE_URL="$DATABASE_URL" \
  node:22-alpine sh -c "npm i prisma@6.19.1 && npx prisma migrate deploy"
```

**Important:** Always pin Prisma version to 6.x to match project configuration.

## Architecture

```
src/
├── app/
│   ├── (auth)/         # Login, verify pages
│   ├── (app)/          # Protected app pages (dashboard, goals, etc.)
│   ├── (marketing)/    # Landing page
│   └── api/            # API routes
├── components/
│   ├── ui/             # shadcn/ui components (don't modify)
│   ├── tasks/          # Task-related components
│   ├── goals/          # Goal-related components
│   └── gamification/   # Points, badges, levels
├── hooks/              # React Query hooks
├── lib/                # Utilities, clients, config
└── types/              # TypeScript types
```

## Key Features

### Core Functionality
- **Goal Hierarchy:** Dream → 5-Year → 1-Year → Monthly → Weekly → Daily Tasks
- **Daily Planning:** MIT (Most Important Task) + Primary + Secondary task priorities
- **Decision Compass:** Friction dialog for unlinked tasks to prevent "action faking"

### Gamification System
- **Points:** Earn points for completing tasks (MIT: 100, Primary: 50, Secondary: 25)
- **Streaks:** Track daily planning, MIT completion, reviews, and Kaizen check-ins
- **Badges:** Achievement badges for milestones and consistent behavior
- **Levels:** 10 levels from "Beginner" to "Fastlaner" (150,000 points)
- **Lifestyle Insights:** Motivational messages at streak milestones (7/14/30/60/90 days)

### Kaizen Daily Check-in
- **6 Life Areas:** Health, Relationships, Wealth, Career, Personal Growth, Lifestyle
- **Kaizen Heatmap:** GitHub-style contribution grid showing check-in history
- **Balance Tracking:** Bonus points for checking all 6 areas in a day

### Reviews
- **Weekly Review:** Task completion stats, MIT performance, goal alignment, Kaizen summary
- **Monthly Review:** Weekly breakdowns, goal progress, Kaizen insights, reflection wizard

### AI Features
- **Goal Sharpener:** Transform vague goals into SMART format
- **Task Suggester:** Generate daily tasks from weekly goals
- **Dream Builder:** AI-guided flow for creating 10-year visions

### Technical
- **PWA:** Installable, offline-capable progressive web app
- **Dark Theme:** YORU ZEN design system with lantern accent colors

## Documentation

- **CLAUDE.md:** Full project specification and AI instructions
- **CHANGELOG.md:** Version history and updates

## License

Private - All rights reserved

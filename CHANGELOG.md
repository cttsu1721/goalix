# Changelog

All notable changes to Goalix are documented here.

## [Unreleased]

### Fixed

#### CI/CD Pipeline Fixes (2024-12-30)

**ESLint Errors Resolved:**

- `TaskEditModal.tsx`: Refactored to fix `react-hooks/set-state-in-effect` error
  - Extracted inner `TaskEditForm` component that initializes state from props
  - Uses `key={task.id}` to force remount when task changes (avoiding useEffect for prop-to-state sync)

- `PlanDayModal.tsx`: Removed unused `getCurrentPriority` function

- `LevelUpModal.tsx`: Fixed `react/no-unescaped-entities` by escaping apostrophe (`You've` → `You&apos;ve`)

- `BadgeEarnedModal.tsx`: Refactored to fix `react-hooks/set-state-in-effect` and ref access during render
  - Extracted `BadgeEarnedContent` inner component
  - Uses `key={badge.name}` for remounting with fresh animation state

**Deploy Workflow Fixes:**

- Changed `docker-compose` to `docker compose` (Docker Compose V2 syntax)
- Fixed health check to run inside container via `docker compose exec -T app wget`
  - Container uses `expose` (container-to-container only), not `ports`
- Removed automatic migrations from deploy workflow
  - Production container has no node_modules (standalone build)
  - `npx prisma` was downloading Prisma 7.x which has breaking changes
  - Migrations now documented as manual step with pinned version

### Technical Decisions

**Prisma Version: Staying on 6.x**

Evaluated Prisma 7.x upgrade but decided to remain on 6.19.1:

- Prisma 7 requires `prisma.config.ts` (breaking change from schema.prisma URL config)
- Performance gains (10-20%) negligible for Goalix's simple queries
- Stability preferred over incremental improvements
- Will revisit in 3-6 months when v7 ecosystem matures

### Documentation

- Updated `README.md` with proper project documentation
- Updated `CLAUDE.md` deployment section with correct Docker Compose V2 commands
- Added manual migration instructions with pinned Prisma version
- Created `CHANGELOG.md`

---

## [0.1.0] - 2024-12-29

### Added

- Initial MVP release
- Goal hierarchy (Dream → 5-Year → 1-Year → Monthly → Weekly → Daily)
- Daily task management with MIT/Primary/Secondary priorities
- Gamification system (points, streaks, badges, levels)
- AI features (Goal Sharpener, Task Suggester)
- Magic link authentication
- YORU ZEN dark theme design system
- PWA support
- Docker deployment configuration
- GitHub Actions CI/CD pipeline

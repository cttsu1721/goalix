# Goalzenix UX Improvement Plan

> Generated: 2026-01-03
> **Last Updated: 2026-01-09**
> **Status: Active Development**
> Total Items: 95 improvements across 15 categories
> **Completed: 87 items** | **Remaining: 8 items**

---

## 🚀 NEXT SESSION - Start Here

**Priority items for the next development session:**

### ✅ Quick Wins (Completed 2026-01-07)
| ID | Item | Effort | Status |
|----|------|--------|--------|
| **2.3** | Keyboard shortcut Cmd+N for new task | XS | ✅ Done |
| **11.3** | "Recovery" message after streak loss | XS | ✅ Done (existed) |
| **14.1** | Settings gear icon in header | XS | ✅ Done |
| **5.2** | Swipe gesture hint animation | S | ✅ Done |

### ✅ High-Impact Features (Completed 2026-01-07)
| ID | Item | Effort | Status |
|----|------|--------|--------|
| **1.1** | 3-step onboarding wizard | L | ✅ Done |
| **4.2** | Streak freeze (1 per week) | M | ✅ Done |
| **3.2** | Breadcrumb trail for goals | S | ✅ Done |
| **5.4** | Pull-to-refresh | S | ✅ Done |
| **14.4** | Cmd+K command palette | L | ✅ Done |

### Next Priority Items
| ID | Item | Priority | Effort | Status |
|----|------|----------|--------|--------|
| **2.2** | Floating action button (mobile quick-add) | P0 | S | ✅ Done |
| **10.2** | Respect prefers-reduced-motion | P0 | S | ✅ Done |
| **3.3** | "Create child goal" button | P1 | S | ✅ Done |
| **2.1** | Drag-to-promote task to MIT | P1 | M | ✅ Done |
| **5.3** | Haptic feedback on complete/drag | P1 | S | ✅ Done |

### Files to Reference
- `src/components/tasks/TaskItem.tsx` - Task keyboard shortcuts + drag functionality
- `src/components/tasks/MitCard.tsx` - MIT card with drop zone for drag-to-promote
- `src/components/tasks/TaskList.tsx` - Task list with draggable prop passthrough
- `src/components/tasks/FloatingActionButton.tsx` - Mobile FAB pattern
- `src/components/gamification/MobileStatsBar.tsx` - Mobile component pattern
- `src/app/(app)/dashboard/page.tsx` - Dashboard with promotion logic (handlePromoteToMit)
- `src/components/gamification/LevelUpModal.tsx` - Celebration modal pattern
- `src/components/onboarding/OnboardingWizard.tsx` - Onboarding wizard pattern
- `src/components/onboarding/ContextualTip.tsx` - Dismissible contextual tips
- `src/components/layout/CommandPalette.tsx` - Command palette pattern
- `src/components/goals/GoalBreadcrumb.tsx` - Breadcrumb navigation pattern
- `src/hooks/useReducedMotion.ts` - Reduced motion preference hook

---

## Overview

This document captures all identified UX improvements for Goalzenix, organized by category with implementation priority and effort estimates.

### Priority Legend
- **P0**: Critical - Blocking user success
- **P1**: High - Significant impact on retention/satisfaction
- **P2**: Medium - Nice-to-have improvements
- **P3**: Low - Future considerations

### Effort Legend
- **XS**: < 2 hours
- **S**: 2-4 hours
- **M**: 4-8 hours (1 day)
- **L**: 1-3 days
- **XL**: 3+ days

---

## 1. Onboarding & First-Time Experience

**Goal**: Reduce time-to-value for new users from signup to first completed MIT.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 1.1 | Add 3-step onboarding wizard (Vision → 1-Year Goal → First Task) | P0 | L | ✅ Done |
| 1.2 | Interactive tutorial cards on empty dashboard | P1 | M | ✅ Done |
| 1.3 | "How it works" modal with visual cascade diagram | P1 | S | ✅ Done |
| 1.4 | "Try with sample goals" option for exploration | P2 | M | ✅ Done |
| 1.5 | First MIT completion celebration with explanation | P1 | S | ✅ Done |
| 1.6 | Contextual tips ("Why link tasks to goals?") | P2 | M | ✅ Done |

**Success Metrics**:
- Onboarding completion rate > 80%
- First task created within 5 minutes
- First MIT completed within 24 hours

---

## 2. Daily Task Management

**Goal**: Reduce friction in daily planning and task completion.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 2.1 | Drag-to-promote any task to MIT | P1 | M | ✅ Done |
| 2.2 | Floating action button for quick-add (mobile) | P0 | S | ✅ Done |
| 2.3 | Keyboard shortcut Cmd+N for new task | P1 | XS | ✅ Done |
| 2.4 | Timeline view option using time estimates | P2 | L | Todo |
| 2.5 | End-of-day prompt: "Move X incomplete tasks to tomorrow?" | P1 | M | ✅ Done |
| 2.6 | "Reschedule all" bulk action for overdue tasks | P1 | S | ✅ Done |
| 2.7 | Show note preview on task row, expand on tap | P2 | S | ✅ Done |
| 2.8 | Recurring tasks (daily, weekly, custom) | P1 | L | ✅ Done |
| 2.9 | Subtasks/checklist items within tasks | P2 | L | ✅ Done |
| 2.10 | Drag-to-calendar for time blocking | P3 | XL | Todo |

**Success Metrics**:
- Task creation time < 10 seconds
- Daily planning completion rate > 70%
- Overdue task count reduced by 50%

---

## 3. Goal Hierarchy Navigation

**Goal**: Make the cascading goal structure intuitive and navigable.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 3.1 | Tree/mind-map visualization (ReactFlow/D3) | P1 | XL | Todo |
| 3.2 | Breadcrumb trail: "7Y → 3Y → 1Y → Monthly → Weekly" | P0 | S | ✅ Done |
| 3.3 | "Create child goal" button on each goal card | P1 | S | ✅ Done |
| 3.4 | Global goal search/filter across all levels | P1 | M | ✅ Done |
| 3.5 | "Unlinked goals" warning section | P2 | S | ✅ Done |
| 3.6 | Progress bars showing % of child goals completed | P1 | M | ✅ Done |
| 3.7 | Goal archiving (hide without deleting) | P2 | S | ✅ Done |
| 3.8 | Show sibling goals when viewing one goal | P2 | M | ✅ Done |

**Success Metrics**:
- Navigation clicks to reach any goal < 3
- Goal orphan rate < 10%
- Users create goals at 3+ hierarchy levels

---

## 4. Gamification Enhancements

**Goal**: Make progress feel rewarding and maintain engagement.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 4.1 | "What can I do with points?" explanation (level unlocks) | P2 | S | ✅ Done |
| 4.2 | Streak freeze (1 per week) to prevent frustration | P0 | M | ✅ Done |
| 4.3 | "Next badge to earn" with progress hints | P1 | M | ✅ Done |
| 4.4 | Daily/weekly challenges for bonus XP | P2 | L | Todo |
| 4.5 | Anonymous leaderboards or friend challenges | P3 | XL | Todo |
| 4.6 | Confetti animation for MIT/streak milestones | P1 | S | ✅ Done |
| 4.7 | "Share badge" to social media | P3 | M | Todo |
| 4.8 | Evening Kaizen check-in prompt/notification | P1 | M | ✅ Done |

**Success Metrics**:
- 7-day streak retention > 60%
- Badge engagement (views) > 40%
- Kaizen check-in rate > 50%

---

## 5. Mobile Experience

**Goal**: Deliver a native-app-quality experience on mobile devices.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 5.1 | Simplify bottom nav to 4 main + "More" overflow | P2 | S | ✅ Done |
| 5.2 | Swipe gesture hint animation on first interaction | P1 | S | ✅ Done |
| 5.3 | Haptic feedback on complete, drag, errors | P1 | S | ✅ Done |
| 5.4 | Pull-to-refresh on task/goal lists | P0 | S | ✅ Done |
| 5.5 | Day view default on mobile with swipe navigation | P2 | M | ✅ Done |
| 5.6 | Auto-scroll input into view when keyboard opens | P1 | S | ✅ Done |
| 5.7 | iOS/Android widget for today's MIT | P2 | XL | Todo |
| 5.8 | Sync status indicator (cloud icon) | P1 | S | ✅ Done |

**Success Metrics**:
- Mobile session length parity with desktop
- Touch target success rate > 95%
- PWA install rate > 20%

---

## 6. Cognitive Load Reduction

**Goal**: Simplify interfaces to reduce mental effort.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 6.1 | Progressive disclosure: Title first, then optional fields | P1 | M | ✅ Done |
| 6.2 | Collapsible stats panel → single "Today's score" summary | P2 | M | ✅ Done |
| 6.3 | "Suggested" categories based on existing goals | P2 | M | ✅ Done |
| 6.4 | Priority descriptions ("MIT = #1 thing that moves the needle") | P1 | XS | ✅ Done |
| 6.5 | "Focus mode" showing only today + tomorrow | P2 | M | ✅ Done |
| 6.6 | Unified "Quick glance" dashboard summary card | P2 | M | ✅ Done |

**Success Metrics**:
- Task creation abandonment < 10%
- Time to complete daily planning < 5 minutes
- User-reported confusion tickets reduced

---

## 7. Decision Compass (Goal Alignment)

**Goal**: Reinforce goal-aligned behavior without being punitive.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 7.1 | Alignment score on dashboard ("85% aligned today") | P1 | S | ✅ Done |
| 7.2 | Weekly alignment trend sparkline in Progress | P2 | M | ✅ Done |
| 7.3 | "Life maintenance" category (exempt from alignment) | P1 | S | ✅ Done |
| 7.4 | "Perfect alignment" badge for 100% days | P2 | S | ✅ Done |
| 7.5 | AI-suggested goal linking based on task title | P2 | M | ✅ Done |

**Success Metrics**:
- Goal-linked task rate > 70%
- Users acknowledge alignment prompts > 80%
- Weekly alignment trend positive

---

## 8. Review Flows

**Goal**: Make reflection habitual and valuable.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 8.1 | Structured weekly review prompts ("What went well?") | P1 | M | ✅ Done |
| 8.2 | Push notification on Sunday evening for review | P1 | S | ✅ Done |
| 8.3 | 3-section monthly review: Reflect, Celebrate, Plan | P2 | L | ✅ Done |
| 8.4 | Past reviews timeline view | P2 | M | ✅ Done |
| 8.5 | Separate "Review" (past) from "Plan" (future) flows | P2 | M | ✅ Done |
| 8.6 | Allow goal edit/pause/abandon during review | P1 | M | ✅ Done |

**Success Metrics**:
- Weekly review completion > 50%
- Monthly review completion > 40%
- Users who complete reviews have 2x retention

---

## 9. AI Features

**Goal**: Make AI assistance feel helpful, not gimmicky.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 9.1 | "Regenerate" option if first suggestion poor | P1 | S | ✅ Done |
| 9.2 | Context-aware suggestions (consider existing tasks) | P1 | M | ✅ Done |
| 9.3 | Before/after comparison for Goal Sharpener | P2 | M | ✅ Done |
| 9.4 | "Unlock more" premium upsell for rate limit | P2 | S | ✅ Done |
| 9.5 | Thumbs up/down feedback on AI suggestions | P1 | S | ✅ Done |
| 9.6 | AI weekly review assistant | P3 | L | Todo |

**Success Metrics**:
- AI suggestion acceptance rate > 60%
- AI feature usage per active user > 2/week
- Positive feedback ratio > 70%

---

## 10. Accessibility

**Goal**: Ensure WCAG 2.1 AA compliance minimum.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 10.1 | Add icons/patterns alongside color indicators | P1 | M | ✅ Done |
| 10.2 | Respect `prefers-reduced-motion` for animations | P0 | S | ✅ Done |
| 10.3 | aria-live regions for dynamic content updates | P1 | M | ✅ Done |
| 10.4 | Improve logical tab sequence/focus order | P1 | M | ✅ Done |
| 10.5 | Increase touch targets to 48px minimum (WCAG AAA) | P1 | M | ✅ Done |
| 10.6 | Support `forced-colors` media query | P2 | S | ✅ Done |

**Success Metrics**:
- Lighthouse accessibility score > 95
- Zero critical WCAG violations
- Screen reader usability verified

---

## 11. Emotional Design

**Goal**: Create moments of delight and maintain motivation.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 11.1 | Sound effects on completion (optional setting) | P2 | S | ✅ Done |
| 11.2 | Bigger celebration animations for milestones | P1 | M | ✅ Done |
| 11.3 | "Recovery" message after streak loss: "Start fresh today!" | P1 | XS | ✅ Done |
| 11.4 | "This month so far" progress summary card | P2 | M | ✅ Done |
| 11.5 | Vision board with images/inspiration | P3 | L | Todo |
| 11.6 | Motivational quotes (optional setting) | P3 | S | ✅ Done |
| 11.7 | Show vision quote when completing MIT | P2 | S | ✅ Done |

**Success Metrics**:
- User sentiment score (NPS) > 50
- Feature engagement with celebrations > 30%
- Streak recovery rate after break > 40%

---

## 12. Settings & Personalization

**Goal**: Let users customize their experience.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 12.1 | Configurable MIT limit (1-3) for power users | P2 | S | ✅ Done |
| 12.2 | Granular notification preferences (push/email) | P1 | M | ✅ Done |
| 12.3 | Timezone display with manual override option | P1 | S | ✅ Done |
| 12.4 | Accent color picker beyond presets | P3 | M | Todo |
| 12.5 | i18n infrastructure for language support | P2 | XL | Todo |
| 12.6 | JSON/CSV data export for goals/tasks | P1 | M | ✅ Done |

**Success Metrics**:
- Settings page visit rate > 30%
- Custom preferences set per user > 2
- Data export requests fulfilled 100%

---

## 13. Performance & Polish

**Goal**: Create a fast, reliable, frustration-free experience.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 13.1 | Skeleton loaders for all data-heavy pages | P0 | M | ✅ Done |
| 13.2 | Optimistic UI updates (immediate, rollback on error) | P1 | L | ✅ Done |
| 13.3 | "Unsaved changes" warning on modal close | P1 | S | ✅ Done |
| 13.4 | 5-second "Undo" toast after task completion | P0 | S | ✅ Done |
| 13.5 | Reduced-motion fallback for drag-drop (buttons) | P2 | M | ✅ Done |

**Success Metrics**:
- Time to interactive < 2 seconds
- Perceived loading time < 500ms (skeleton)
- Undo usage rate when offered > 5%

---

## 14. Information Architecture

**Goal**: Make navigation intuitive and discoverable.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 14.1 | Settings gear icon in header (not just sidebar) | P2 | XS | ✅ Done |
| 14.2 | Clarify Progress vs Dashboard distinction or merge | P2 | M | ✅ Done |
| 14.3 | "Review" prompt on dashboard when due | P1 | S | ✅ Done |
| 14.4 | Cmd+K command palette for global navigation | P0 | L | ✅ Done |
| 14.5 | Rename: "Today" (dashboard) vs "Week Planner" | P2 | XS | ✅ Done |

**Success Metrics**:
- Navigation success rate > 90%
- Feature discoverability > 70%
- Support tickets for "can't find X" reduced

---

## 15. Social & Accountability (Future)

**Goal**: Add optional social features for motivation.

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| 15.1 | Accountability partner feature | P3 | XL | Todo |
| 15.2 | Share goal milestones to social media | P3 | M | Todo |
| 15.3 | AI-powered weekly "coach" check-ins | P3 | L | Todo |
| 15.4 | Public goal showcase (opt-in community) | P3 | XL | Todo |

**Success Metrics**:
- Partner pairing rate > 10%
- Social shares per milestone > 5%
- Coach engagement > 20%

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
Focus: Critical UX fixes that unblock user success

| ID | Item | Effort |
|----|------|--------|
| 1.1 | Onboarding wizard | L |
| 2.2 | Quick-add FAB (mobile) | S |
| 3.2 | Goal breadcrumb trail | S |
| 4.2 | Streak freeze | M |
| 5.4 | Pull-to-refresh | S |
| 10.2 | Reduced motion support | S |
| 13.1 | Skeleton loaders | M |
| 13.4 | Undo toast | S |
| 14.4 | Command palette | L |

**Estimated Effort**: ~5-6 days

### Phase 2: Engagement (Week 3-4)
Focus: Features that improve retention and habit formation

| ID | Item | Effort |
|----|------|--------|
| 1.5 | First MIT celebration | S |
| 2.5 | End-of-day task carry-over | M |
| 2.8 | Recurring tasks | L |
| 4.3 | Next badge to earn | M |
| 4.6 | Confetti animations | S |
| 4.8 | Kaizen evening prompt | M |
| 7.1 | Alignment score on dashboard | S |
| 8.1 | Structured weekly review | M |
| 11.3 | Streak recovery message | XS |

**Estimated Effort**: ~5-6 days

### Phase 3: Polish (Week 5-6)
Focus: Refinement and quality-of-life improvements

| ID | Item | Effort |
|----|------|--------|
| 2.1 | Drag-to-promote MIT | M | ✅ Done |
| 2.3 | Cmd+N keyboard shortcut | XS | ✅ Done |
| 3.1 | Goal tree visualization | XL |
| 5.2 | Swipe gesture hints | S | ✅ Done |
| 5.3 | Haptic feedback | S | ✅ Done |
| 6.1 | Progressive form disclosure | M |
| 9.1 | AI regenerate option | S | ✅ Done |
| 9.5 | AI feedback thumbs | S |
| 10.1 | Icon + color indicators | M |

**Estimated Effort**: ~6-7 days

### Phase 4: Advanced (Week 7+)
Focus: Power user features and differentiation

| ID | Item | Effort |
|----|------|--------|
| 2.9 | Subtasks/checklists | L | ✅ Done |
| 3.6 | Goal progress bars | M |
| 5.7 | Mobile widget | XL |
| 8.3 | 3-section monthly review | L |
| 11.5 | Vision board | L |
| 12.5 | i18n infrastructure | XL |
| 13.2 | Optimistic updates | L | ✅ Done |
| 15.1 | Accountability partners | XL |

**Estimated Effort**: ~10+ days

---

## Quick Wins (< 2 hours each)

Grab these whenever you have spare time:

- [x] 2.3 - Cmd+N keyboard shortcut ✅
- [ ] 6.4 - Priority descriptions in task create
- [x] 11.3 - Streak recovery message ✅
- [x] 14.1 - Settings icon in header ✅
- [x] 14.5 - Rename "Today" vs "Week Planner" ✅
- [x] 5.2 - Swipe gesture hint animation ✅

---

## Tracking

### Completed

#### Phase 1: Foundation
- [x] **13.1** Skeleton loaders for goals/vision pages
- [x] **13.4** 5-second "Undo" toast after task completion (already existed)
- [x] **10.4** Keyboard shortcuts for task navigation (Space/Enter to toggle/edit)
- [x] **1.6** Contextual tips integrated (decision_compass, mit_importance, streak_building, goal_hierarchy)

#### Phase 2: Engagement
- [x] **1.5** First MIT celebration modal with confetti
- [x] **2.5** End-of-day task carry-over modal
- [x] **2.8** Recurring tasks (daily, weekly, custom)
- [x] **4.3** Next badge to earn card on Progress page
- [x] **4.6** Confetti animations for level-up and badges
- [x] **4.8** Kaizen evening prompt (6-11pm reminder)
- [x] **7.1** Alignment score on dashboard with status badges
- [x] **8.1** Structured weekly review prompts (Wins/Challenges/Next Week)
- [x] **8.3** Enhanced monthly review with data-driven prompts
- [x] **11.3** Streak recovery messaging (via Lifestyle Insight cards)

#### Quick Wins (2026-01-07)
- [x] **2.3** Keyboard shortcut Cmd+N for new task
- [x] **5.2** Swipe gesture hint animation for mobile
- [x] **14.1** Settings gear icon in PageHeader (desktop)

#### High-Impact Features (2026-01-07)
- [x] **1.1** 3-step onboarding wizard (OnboardingWizard.tsx)
- [x] **2.1** Drag-to-promote task to MIT (HTML5 drag-drop in TaskItem → MitCard)
- [x] **2.2** Floating action button for mobile quick-add (FloatingActionButton.tsx)
- [x] **3.2** Breadcrumb navigation for goals (GoalBreadcrumb.tsx)
- [x] **3.3** Create child goal button on goal cards (GoalCard.tsx, VisionCard.tsx)
- [x] **4.2** Streak freeze feature (User model + streaks.ts logic)
- [x] **5.4** Pull-to-refresh on goals pages (AppShell + page integration)
- [x] **14.4** Cmd+K command palette (CommandPalette.tsx)

#### Accessibility
- [x] **10.2** Reduced motion support (useReducedMotion hook, skips confetti/animations)
- [x] **10.4** Keyboard navigation for tasks (Space/c=toggle, Enter/e=edit)
- [x] **10.6** Forced-colors media query support (forced-colors.css)
- [x] Focus-visible ring styling for keyboard users
- [x] ARIA labels on interactive elements
- [x] tabIndex management to prevent double-tabbing

#### Emotional Design & Delight
- [x] **11.1** Sound effects on completion (useSoundEffects hook, optional in settings)
- [x] **11.4** "This month so far" progress summary card (MonthSoFarCard.tsx)
- [x] **11.7** Show vision quote when completing MIT (FirstMitCelebration.tsx)

#### Cognitive Load Reduction
- [x] **6.5** Focus mode toggle (useFocusMode hook, dashboard integration, hides overdue tasks)

#### Task Management
- [x] **2.9** Subtasks/checklists within tasks (Subtask model, CRUD API, SubtaskList.tsx)

#### Performance & Polish
- [x] **13.2** Optimistic UI updates for task mutations (complete, uncomplete, delete, update, subtask operations)
- [x] **13.5** Reduced-motion fallback for drag-drop (buttons for promote-to-MIT when prefers-reduced-motion enabled)

#### Tasks & Notes
- [x] **2.7** Note preview on task row (TaskNotePreview.tsx, truncated preview)

#### Goals
- [x] **3.5** Unlinked goals warning section (UnlinkedGoalsWarning.tsx, /api/goals/unlinked)
- [x] **3.7** Goal archiving with show/hide toggle (ARCHIVED status, showArchived state)

#### Gamification
- [x] **4.1** Points explainer dialog (PointsExplainer.tsx)

#### AI Features
- [x] **9.2** Context-aware AI suggestions (passes existing tasks to AI to avoid duplicates)
- [x] **9.4** Premium upsell for AI rate limits (PremiumUpsell integration in AI modals)

#### Information Architecture
- [x] **14.5** Rename "Today" vs "Week Planner" for navigation clarity (Sidebar, MobileNav, CommandPalette, PageIntroCard)

#### Decision Compass
- [x] **7.2** Weekly alignment trend sparkline (AlignmentTrendCard.tsx with WeeklySparkline, /api/stats/alignment endpoint, 12-week history with trend analysis)
- [x] **7.4** Perfect alignment badge for 100% goal-linked days (wired dailyAlignmentPercentage to checkAllBadges)

#### Mobile
- [x] **5.1** Simplified bottom nav (4 main items + More overflow menu) - MobileNav.tsx
- [x] **5.x** MobileStatsBar component (streak, points, alignment, level)
- [x] Links to /progress on tap for full stats access

### In Progress
_None currently_

### Blocked
_None currently_

---

## Appendix: User Research Needed

Before implementing some features, validate with users:

1. **Onboarding length** - Is 3 steps right or too long?
2. **Streak freeze** - Would users prefer 1/week or earn-based?
3. **MIT limit** - Do power users want 2-3 MITs?
4. **Social features** - Is accountability a priority?
5. **Time blocking** - Is calendar integration wanted?

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-09 | **Contextual Tips** - 1.6 integrated ContextualTip component (already existed) throughout the app; added `decision_compass` tip in TaskCreateModal when no goal selected; added `mit_importance` tip in empty MitCard state; added `streak_building` tip in StatsPanel when streak ≤ 3; added `goal_hierarchy` tip on both Vision and Goals pages; tips are dismissible and remember dismissed state in localStorage |
| 2026-01-09 | **Try with Sample Goals** - 1.4 added "Try with Sample Goals" option for new users to explore the app; created comprehensive sample data in `/src/lib/sample-goals.ts` with 3 vision tracks (Career/SaaS, Health/Marathon, Personal Growth/Leadership); each cascade from 7Y vision → 3Y → 1Y → monthly → weekly → tasks; POST `/api/sample-goals` creates all sample data, DELETE clears it; option shown in OnboardingWizard final step and VisionPage empty state |
| 2026-01-08 | **Clarify Progress vs Dashboard** - 14.2 renamed "Progress" to "Stats & Streaks" in Sidebar and "Stats" in MobileNav for clearer purpose distinction; updated Progress page title to "Stats & Achievements" with descriptive subtitle; Dashboard = daily task execution ("Today"), Progress = gamification/achievements view; added "View Stats" hint text to MobileStatsBar for clearer affordance |
| 2026-01-08 | **Separate Review/Plan Flows** - 8.5 restructured weekly review wizard with tabbed interface; "Review Past" tab (3 steps: Stats, Wins, Challenges) for past-focused reflection; "Plan Ahead" tab (2 steps: Focus, Actions) for future-focused planning; users can complete either or both flows independently; EmptyReviewState offers both "Review Past Week" and "Plan Ahead" entry points; visual completion checkmarks on tabs; mode-specific navigation and step indicators |
| 2026-01-08 | **Past Reviews Timeline** - 8.4 added `/review/history` page showing chronological history of weekly and monthly reviews; uses existing ReviewTimeline component; new `useReviewHistory` and `useAllReviewHistory` hooks fetch from `/api/review/history` endpoint; "Past Reviews" button added to weekly review page header; shows review type, date, wins/reflections, and ratings in timeline format |
| 2026-01-08 | **Sibling Goals Navigation** - 3.8 added sibling goals section on goal detail page; new `/api/goals/[id]/siblings` endpoint fetches goals with same parent; `useSiblingGoals` hook with React Query caching; `SiblingGoalsSection` component shows up to 5 related goals with progress bars; helps users navigate between goals at the same level without going back to parent |
| 2026-01-08 | **Suggested Categories** - 6.3 added category suggestions in GoalCreateModal based on user's existing goals; new `/api/user/category-stats` endpoint aggregates category usage across all goal levels (visions, 3-year, 1-year, monthly, weekly); `useCategoryStats` hook with React Query caching; shows top 3 most-used categories as clickable chips above category select; helps users stay consistent with their goal focus areas |
| 2026-01-08 | **Collapsible Stats Panel** - 6.2 integrated TodayScoreSummary into StatsPanel; shows composite score (0-100) based on task completion, goal alignment, and streak bonus; collapsible expanded view shows score breakdown; "Show/Hide Details" toggle for detailed stats section (streak, level, badges, kaizen, etc.); reduces cognitive load by presenting key metrics at a glance |
| 2026-01-08 | **Motivational Quotes** - 11.6 added optional daily inspirational quotes on dashboard; 50+ curated goal-oriented quotes (action, consistency, progress, focus, resilience themes); MotivationalQuote component with daily rotation and refresh button; toggle in Settings > Daily Inspiration; quotes show below YearTargetHeader when enabled; includes getDailyQuote() for consistent daily quote and getRandomQuote() for manual refresh |
| 2026-01-08 | **Mobile Day Navigation** - 5.5 added DayNavigation component to dashboard for mobile users; prev/next buttons to navigate between days; displays date with "Today/Yesterday/Tomorrow" labels; quick "Today" return button; Week view link; mobile defaults to day view with date navigation (desktop stays on today) |
| 2026-01-08 | **AI Goal Link Suggestions** - 7.5 added intelligent goal linking in TaskCreateModal; when user types a task title (5+ chars) without selecting a goal, AI suggests the best matching weekly goal after 1.5s debounce; uses Claude 3.5 Haiku for fast/cheap matching; shows suggestion banner with accept/dismiss buttons; includes loading state |
| 2026-01-08 | **Goal Sharpener Before/After** - 9.3 added side-by-side comparison in GoalSharpenModal; shows original goal (Before) alongside AI-sharpened version (After) in responsive grid layout; purple accent on sharpened version with sparkle icon; improves clarity of AI improvements |
| 2026-01-08 | **Weekly Alignment Trend** - 7.2 added AlignmentTrendCard.tsx with WeeklySparkline SVG visualization; new /api/stats/alignment endpoint fetches 12-week history; shows alignment rate per week, overall/recent averages, and trend direction (improving/declining/stable); displays on Progress page after MonthSoFarCard |
| 2026-01-08 | **Reduced-Motion Drag Fallback** - 13.5 added button-based "Promote to MIT" alternative for users with prefers-reduced-motion enabled; appears in TaskItem.tsx when dragging is available but user prefers reduced motion; ensures drag-to-promote functionality remains accessible |
| 2026-01-08 | **Mobile Nav Simplified** - 5.1 verified MobileNav.tsx already has 4 main items (Today, Vision, Goals, Progress) + More overflow menu (This Week, Weekly Review, Monthly Review, Settings); marked as complete |
| 2026-01-08 | **Context-Aware AI Suggestions** - 9.2 AI task suggester now considers existing tasks linked to the weekly goal; passes pending/completed tasks to AI prompt; prevents duplicate suggestions and suggests complementary tasks; updated TASK_SUGGESTER_PROMPT and createTaskSuggestMessage in prompts.ts |
| 2026-01-08 | **Optimistic UI Updates** - 13.2 added optimistic updates to all task mutations (useCompleteTask, useUncompleteTask, useDeleteTask, useUpdateTask) and subtask mutations (useUpdateSubtask, useDeleteSubtask) in useTasks.ts and useSubtasks.ts; UI updates instantly on user action with rollback on server error; improves perceived performance significantly |
| 2026-01-08 | **Subtasks/Checklists** - 2.9 added subtasks feature; Prisma Subtask model with ordering; CRUD API endpoints at /api/tasks/[id]/subtasks; SubtaskList.tsx component with progress bar, checkboxes, add/edit/delete; integrated into TaskEditModal |
| 2026-01-08 | **Focus Mode** - 6.5 added focus mode toggle to dashboard; hides overdue tasks to reduce cognitive load; includes indicator showing how many tasks are hidden; state persisted to localStorage via useFocusMode hook |
| 2026-01-08 | **Configurable MIT Limit** - 12.1 added MIT limit setting (1-3) in Settings page; updated dashboard to display multiple MITs; updated drag-to-promote logic to respect limit; stats/settings API updated to include maxMitCount |
| 2026-01-08 | **Quick Wins** - 14.5 renamed navigation labels for clarity ("Today's Focus"→"Today", "Week Planner"→"This Week"); 7.4 wired perfect_alignment badge check (dailyAlignmentPercentage now passed to checkAllBadges in task completion route) |
| 2026-01-08 | **Batch UX Updates** - Updated tracking for 9 completed items: 2.7 (note preview), 3.5 (unlinked goals warning), 3.7 (goal archiving), 4.1 (points explainer), 9.4 (premium upsell), 10.6 (forced-colors), 11.1 (sound effects), 11.4 (month progress card), 11.7 (vision quote on MIT) |
| 2026-01-08 | **Sunday Review Notification** - Created useNotifications hook for browser notifications; WeeklyReviewReminder component checks Sunday evening (5-9pm in user's timezone), shows browser notification + in-app dialog; respects notifyWeeklyReview preference (8.2) |
| 2026-01-08 | **Auto-scroll Inputs** - Created useScrollIntoView hook and scrollInputIntoView utility for mobile keyboard; applied to TaskCreateModal and TaskEditModal inputs (5.6) |
| 2026-01-08 | **Touch Targets** - Increased button touch targets to 44-48px on mobile in GoalReviewSection, DayTasksPopover checkbox, GoalCard, and VisionCard for WCAG AAA compliance (10.5) |
| 2026-01-08 | **Icons for Color Indicators** - Added icons alongside colors in GoalCategoryBadge, DayTasksPopover priority indicators, and PlanDayModal task previews for colorblind accessibility (10.1) |
| 2026-01-08 | **Goal Edit in Review** - GoalReviewSection component for editing/pausing/abandoning goals during weekly and monthly reviews (8.6) |
| 2026-01-08 | **Goal Search** - Added searchable goal list in Cmd+K command palette (3.4), with API endpoint `/api/goals/search` |
| 2026-01-08 | **Data Export** - JSON/CSV export for all goals and tasks from Settings page (12.6), with API endpoint `/api/user/export` |
| 2026-01-08 | **Accessibility: aria-live** - AnnouncerProvider with polite/assertive announcements for screen readers (10.3) |
| 2026-01-08 | **AI Feedback** - Thumbs up/down on AI suggestions with database tracking (9.5), added `aiFeedback` fields to Prisma schema |
| 2026-01-08 | **Verified existing** - Notification preferences (12.2) and timezone settings (12.3) already in settings page |
| 2026-01-07 | **Drag-to-Promote MIT** - Drag any Primary/Secondary task onto MitCard to promote it to MIT; swaps priorities if MIT already exists. Uses HTML5 drag-drop with visual feedback. |
| 2026-01-07 | **Create Child Goal Button** - Added + button to GoalCard and VisionCard for quick child goal creation from list/detail pages without extra navigation |
| 2026-01-07 | **Reduced Motion Support** - useReducedMotion hook, updated LevelUpModal & BadgeEarnedModal to skip confetti when prefers-reduced-motion is enabled |
| 2026-01-07 | **Floating Action Button** - Mobile quick-add FAB with haptic feedback, lantern accent, hidden on desktop |
| 2026-01-07 | **High-Impact P0 Features Verified** - Onboarding wizard, breadcrumb nav, streak freeze, pull-to-refresh, command palette (all already implemented) |
| 2026-01-07 | **Quick Wins Batch** - Cmd+N shortcut, swipe hint animation, settings icon |
| 2026-01-03 | **UX Improvements Round 1** - Keyboard shortcuts, skeleton loaders, mobile stats bar |
| 2026-01-03 | **Monthly Review Enhancement** - Data-driven prompts for Steps 3 (Learnings) and 4 (Next Month) |
| 2026-01-03 | **Celebration Modals** - LevelUpModal and BadgeEarnedModal with confetti animations |
| 2026-01-03 | **Weekly Review Enhancement** - Structured prompts with Wins, Challenges, Next Week sections |
| 2026-01-03 | **Goal Alignment** - Color-coded percentage, linked/total counts, status badges |
| 2026-01-03 | **Kaizen Evening Prompt** - 6-11pm reminder if no check-in completed |
| 2026-01-03 | **Recurring Tasks** - Daily, weekly, and custom recurrence patterns |
| 2026-01-03 | **Phase 2 Engagement** - First MIT celebration, task carry-over, next badge card |
| 2026-01-03 | **Phase 1 Foundation** - Swipe gestures, goal chain display, undo toasts |
| 2026-01-03 | Initial plan created with 95 improvements across 15 categories |

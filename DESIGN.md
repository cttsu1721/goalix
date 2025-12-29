# Goalix Design System

## Design Decision Log

### 2024-12-29: Selected Yoru Zen as Primary Design Direction

**Decision**: Adopted the "Yoru Zen" aesthetic as the primary design language for Goalix.

**Mockup Reference**: `/mockups/24-yoru-zen.html`

**Rationale**:
- Minimal distractions align with productivity-focused goals
- Japanese-inspired calm aesthetic reduces cognitive load
- Generous whitespace creates breathing room for focused work
- Subtle interactions feel refined rather than demanding attention

---

## Design System: Yoru Zen

### Philosophy

Yoru (夜) means "night" in Japanese. The Zen variant embraces:
- **Spaciousness** — generous whitespace, breathing room
- **Subtlety** — soft transitions, understated interactions
- **Focus** — minimal chrome, content-first approach
- **Calm** — muted colors, gentle visual hierarchy

### Color Palette

```css
:root {
  /* Backgrounds */
  --void: #08080c;           /* Deepest background */
  --night: #0c0c12;          /* Primary surface */
  --night-soft: #12121a;     /* Elevated surface */
  --night-mist: #1a1a24;     /* Borders, dividers */
  --night-glow: #242430;     /* Hover states */

  /* Accent - Lantern */
  --lantern: #e8a857;                      /* Primary accent */
  --lantern-soft: rgba(232, 168, 87, 0.08); /* Accent background */
  --lantern-mist: rgba(232, 168, 87, 0.04); /* Subtle accent */

  /* Text - Moonlight */
  --moon: #f0eef8;           /* Primary text */
  --moon-soft: #c4c2d0;      /* Secondary text */
  --moon-dim: #8a889a;       /* Tertiary text */
  --moon-faint: #5a5868;     /* Muted text, labels */

  /* Semantic */
  --zen-green: #7dd3a8;                     /* Success, completion */
  --zen-green-soft: rgba(125, 211, 168, 0.1); /* Success background */
}
```

### Typography

**Font Family**: Sora (Google Fonts)

```css
font-family: 'Sora', sans-serif;
```

**Font Weights**:
| Weight | Usage |
|--------|-------|
| 300 | Large headings, display text |
| 400 | Body text, task titles |
| 500 | Labels, buttons, emphasis |
| 600 | Strong emphasis (rarely used) |

**Type Scale**:
| Element | Size | Weight | Letter Spacing |
|---------|------|--------|----------------|
| Page Title | 1.875rem | 300 | -0.01em |
| Section Title | 0.6875rem | 500 | 0.2em (uppercase) |
| MIT Title | 1.5rem | 400 | -0.01em |
| Task Title | 0.9375rem | 400 | 0 |
| Body Text | 0.875rem | 400 | 0.01em |
| Labels | 0.75rem | 400 | 0.15em (uppercase) |
| Small Text | 0.6875rem | 400-500 | 0.1em |

**Line Height**: 1.7 (generous for readability)

### Spacing

The design uses generous spacing throughout:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps |
| sm | 8px | Related elements |
| md | 16px | Standard spacing |
| lg | 24px | Section padding |
| xl | 32px | Major sections |
| 2xl | 40px | Page padding |
| 3xl | 48px | Section gaps |
| 4xl | 56px | Large gaps |

### Layout

**Desktop (3-column)**:
- Sidebar: 260px
- Main Content: flexible (1fr)
- Stats Panel: 320px

**Tablet** (≤1280px):
- Sidebar: 240px
- Main Content: flexible
- Stats Panel: hidden

**Mobile** (≤900px):
- Single column
- Sidebar: hidden (bottom nav instead)
- Stats Panel: hidden
- Bottom Navigation: fixed

### Components

#### Cards

```css
.card {
  background: var(--night);
  border: 1px solid var(--night-mist);
  border-radius: 20px;
  padding: 36px;
}
```

#### Buttons

**Primary (AI Suggest)**:
```css
.btn-primary {
  background: var(--night-soft);
  border: 1px solid var(--night-mist);
  border-radius: 12px;
  padding: 12px 20px;
  color: var(--moon-soft);
  font-size: 0.8125rem;
  font-weight: 400;
}

.btn-primary:hover {
  border-color: var(--lantern);
  color: var(--lantern);
  background: var(--lantern-mist);
}
```

**Secondary (Kaizen Submit)**:
```css
.btn-secondary {
  background: var(--night-mist);
  border: none;
  border-radius: 10px;
  padding: 12px;
  color: var(--moon-soft);
}
```

#### Checkboxes

**Task Checkbox**:
```css
.checkbox {
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--night-glow);
  border-radius: 7px;
}

.checkbox.checked {
  background: var(--zen-green);
  border-color: var(--zen-green);
}
```

**MIT Checkbox** (larger):
```css
.checkbox-lg {
  width: 32px;
  height: 32px;
  border: 2px solid var(--night-glow);
  border-radius: 10px;
}
```

#### Navigation Items

```css
.nav-item {
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--moon-dim);
}

.nav-item:hover {
  background: var(--night-soft);
  color: var(--moon-soft);
}

.nav-item.active {
  background: var(--lantern-soft);
  color: var(--lantern);
}
```

### Interactions

**Hover States**:
- Subtle color shifts, never jarring
- Tasks shift 8px left on hover
- Border color changes to --moon-dim or --lantern
- No heavy shadows or transforms

**Transitions**:
- Duration: 0.2s - 0.3s
- Easing: ease or ease-out
- Never use bounce or overshoot

**Animations**:
- Streak flame: gentle pulse (3s cycle, 0.7-1 opacity)
- Keep animations subtle and purposeful
- Avoid attention-grabbing effects

### Iconography

- Style: Stroke-based, 1.5px stroke width
- Size: 20-22px for navigation, 14-18px inline
- Color: Inherits from parent text color

### MIT Hero Card

The Most Important Task uses special styling:

```css
.mit-card {
  background: var(--night);
  border: 1px solid var(--night-mist);
  border-radius: 20px;
  padding: 36px;
  position: relative;
}

/* Left accent bar */
.mit-accent {
  position: absolute;
  left: 36px;
  top: 36px;
  bottom: 36px;
  width: 3px;
  background: linear-gradient(180deg, var(--lantern), transparent);
  border-radius: 2px;
}
```

### Stats Panel Components

**Streak Display**:
- Large number (3rem, weight 300)
- Lantern color for emphasis
- Subtle flame emoji with gentle pulse

**Progress Bars**:
```css
.progress-bar {
  height: 6px;
  background: var(--night-mist);
  border-radius: 3px;
}

.progress-fill {
  background: linear-gradient(90deg, var(--lantern), var(--zen-green));
}
```

**Goal Alignment Circle**:
- Conic gradient for percentage visualization
- Inner circle matches panel background
- Value in zen-green color

**Kaizen Check-in**:
- 3x2 grid of icon buttons
- Checked state uses zen-green
- Compact design for stats panel integration

---

## Page Templates

### Daily View (Today)
- Header: Greeting, date, AI Suggest button
- MIT Hero Card
- Primary Tasks section (3 max)
- Secondary Tasks section (unlimited)

### Goals Hierarchy
- Breadcrumb navigation
- Dream/Goal cards with progress
- Child goals list
- Timeline visualization

### Progress
- Full stats dashboard
- Streak calendar heatmap
- Level progression
- Badge collection
- Weekly/monthly trends

### Settings
- Profile section
- Preferences
- Notification settings
- Theme options (future)

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Layout |
|------------|--------|
| > 1280px | 3-column: Sidebar + Main + Stats |
| 901-1280px | 2-column: Sidebar + Main |
| ≤ 900px | 1-column: Main only + Bottom Nav |

### Mobile Adaptations

- MIT card becomes full-width
- Actions stack vertically
- Bottom navigation with 4 items: Today, Dreams, Progress, Settings
- Stats accessible via dedicated Progress page
- Kaizen accessible via floating button or Progress page

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for body text
- Focus states: Use --lantern for focus rings
- Touch targets: Minimum 44x44px on mobile
- Reduced motion: Respect prefers-reduced-motion

---

## Files

| Page | Mockup |
|------|--------|
| Daily View | `/mockups/24-yoru-zen.html` |
| Goals | `/mockups/25-yoru-zen-goals.html` |
| Progress | `/mockups/26-yoru-zen-progress.html` |
| Weekly Review | `/mockups/27-yoru-zen-weekly.html` |
| Settings | `/mockups/28-yoru-zen-settings.html` |

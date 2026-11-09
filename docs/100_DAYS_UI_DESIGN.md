# 100 Days to Ramadan: UI/UX Design (Journey Card v2)

**Companion to:** `docs/100_DAYS_TO_RAMADAN_PLAN.md`
**Scope:** the Home card only. Lottie moments, push, and share cards follow the same rules below.

## 1. What the card must do

One job: make today's tiny habit easy to do, and make showing up feel good. Everything else is secondary.

Findings on v1 (the first shipped card):

| Issue | Why it matters |
| --- | --- |
| Countdown is a small grey label; the title is the loudest text | The number users care about ("how long?") is the weakest element |
| Progress bar is 6px, thin, and sits far from the number | Hard to read at a glance, weak sense of progress |
| No sign of past effort | Streak lives in a different place; the card can't say "you've been showing up" |
| Habit text and button are visually the same weight | Primary action doesn't stand out |
| Phase text ("Reset · set your niyyah...") is long and grey | Ignored; also reads as a lecture |

## 2. Layout (mobile first, 320px minimum)

```
┌──────────────────────────────────────────┐
│  100 DAYS TO RAMADAN        [ Reset ]    │  eyebrow + phase chip
│                                          │
│   ╭────╮    Today's tiny habit           │
│   │ 92 │    Sleep 30 minutes earlier     │  ring (hero number) + habit
│   │days│    tonight. Rest is part of     │
│   ╰────╯    the plan.                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ✓  I did it                        │  │  full-width primary button, 48px
│  └────────────────────────────────────┘  │
│                                          │
│  ● ● ○ ● ● ● ◉      5 of last 7 days    │  7-day strip + plain-language total
└──────────────────────────────────────────┘
```

Done state: button becomes a calm confirmation row and the strip's last dot fills. The card can lose the one-line "joining late" hint, so its height may shrink slightly.

```
│  ✓  Done for today. Streak safe.         │
│  ● ● ○ ● ● ● ●      6 of last 7 days    │
```

### Decisions and why

1. **Ring holds the hero number (days left).** Largest, highest-contrast text on the card. The ring fills by calendar progress (day N of 100), so it always moves forward and never punishes a missed day.
2. **Effort lives in the strip, not the ring.** Time is the ring; consistency is the dots. Two different questions, two different shapes, no confusion.
3. **No guilt.** A day not done is an empty dot, never a red X or a broken-streak symbol. Late joiners see mostly empty dots without being told off.
4. **One primary action.** Full-width button, at least 48px high, the only filled element. Habit text is regular weight so it reads as the instruction, not the action.
5. **Phase as a small chip,** one or two words ("Reset", "Build", "Sharpen"). The longer phase sentence moves to the sr-only description and the future detail screen.
6. **Copy stays short.** Title in the eyebrow, not repeated.

## 3. Visual system (no new tokens)

Use the existing variables only, so every theme works:

| Element | Token |
| --- | --- |
| Card | `--color-surface`, border `--color-border`, `--shadow-card` |
| Ring track | `--color-surface-subtle` |
| Ring progress, done dots, button | `--color-primary` (button text `--color-primary-foreground`) |
| Hero number | `--color-text-strong` |
| Secondary text | `--color-text` (not `--color-text-muted`, see section 4a) |
| Final 10 days | ring switches to `--color-accent` (matches the existing countdown card's intensity logic) |

Type scale: hero number 28px/semibold, habit 15px/regular, eyebrow 11px/uppercase/tracking, caption 12px.
Spacing: 16px card padding, 12px between groups, 8px between dots (each dot 12px, in a 24px tap-free row).
Radius: 16px card, 12px button, full for dots and ring.

## 4. Accessibility

| Requirement | How |
| --- | --- |
| Not colour-only | Done dot = filled with a check shape; today = outlined ring; not done = hollow. Shapes differ, not just colour |
| Text contrast 4.5:1 | Only `--color-text` and `--color-text-strong` for text; muted is used only for non-text shapes. Measured, see 4a |
| Ring is meaningful to screen readers | `role="progressbar"` with `aria-valuenow`, `aria-valuemin/max` and `aria-valuetext="Day 9 of 100, 92 days to Ramadan"`. Decorative SVG is `aria-hidden` |
| Strip is readable | `<ul>` with one `<li>` per day; each has sr-only text ("Mon: done", "Tue: not done", "Today") |
| Touch target | Button min height 48px, full width |
| Focus | Visible focus ring from the Button primitive (already 3px ring) |
| Status announced | Completion message in `role="status"` (polite live region); already in v1 |
| Motion | Honour `prefers-reduced-motion`: framer-motion wrapped in `MotionConfig reducedMotion="user"`; the global CSS rule already shortens CSS transitions |
| Language | Strings from the locale files; numbers formatted by the browser |
| Small screens | Works at 320px; ring 72px, text wraps, no horizontal scroll |
| Zoom | Layout uses flex-wrap; no fixed heights on text containers (200% zoom stays usable) |

### 4a. Measured contrast (slice 1, all 8 themes, in a real browser)

| Text | Lowest ratio across themes | Needed |
| --- | --- | --- |
| Small captions, habit text | 7.69 (ocean) | 4.5 |
| Primary button label | 5.34 (daylight) | 4.5 |

Two findings while measuring:

1. `--color-text-muted` gives only **3.7:1** on the Ocean theme, so it fails for small text. The card avoids it. This is a theme-wide token issue worth fixing separately.
2. The shared `Button` default variant uses white text on a bright green in dark themes (about **1.9:1**). The card sets its own dark label colour (`--color-accent-foreground`, dark in every theme). Other screens using the default Button (e.g. "Set Intent") still have the issue and are not changed here.

Also checked: no horizontal overflow at 320px, button height 48px.

## 5. Motion (small, purposeful)

- **On "I did it":** button morphs into the confirmation row (about 200ms fade), the check draws once (about 300ms), the ring does a single soft pulse. Total under 600ms, no loop.
- **Idle:** nothing moves. No looping animation on the card, which also protects battery and focus.
- **Milestones (later slice):** Lottie celebration in a dialog, dismissible, with a static fallback under reduced motion.
- Animate `transform` and `opacity` only.

## 6. States

| State | Behaviour |
| --- | --- |
| Normal, not done | As the layout above |
| Done today | Confirmation row, last dot filled |
| Late joiner | Short line under the button: "Joining late? No stress. Start from today." Shown only until the first completion |
| Final 10 days | Ring uses accent colour, phase chip says "Sharpen" |
| Outside the window / Ramadan | Card hidden (Ramadan card takes over) |
| Storage unavailable | Card still works for the session; the strip simply shows today only |

## 7. Data the design needs

- Dates of completed days (last 30), stored locally as a list of `YYYY-MM-DD`. This replaces the single "last done" date from v1 and also feeds the later readiness score.
- Still one streak: completing the day's habit calls the existing streak update.

## 8. Slices

1. **This slice:** ring, 7-day strip, full-width primary button, done animation, accessibility semantics, tests.
2. Lottie moments (milestones, streak) with fallbacks.
3. Journey push notifications and a mute control in Settings.
4. Detail screen: full 100-day grid, phase descriptions, readiness.
5. Share cards.

## 9. Open design questions

1. Should the card appear above or below the Intention Journal? (v1: above; the journal is the core feature, so test below.)
2. Should the ring show days left or days done as its centre number? (Design uses days left because it is the user's question.)
3. Final 10 days: accent colour only, or also a short sentence?

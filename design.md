# Nawaetu Design System

> Canonical design reference for Nawaetu and for agentic AI making UI changes.

**Status:** Current implementation reference  
**Updated:** 18 September 2026  
**Scope:** Web app, PWA, browser extension, share surfaces, and future UI

This document describes the design language that already exists in the product. It is a constraint, not a prompt for a visual redesign. New work should look like Nawaetu, reuse its primitives, and improve consistency without inventing another visual language.

## Product character

Nawaetu is a calm Muslim daily-practice companion. The interface should feel trustworthy, warm, focused, and encouraging. Worship content is primary; progress, streaks, rewards, and promotion are supporting information.

Use clear, respectful language that helps the user act: “Set your intention”, “Continue reading”, “You can do this later”. Avoid shame, urgency manipulation, noisy gamification, unexplained religious jargon, and decorative UI that competes with Quran, prayer, dhikr, or intention content.

## Source of truth

Use the existing implementation in this order:

1. `src/context/ThemeContext.tsx` — theme IDs, modes, token values, persistence, and runtime application.
2. `src/app/globals.css` — semantic CSS variables, shadcn aliases, focus, motion, and global layout behavior.
3. `src/components/ui` — shared Radix/shadcn primitives.
4. `src/components/ui/AppIcon.tsx` and `src/lib/icon-names.ts` — the icon registry and legacy-name mapping.
5. `src/context/LocaleContext.tsx` and translation data — user-facing strings and accessible labels.
6. Feature components — composition and content-specific behavior, not new global tokens.

Do not create a second token layer, page-specific theme system, or parallel icon registry.

## Theme contract

Themes are selected through `ThemeContext`, persisted with the existing settings key, and applied to `document.documentElement`. Components consume semantic CSS variables; they must not branch on a theme name or on `isDaylight`.

Stable theme IDs:

| ID | Mode | Character |
| --- | --- | --- |
| `default` | dark | Emerald on near-black |
| `midnight` | dark | Blue night with stars |
| `sunset` | dark | Warm orange evening |
| `lavender` | dark | Violet spiritual geometry |
| `ocean` | dark | Teal water and organic waves |
| `royal` | dark | Burgundy damask |
| `daylight` | light | Clear emerald daylight |
| `blossom` | light | Soft blush with restrained floral texture |

Every theme has the same semantic token set. Palette hue may change; meaning and hierarchy may not.

### Semantic tokens

Use `rgb(var(--token))` for RGB tokens and the complete CSS value for shadows, sizes, and fonts.

| Role | Token | Meaning |
| --- | --- | --- |
| Canvas | `--color-canvas` | Page background |
| Surface | `--color-surface` | Card, panel, sheet, dialog surface |
| Nested surface | `--color-surface-subtle` | Secondary area inside a surface |
| Strong text | `--color-text-strong` | Headings, primary values |
| Body text | `--color-text` | Reading copy and descriptions |
| Muted text | `--color-text-muted` | Metadata, hints, disabled context |
| Primary | `--color-primary` | Main action and active state |
| Primary strong | `--color-primary-strong` | Readable text/borders on light surfaces |
| Primary foreground | `--color-primary-foreground` | Text on a primary fill |
| Accent | `--color-accent` | Highlight, reward, Ramadan emphasis |
| Status | `--color-info`, `--color-success`, `--color-warning`, `--color-danger` | Meaningful state only |
| Border/ring | `--color-border`, `--color-ring` | Quiet separation and keyboard focus |
| Elevation | `--shadow-card`, `--shadow-floating` | Card and floating-action depth |
| Geometry | `--radius-control`, `--radius-card` | Shared shape language |
| Layout | `--space-page`, `--space-section` | Page gutter and section rhythm |
| Type | `--font-ui`, `--font-reading`, `--font-editorial`, `--reader-line-height` | Typography roles |

Light themes need dark readable text on pale fills. Never use a light emerald, blush, amber, or soft accent as body text. Dark themes need quiet borders; do not introduce thick white borders to imitate a light card.

Status colors retain their meaning across themes. Success is not a replacement for primary, and primary is not a replacement for success. Hover, selected, focus, disabled, loading, error, and completed states must remain distinguishable without relying on color alone.

## Typography

Use the existing font roles. Do not add a font for a single screen.

| Role | Guidance |
| --- | --- |
| Display | UI sans, 28–36px, bold |
| Page title | UI sans, 22–28px, bold |
| Section title | UI sans, 16–18px, semibold/bold |
| Body | UI sans, 14–16px, 1.5 line height |
| Label | UI sans, 12–13px, semibold |
| Metadata | UI sans, at least 12px, never the main readable content |
| Numeric display | UI mono or UI sans, 32–72px |
| Arabic reading | Amiri/Lateef role, generous line height, user adjustable |
| Editorial prose | Lora/serif role, 16–18px, relaxed line height |

Avoid 9–10px for meaningful information. Uppercase tracking is for short metadata labels only. Arabic text keeps its direction, language, and reading rhythm; translation is visually separated rather than compressed into the same line.

## Shape, depth, and motion

- Controls use the shared control radius; cards use the shared card radius. Pills are for tags and compact status, not every container.
- Use one quiet border token per surface. Do not mix hardcoded white, slate, emerald, and route-specific borders.
- Cards use the card shadow; dialogs and floating actions use the floating shadow. Shadows should be soft and theme-aware, never a gray haze on light surfaces.
- Glass is an optional material for navigation and a small number of foreground panels, using the shared `glass-surface` class with semantic surface and border colors. Keep reading surfaces and nested controls solid. Use enough tint for readable text, modest blur, and a solid fallback when blur is unsupported or the user requests reduced transparency. Do not stack frosted surfaces or add decorative backgrounds merely to make blur visible.
- Controls transition in roughly 150–220ms; larger surfaces in 250–400ms. Avoid persistent glow, pulse, or decorative motion.
- `prefers-reduced-motion` removes nonessential movement. A static fallback must remain legible.
- Patterns are decoration only. They must never sit behind dense Arabic text, controls, dialogs, or status information.

## Layout and responsive behavior

Use one of three layout families:

1. **Daily dashboard:** mobile-first, compact content width, one primary action per section, persistent bottom navigation.
2. **Content browser:** readable `max-w-2xl` rhythm for Quran, Sirah, Hadith, and Dua; controls stay compact and content stays scannable.
3. **Data/settings:** `max-w-3xl` to `max-w-5xl`; grouped sections, clear headings, minimal decorative stacking.

Rules for every viewport:

- Design from 320px upward; verify 320, 360/390, tablet, and desktop widths.
- No horizontal overflow. Long titles, references, translations, and buttons must wrap or truncate intentionally.
- Use safe-area padding for bottom navigation. Reserve content space so navigation never covers the last item.
- Floating actions sit above navigation with clear separation and never cover content, dialogs, toasts, or inputs.
- Prefer responsive CSS over JavaScript viewport checks. Do not render different server/client markup from `window`, time, random values, or storage.
- Keep one clear page title and a predictable order: context, title/purpose, primary task, supporting content, secondary actions.

## Reusable components

Use existing components before writing markup. The `src/components/ui` layer is project-owned shadcn/Radix code, not an external runtime.

- `Button`: semantic variants (`default`, `secondary`, `outline`, `ghost`, `destructive`, `link`) and 44px minimum target.
- `Dialog`/Radix primitives: labeled title, description when useful, focus trap, escape/close behavior, and focus return.
- `Input`, `Select`, `Switch`, `Tabs`, `Progress`, `Tooltip`: preserve their keyboard and ARIA behavior.
- `AppIcon`: the only shared icon entry point for UI icons.
- Cards and feature components: compose shared surface, spacing, state, and typography rules; do not create a new card recipe for each route.

Add a new reusable component only when the behavior or structure is repeated. Keep the API small and semantic. A component should own its states rather than forcing every caller to reimplement loading, empty, error, disabled, and selected styling.

## Icon policy

UI must use the existing Lucide-based `AppIcon` registry. Use a named icon from `AppIconName`; use `resolveAppIconName` only at compatibility boundaries for persisted or remote legacy values. The registry provides consistent size, tone, and accessible labeling.

- No emoji, Unicode symbol, or text glyph as a functional UI icon.
- No inline one-off SVG when an existing registry icon fits.
- Icon-only controls require an accessible label; decorative icons are hidden from assistive technology.
- Icons support the label; they do not replace clear text for important actions.
- Keep icon stroke weight, size, and tone consistent with the surrounding control.

Content may contain Arabic or quoted religious text as content. That does not make a symbol a UI icon. Do not use emoji as the sole status, action, or navigation signal.

## Feature language

### Home and missions

Home prioritizes intention, prayer context, and daily focus. Missions are supportive and use semantic primary/success states. A hover or focus state belongs to the item under interaction; never apply a parent hover state to all sibling missions. Full mission lists use the same tokens, spacing, and readable reference badges as the home card.

### Quran, Hadith, Dua, and Sirah

Reading content gets more space than metadata. Search fields, filters, references, and action rows use shared controls. Arabic direction and text hierarchy are preserved. Reference badges remain readable in every theme; they must not default to emerald if that conflicts with a light theme.

### Dhikr/Tasbih

The counter is the primary task: quiet surface, obvious tap target, stable number, and readable supporting text. Zen mode reduces decoration without reducing contrast. Selection dialogs and statistics use the active theme and avoid gray overlays or shadows that flatten light surfaces. Small screens must stack content rather than compressing Arabic, counter, stats, and controls into one row.

### Settings and themes

Theme previews communicate mode, contrast, and pattern without requiring navigation. Settings sections are grouped by task; avoid repeated card-inside-card wrappers and unnecessary vertical gaps. Premium status may affect access, never readability or semantic token availability.

### Extension

The extension may have compact dimensions, but it shares the same semantic roles, icon names, tone, and action hierarchy. Do not grow a second palette or typography system in `extension/`.

## Accessibility and content

Target WCAG 2.2 AA behavior:

- Normal text contrast at least 4.5:1; large text at least 3:1.
- Interactive targets at least 44×44 CSS pixels.
- Visible keyboard focus using the shared ring token; focus must not be hidden behind sticky UI.
- Correct accessible name, role, and state for every control; dialogs trap and return focus.
- Color is never the only indication of status. Pair it with text, shape, icon, or position.
- Loading, empty, offline, permission-denied, and error states remain understandable.
- User-facing strings, tooltips, and ARIA labels come from translations. Use sentence case.
- Permission requests explain why before invoking the browser prompt; users can defer optional setup.

## Performance and stability

Prefer native HTML/CSS and existing dependencies. Do not add a package for a small local behavior. Keep noninteractive shells server-renderable and put client state at the smallest interactive boundary.

Lazy-load maps, audio, charts, mentor AI, and below-the-fold animation. Keep the first useful screen fast and avoid layout shift from late fonts, icons, images, navigation, or floating actions. Do not use remote icon/font/animation CDNs for core UI.

Initial guardrails for new UI:

- no horizontal overflow at 320px, 360px, or 390px;
- visible local feedback within 100ms and normal local actions within 1s;
- one visible decorative animation at most, with a reduced-motion fallback;
- no hydration-sensitive `Date.now()`, `Math.random()`, locale/time/storage branch, or `window` branch in initial markup;
- preserve route names, theme IDs, translation keys, storage keys, and user data formats.

## Agent rules: prevent AI-slop design

Before editing, identify the owning component and reuse it. Before adding a token, prove the existing semantic role cannot express the need. Before adding a dependency, prove the platform and installed primitives cannot solve it.

Do not:

- invent gradients, neon glows, oversized hero sections, or decorative blobs without a product need;
- introduce arbitrary colors, one-off shadows, random radii, or page-specific breakpoints;
- duplicate a card, modal, icon map, button, or theme branch;
- use emoji/symbols as UI chrome;
- hide overflow to mask a responsive bug;
- make a component client-side merely to read theme or viewport state;
- change the visual grammar of one route in isolation.

The smallest coherent change wins. Prefer deleting a compatibility exception or consolidating a repeated pattern over adding another abstraction. If a requested visual conflicts with these rules, preserve usability, contrast, responsive behavior, and the semantic token contract first.

## Change validation

For a UI change, verify the affected route in at least one light and one dark theme, narrow mobile and desktop width, keyboard focus, reduced motion, and the relevant loading/empty/error state. Run the repository’s existing typecheck, lint, and tests when code changes. Update this document only when the actual design contract changes; do not turn it into a historical action log.

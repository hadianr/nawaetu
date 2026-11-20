# Brand and UI Polish Plan

Status: approved 2026-11-20. Phase 1 in progress.

Goal: Nawaetu should look designed, not generated. That means one type system,
a warm light first impression, one brand colour from the favicon to the OG card,
and quieter component styling.

---

## 1. Current state audit

### 1.1 Fonts

No web font is loaded. There is no `next/font`, no `@font-face`, and no Google
Fonts link. Every font name in CSS falls back to whatever the device has.

| Role | Declared in | Declared stack | What renders |
| --- | --- | --- | --- |
| UI / body | `globals.css:18,119`, `ThemeContext.tsx` `fontUi` | `system-ui, -apple-system, "Segoe UI"` | SF on Apple, Roboto on Android, Segoe on Windows |
| Editorial | `globals.css:121`, `fontEditorial` | `Lora, Georgia, serif` | Georgia or the device serif. Lora never loads |
| `font-serif` (25 uses) | Tailwind default | `ui-serif, Georgia…` | Device serif. Used for reflections, dhikr Latin text, Eid/Wrapped headings |
| `font-mono` (31 uses) | `globals.css:19` | `ui-monospace…` | Monospace, mostly for numbers and counters |
| Arabic reading | `globals.css:120`, `tajweed.css:3`, `quran-utils.ts:54-61` | `Amiri, Lateef, serif` | Not loaded. `--font-amiri` and `--font-lateef` are set to plain `serif`, so Arabic uses the device's Arabic font |
| `font-arabic` (12 uses) | `globals.css:757` and others | inherits the above | Same as above |
| `public/fonts/LPMQ.ttf` | unused | — | **Broken file.** It is a saved GitHub HTML page (`file` reports "HTML document"), not a font |

In practice there are about five stacks (system sans, device serif, Georgia,
monospace, device Arabic), and each one looks different on each OS. Headings
also lean on `font-black` (81 uses) and `tracking-*` (221 uses).

### 1.2 Theme

- `src/context/ThemeContext.tsx` defines five themes: `default` (dark,
  near-black with slate-blue surfaces and emerald), `daylight` (light, slate
  with emerald), `midnight` (dark blue with stars), `sunset` (dark, orange),
  and `blossom` (light, pink).
- The fallback theme is `default`, which is dark (`ThemeProvider` initial
  state, `applyTheme` fallback, `StoryShareModal.tsx:39`).
- **The dark blue first impression comes from onboarding.**
  `OnboardingOverlay.tsx:64` sets `START_THEME = "midnight"` and applies it
  before first paint for anyone who has no saved theme or has saved `default`.
  New users therefore land on Midnight blue.
- No script runs before paint. The SSR HTML uses the dark `:root` tokens in
  `globals.css:95-130` (`color-scheme: dark`), and the client swaps the theme in
  a layout effect.
- `globals.css` holds 158 `[data-theme="daylight"]` / `[data-color-mode="light"]`
  override selectors and 156 `!important`. Light mode was patched on top of a
  dark-first design rather than designed directly.
- The shadcn `:root` and `.dark` blocks (`globals.css:49-93`) are leftover
  neutral grey boilerplate. They are overridden later in the same file.
- Tokens are stock Tailwind (slate-50/900, emerald-500, amber-400). That is the
  "default template" look the feedback describes.
- Users' themes also sync to the server through
  `GuestSyncManager.tsx:153,222`, so saved choices must keep working.

### 1.3 Icons

| Asset | Actual size | Problem |
| --- | --- | --- |
| `public/icon.png` | 640×640 | Used as `sizes: "any"` and also served as the favicon |
| `src/app/favicon.ico/route.ts` | serves `public/icon.png` | A 640px PNG served as `/favicon.ico`. There is no real multi-size ICO |
| `src/app/icon.png` | 192×192 | File-based icon. It overrides `metadata.icons.icon` |
| `src/app/apple-icon.png` | 640×640 | File-based. It overrides `metadata.icons.apple`. Apple expects 180×180 |
| `public/apple-touch-icon.png` | 640×640 | Declared as 180×180 in `layout.tsx` |
| `apple-touch-icon-precomposed.png` | **missing** | Linked in `layout.tsx` `<head>`, so it returns 404 |
| `public/icon-192x192.png`, `icon-512x512.png` | correct | Declared `purpose: "any maskable"`. The art has no safe zone and has its own rounded square, so Android masks crop it |
| `android/.../mipmap-*`, `extension/icons/*` | various | Same glossy art |
| `public/firebase-messaging-sw.js:61-62` | `icon-192x192.png?v=1.5.7` | Uses an old cache-busting version |

The artwork is a glossy 3D emerald rounded square with a bevelled gold
N-and-mosque mark. It is green and gold, while the first screen is Midnight
blue. That is the mismatch users noticed. The glossy, bevelled style also reads
as AI-generated at small sizes.

Theme colours elsewhere: `layout.tsx` `themeColor: "#0a0a0a"` and
`statusBarStyle: "black-translucent"`, `_manifest.ts`
`background_color: #000000` and `theme_color: #0a0a0a`, and
`android/twa-manifest.json` `#0A0A0A` and `#000000`.

### 1.4 Open Graph and metadata

There are two OG systems, and they disagree:

1. **Root `/`**: `src/app/opengraph-image.tsx` and `twitter-image.tsx` are
   byte-identical copies. They render a 1200×630 dark card with an emerald glow
   and an "N" in a green square. They use generic dark-glass styling, the old
   tagline "Teman Ibadah Modern & Mentor AI", and system fonts. File-based
   images override the `openGraph.images` set in `layout.tsx`.
2. **About 26 pages** that use `pageMetadata()` in `src/lib/seo.ts:36,42` point
   to `/og-image.png`. That file is **640×640, square**, with no width or height
   declared. WhatsApp and X show it as a small square thumbnail or crop it
   badly. This is the "icon-only" preview users see.

`layout.tsx` also declares `/og-image.png` as 1200×630, which is wrong, but
that declaration is shadowed on `/` anyway. The JSON-LD `screenshot` field
points to the icon (`layout.tsx`), not to a screenshot.

### 1.5 Styling patterns that read as generated

Counts are rough grep totals across `src/`:

| Pattern | Count | Notes |
| --- | --- | --- |
| `shadow-*` | ~540 | Shadows on nearly everything, including coloured glows |
| `rounded-2xl` / `rounded-3xl` | ~205 / ~44 | Radius set per component instead of from the `--radius-card` and `--radius-control` tokens |
| `backdrop-blur` | ~124 | Glass on cards that sit on flat backgrounds |
| `animate-*` | ~207 | Includes decorative pulses |
| `bg-gradient` | ~55 | Gradient text and gradient fills |
| `blur-3xl` | ~16 | Decorative glow blobs |
| `font-black` | ~81 | Very heavy headings |
| raw `emerald-*` / `slate-*` | ~57 / ~92 | Bypass theme tokens, so they break in light themes and cause the overrides above |

The token system (`--color-*`, `--radius-*`, `--shadow-*`, `--glass-*`) is
already sound. The problem is that components ignore it.

---

## 2. Proposed design tokens

### 2.1 Two-font system (Latin)

| Role | Font | Why |
| --- | --- | --- |
| **Display**: headings, hero numbers, wordmark, OG card | **Fraunces** (variable, `opsz` + `wght`, Google Fonts) | A warm, soft serif with character. It suits a reflective worship app and is not the default geometric sans. Use it only at 600 weight and above, at 20px and larger |
| **Body / UI**: everything else, including counters | **Plus Jakarta Sans** (variable, Google Fonts) | Designed in Indonesia (Tokotype) for Jakarta's identity. It is very legible at small sizes, covers Latin Extended for transliteration (ā, ḥ, ṣ), and has tabular figures, which replace the 31 `font-mono` uses |

Fallback if you want less personality: **Lora** for display (already named in
the CSS, so less churn) with **Plus Jakarta Sans** for body.

**Arabic script is a separate rule, not a third UI font.** Quran, dua and dhikr
Arabic need a proper Naskh font, and the two-font rule covers Latin UI text.
Proposal: load **Amiri** (Arabic subset only, via `next/font`, applied only to
`--font-reading`), and remove **Lateef**. Today neither font actually loads.
Removing Lateef depends on what the Quran settings "script" option does, so it
is listed under open questions.

Loading: use `next/font/google` in `layout.tsx` with `display: "swap"` and the
`latin` + `latin-ext` subsets, and expose the CSS variables `--font-display`,
`--font-ui` and `--font-reading`. Next self-hosts the files, so there is no
runtime request to Google, and the files are cacheable for offline/PWA use.

Type scale (mobile first): 12 / 14 / **16 body** / 18 / 20 / 24 / 30 / 36.
Body line height 1.5, headings 1.15–1.25. Weights: body 400/500/600, display
600/700. Retire `font-black` and most `tracking-wide/widest`, keeping
`tracking-wide` only for small uppercase labels.

### 2.2 Colour

The brand already exists in the icon: emerald and gold. The palette is built
from those two colours, with warm neutrals in place of Tailwind slate. Values
are RGB channels in the form `ThemeContext` already uses.

**Light (new default): "Daylight", reworked**

| Token | Value | Hex | Note |
| --- | --- | --- | --- |
| canvas | `250 248 243` | #FAF8F3 | Warm paper, not blue-white |
| surface | `255 255 255` | #FFFFFF | |
| surfaceSubtle | `243 240 232` | #F3F0E8 | |
| border | `228 223 211` | #E4DFD3 | Warm hairline |
| textStrong | `23 33 28` | #17211C | Green-black ink |
| text | `52 64 58` | #34403A | |
| textMuted | `90 102 95` | #5A665F | ≥4.5:1 on canvas |
| primary | `21 128 87` | #158057 | Brand emerald, matched to the icon |
| primaryStrong | `14 99 66` | #0E6342 | Buttons with white text (AA) |
| primaryLight | `209 236 222` | #D1ECDE | Tints and selected states |
| accent | `184 137 46` | #B8892E | Brand gold, for highlights only, never body text |
| accentForeground | `23 33 28` | | |
| ring | `21 128 87` | | |
| shadowCard | `0 1px 2px rgb(23 33 28 / .05), 0 1px 1px rgb(23 33 28 / .03)` | | Barely visible. Borders separate surfaces, not shadows |

**Dark: "Emerald" (formerly `default`), reworked**

| Token | Value | Hex |
| --- | --- | --- |
| canvas | `14 19 17` | #0E1311 green-black, replacing pure #0A0A0A |
| surface | `22 29 26` | #161D1A |
| surfaceSubtle | `30 39 35` | #1E2723 |
| border | `44 54 49` | #2C3631 |
| textStrong | `240 237 228` | #F0EDE4 warm white |
| text | `208 212 206` | |
| textMuted | `146 156 150` | |
| primary | `52 168 118` | #34A876 |
| primaryStrong | `94 196 148` | #5EC494 (text and controls on dark) |
| accent | `214 172 86` | #D6AC56 |

Status colours (success, warning, danger, info) are toned to sit with these
palettes instead of stock 400 shades. Each pair will be checked with the
existing contrast tests. Midnight, Sunset and Blossom stay as optional themes,
re-checked against the new borders and shadows but otherwise unchanged.

**Shape and elevation**
- `--radius-control: 0.625rem`, `--radius-card: 0.875rem`, and one sheet radius
  of `1.25rem` for bottom sheets and dialogs. No other radii.
- Elevation has two levels: card (hairline border plus the near-invisible
  shadow above) and floating (sheets and menus). There are no coloured glows.
- Glass (`backdrop-blur`) is used only where content scrolls underneath: the
  bottom nav, sticky headers and sheets.

---

## 3. Implementation checklist

Each phase is one PR with one Conventional Commit scope. Phases 1–4 are
independent of each other. Phase 5 depends on phases 1–2.

### Phase 1: Light mode default (`feat(theme)`)

- [ ] `src/context/ThemeContext.tsx`
  - Rework the `daylight` and `default` colours to the tables above, and update
    `createTheme`'s shared light and dark neutrals (they are slate today).
  - Add `export const DEFAULT_THEME_ID: ThemeId = "daylight"`. Use it as the
    `useState` initial value, as the saved-value fallback, and as the
    `applyTheme` fallback.
  - Rename the dark `default` theme to `emerald` ("Emerald" in both locales,
    keys `themeEmeraldName` and `themeEmeraldDescription`), so every theme has
    its own name. `resolveThemeId()` and the pre-paint script read a saved
    legacy `"default"` (localStorage or synced settings) as `emerald`, so users
    who picked it keep it. Update the locale keys in `en` and
    `id`.
- [ ] `src/components/OnboardingOverlay.tsx:64`: `START_THEME = "daylight"`.
  Keep the rule that an existing non-default choice wins.
- [ ] `src/components/StoryShareModal.tsx:39`: fall back to `DEFAULT_THEME_ID`.
- [ ] `src/app/globals.css:95-130`: change the `:root` token defaults to the
  light values and `color-scheme: light`, so the SSR first paint is light.
  Delete the dead shadcn `:root` and `.dark` oklch blocks (`49-93`) after
  confirming nothing reads them except through the aliases defined later.
- [ ] `src/app/layout.tsx`: add a tiny inline `<head>` script, before paint,
  that reads `localStorage["app_theme"]` and sets `data-theme`,
  `data-color-mode` and `colorScheme` on `<html>`. Without it, returning
  dark-mode users get a flash of light. Use `viewport.themeColor` as an array:
  `[{ media: "(prefers-color-scheme: light)", color: "#FAF8F3" }, { media: "(prefers-color-scheme: dark)", color: "#0E1311" }]`.
  Change `statusBarStyle` to `"default"`.
- [ ] `src/app/_manifest.ts`: `background_color: "#FAF8F3"`,
  `theme_color: "#158057"`.
- [ ] `android/twa-manifest.json`: light theme, navigation and background
  colours, with dark variants from the dark palette. The Android app must be
  rebuilt; follow `docs/RELEASE_WORKFLOW.md`.
- [ ] Tests: update `ThemeContext.test.tsx` (fallback is now `daylight`),
  `OnboardingOverlay.test.tsx` (start theme), and `ThemeCard.test.tsx` if it
  checks order or names. Add one test that a saved `default` or `midnight`
  survives.

### Phase 2: Two-font system (`feat(ui)`)

- [ ] `src/app/layout.tsx`: load Fraunces, Plus Jakarta Sans and Amiri (Arabic
  subset) with `next/font/google`, and put their `variable` classes on `<html>`.
- [ ] `src/app/globals.css` `@theme inline`: `--font-sans: var(--font-ui)`,
  add `--font-display`, and point `--font-serif` at the display font so the 25
  `font-serif` uses move over with no edit. Remove `--font-lora` and
  `--font-lateef`. Set `--font-amiri` to the loaded Amiri. Add a `.font-display`
  utility if Tailwind does not generate one.
- [ ] `ThemeContext.tsx` `createTheme`: replace the `fontUi`, `fontEditorial`
  and `fontReading` values with the CSS variables. Drop `fontEditorial` or
  alias it to display.
- [ ] Replace `font-mono` used for numbers with `tabular-nums` (31 sites).
  Check each one first, because some may be real code.
- [ ] Replace `font-black` with `font-bold` or `font-semibold`, and drop
  decorative `tracking-*`, one feature folder per commit (home, quran, dhikr,
  ramadhan, settings, …).
- [ ] `src/lib/quran/quran-utils.ts:54-61` and `QuranSettingsModal.tsx`: decide
  on Lateef (see open questions).
- [ ] Delete `public/fonts/LPMQ.ttf` (an HTML page, unused).
- [ ] Story cards: `src/lib/share/story-card-renderer.ts` draws on a canvas, so
  it must wait for `document.fonts.ready` before drawing with the new fonts.

### Phase 3: Icons (`feat(brand)`)

- [ ] Produce **one flat vector master**, `public/brand/mark.svg`: the existing
  gold N-and-mosque mark simplified to flat shapes with no bevel, gloss or
  inner glow, on emerald `#158057`. Provide a full-bleed square variant for
  maskable icons, with the mark inside the central 80% safe zone, and a
  transparent variant for the extension. **This needs a designer, or your
  approval of a vector redraw I make from the current PNG.** Everything below
  is generated from the master.
- [ ] `scripts/generate-icons.mjs` uses the already-installed `sharp` to
  produce:
  - `public/favicon.ico` (16, 32, 48), plus `public/icon.svg` for modern
    browsers
  - `public/apple-touch-icon.png` at **180×180**, on a solid emerald background
    with no transparency
  - `public/icon-192x192.png` and `icon-512x512.png` (`purpose: "any"`)
  - `public/icon-maskable-192.png` and `icon-maskable-512.png`
    (`purpose: "maskable"`)
  - `extension/icons/icon-{16,48,128,192,512}.png`
  - `android/app/src/main/res/mipmap-*/ic_launcher.png` and `ic_maskable.png`
- [ ] Remove `src/app/icon.png`, `src/app/apple-icon.png` and
  `src/app/favicon.ico/route.ts`, so the `metadata.icons` list in `layout.tsx`
  is the only source and file conventions no longer silently override it.
- [ ] `src/app/layout.tsx`: set `icons.icon` to `favicon.ico` (sizes
  `48x48`), `icon.svg` (`image/svg+xml`) and the 192 and 512 PNGs, and
  `icons.apple` to the 180 PNG. Remove the manual `<link rel="apple-touch-icon">`
  and the 404ing `-precomposed` link from `<head>`.
- [ ] `src/app/_manifest.ts`: split the `any` and `maskable` icon entries.
- [ ] `public/firebase-messaging-sw.js:61-62`: update the icon version query.
- [ ] Update `logo` and `screenshot` in the JSON-LD: logo becomes the 512 PNG,
  and screenshot becomes the new OG card (`layout.tsx`, `JsonLd.tsx:29`).

### Phase 4: OG card (`feat(seo)`)

- [ ] Replace `src/app/opengraph-image.tsx` with a new 1200×630 card built
  with `next/og`:
  - Warm paper background `#FAF8F3` with a single quiet geometric pattern at
    about 4% opacity (`public/patterns/` already exists) on the right third.
  - Left side: the flat mark (64px), the wordmark "Nawaetu" in Fraunces 600
    at 88px, the tagline in Plus Jakarta Sans at 32px ("Niat dulu, amal
    mengikuti" or the current `#NiatAjaDulu`), and a short feature line at
    24px muted ("Al-Qur'an · Jadwal Sholat · Dzikir · Kiblat").
  - Right side: an emerald panel with a cropped app screen or the large mark.
    Use no glows, gradients, or pill badges.
  - Load the font files with `fetch(new URL(..., import.meta.url))` and pass
    them to `ImageResponse` `fonts`, because `next/og` cannot use `next/font`.
- [ ] Delete `src/app/twitter-image.tsx`. When no Twitter image exists, Next
  reuses the OG image, which removes the duplicate.
- [ ] Replace `public/og-image.png` with a static 1200×630 PNG export of the
  same card, so every page has a real 16:9 card. Generate it once from the
  route, or with a script, and commit it.
- [ ] `src/lib/seo.ts:36,42`: give the images entry an object with `url`,
  `width: 1200`, `height: 630` and an `alt`. Fix the same in the `layout.tsx`
  `openGraph.images`. Keep `twitter.card: "summary_large_image"`.
- [ ] Optional, as a later follow-up: per-section cards (Quran, Sirah) that use
  the same template with a different title.
- [ ] Check with the opengraph.xyz preview, the X card validator, and a real
  WhatsApp share after deploy (WhatsApp caches previews, so test with a
  `?v=` URL).

### Phase 5: Component polish (`refactor(ui)`, several small PRs)

Work on screens in this order: home, onboarding, bottom nav, prayer, Quran
reader, dhikr, settings, and then everything else. For each screen:

- [ ] Replace raw `emerald-*`, `slate-*`, `gray-*` and `amber-*` with token
  classes such as `rgb(var(--color-primary))`. Each one fixed removes a
  `[data-theme="daylight"]` override in `globals.css`. Track the override count
  (158 today) as the progress metric, with a target below 20.
- [ ] Cards: one border, one shadow level, and `--radius-card`. Remove
  `shadow-lg`/`shadow-xl`/coloured shadows, nested cards inside cards, and
  `rounded-3xl`.
- [ ] Remove decorative `blur-3xl` glow blobs, gradient text, and infinite
  `animate-pulse` on static content. Keep motion that reports state
  (counter ticks, completion), and keep respecting `useReducedMotion`.
- [ ] Spacing uses a 4px grid with `--space-page` (16) and `--space-section`
  (24). A section heading is 18–20px Fraunces with 12px gap to its content.
- [ ] Use one primary button style per screen. Secondary actions are outline or
  ghost buttons, not a second filled colour.
- [ ] Remove the matching `!important` overrides from `globals.css` as each
  screen is migrated.
- [ ] Update `src/app/design-system/page.tsx` and `DesignSystemFixture.tsx` to
  show the final tokens. That page becomes the reference for review.

### Validation for every phase

- `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
- Coverage stays at 80% or above (the CI gate)
- Manual checks: each theme × {home, Quran, dhikr, settings} at 375px and
  desktop; first visit in a private window should be light with no dark flash;
  a returning dark user should see no light flash; keyboard focus rings should
  be visible in light mode.
- Lighthouse: fonts must not regress LCP by more than about 100ms. Two
  variable fonts plus an Arabic subset come to roughly 120–180KB woff2.

---

## 4. Decisions (2026-11-20)

1. **Fonts:** Lora (display) + Plus Jakarta Sans (body/UI). Amiri for Arabic
   only. Remove the broken `public/fonts/LPMQ.ttf`.
2. **Lateef:** removed. Quran Arabic uses Amiri.
3. **Icon:** redraw the current mark as a flat SVG and get approval before
   generating raster sizes with `sharp`.
4. **Saved themes:** never migrated. Only new or unset users get Daylight. The
   pre-paint script ships in Phase 1. Onboarding's gender suggestion for men
   also moves from Midnight to Daylight, so new users stay on the light default
   (women keep the Blossom suggestion, which is also light).
5. **OG card:** title "Nawaetu — Aplikasi Muslim untuk Ibadah Harian",
   tagline "Mulai Langkah Baikmu Hari Ini • #NiatAjaDulu".

# Onboarding and Motion Revamp Plan

**Prepared:** 11 November 2026
**Status:** Phases 0 and 1 and gender steps G1 and G2 are implemented on branch `feat/onboarding-motion` (11 November 2026), not yet released. Phases 2 to 4 wait for the two weeks of onboarding measurement described in section 8. Uzur mode (G3) is deferred by the owner; G4 copy is done for the onboarding welcome only.
**Related:** `docs/100_DAYS_LOTTIE_SHORTLIST.md` (asset rules and earlier picks), `public/lottie/CREDITS.md`.

## 1. Summary

- **Onboarding is the most static screen in the app.** It is 7 steps of icon-in-a-box cards with no transitions, and it is the first thing a new user sees.
- **The Lottie plumbing already exists.** `LottieMoment` lazy-loads a self-hosted player, respects reduced motion, and is used in five places. No new dependency is needed.
- **Recommendation: use three tools, each for one job.** Lottie for illustrated hero moments, `framer-motion` (already installed) for transitions and tap feedback, and vibration for touch feedback on Android.
- **Hard rule: the app must not get slower or less reliable.** Animation is always an extra layer on top of a screen that already works without it. The guardrails and pass/fail numbers are in section 7.
- **Gender personalization (section 9):** theme, copy, animation, missions and rewards per gender, with equal value for equal effort, plus an uzur mode for menstruation days.
- **Order of work:** onboarding first, then prayer check-in and missions, then empty states, then seasonal screens.

## 2. What the audit found

The audit is from the component inventory, searches, and a full read of `OnboardingOverlay.tsx`, `LottieMoment.tsx`, and `LottiePlayer.tsx`. Other components were located, not read line by line, so confirm each row in section 5 when opening the file.

| Area | Today |
| --- | --- |
| Lottie | `@lottiefiles/dotlottie-react` installed. Three files in `public/lottie/` (flame 13 KB, lights 11 KB, stars 2 KB). Used in the streak flame, streak toast, journey card, journey milestone dialog, and dhikr counter. |
| `framer-motion` | Installed, used in only 8 files: intentions, journal, journey card, global stats, and `AnimatedCheck`. |
| CSS motion | Four keyframes in `globals.css` (shimmer, gradient-shift, pulse-glow, ripple) and a global reduced-motion rule. |
| Loading | Four skeleton components, plus `Loader2` spinners in 18 files. |
| Haptics | None anywhere. |
| Page transitions | `src/app/template.tsx` is a passthrough. |
| Onboarding | 4 intro slides, then name, gender, location. Static Lucide icons, no slide transition, no swipe, no finish moment. |

Two things found in onboarding that are not about motion:

- The "not saved" error toast at `src/components/OnboardingOverlay.tsx:147` is hard-coded Indonesian. It should use the locale files.
- Analytics events already exist (`onboarding_viewed`, `onboarding_skipped`, `onboarding_completed`, `onboarding_location_result`), so the revamp can be measured without new tracking.

## 3. Which tool for which job

| Job | Tool | Why |
| --- | --- | --- |
| Illustrated hero (onboarding slides, milestones, empty states) | Lottie through `LottieMoment` | Already wired, lazy, self-hosted, works offline. |
| Slide transitions, swipe, tap feedback, checks, count-ups, shared-element moves | `framer-motion` | Already installed, 0 KB extra, follows theme colours automatically. |
| Skeletons, typing dots, looping glows | CSS keyframes | Cheapest, and the global reduced-motion rule already covers them. |
| Touch feedback | `navigator.vibrate` behind one small helper | Free on Android Chrome and the Android wrapper. iOS Safari ignores it, so it must be a bonus only. |

**Not recommended**

- **Rive:** a second runtime and a new dependency for the same result.
- **Route-level page transitions:** they add delay to every navigation and risk layout shift. Skip unless a specific screen needs one.
- **Sound effects:** wrong for an app used in mosques and at night.
- **Lottie for small checks and toggles:** `AnimatedCheck` already does this at 0 KB.

### Tone rules for a Muslim Gen Z audience

1. **Objects, not people.** Lanterns, crescents, mosques, books, beads, stars. No animated faces or figures praying. This matches the earlier shortlist and avoids both tone and fiqh debates.
2. **Calm over hype.** Celebration bursts stay short (under 3 seconds, played once) with no forced share prompt. Heroes and illustrations keep moving while on screen. Worship is not a slot machine.
3. **No baked-in text.** Text in an animation cannot be translated to `en` and `id`, and greeting-card text ("Eid Mubarak") is wrong outside its season.
4. **One animation per moment.** Never stack a Lottie on top of a toast on top of confetti.
5. **Feels native.** Recolour to theme variables with dotLottie theming and check all 8 themes in light and dark.

## 4. Onboarding revamp

**Keep unchanged:** `handleFinish`, the storage marker check, profile sync, the events dispatched, and the `v2` key. This is a visual change, so existing users are not shown onboarding again.

### 4.1 Flow

Cut the intro from 4 slides to 3 by merging the welcome into the first slide. Every step fewer is fewer drop-offs, and the "skip" button already shows that people want to get through fast.

| Step | Today | Proposed | Asset |
| --- | --- | --- | --- |
| Prayer | Clock icon | Mosque hero that draws itself in, then holds | `mosque.lottie` (section 6) |
| Quran | Book icon | Quran opening | New Lottie: "Quran" by Asish, 3.3 KB |
| Intention and progress (merged) | Fingerprint icon, trophy icon | Streak flame, the same one the user will see on the home screen | `flame.lottie`, already shipped |
| Name | Hands icon, text input | Waving hand that loops as a greeting, plus a live greeting that types back the name as the user enters it | `wave.lottie` ("Waving hand" by Jitu, 4 KB), `framer-motion` |
| Gender | Two buttons | Spring on select, `AnimatedCheck` instead of the static check | `framer-motion` only |
| Location | Pin icon, spinner | Pin drops and pulses while detecting, check draws on success | New Lottie pin (about 1 to 2 KB), `AnimatedCheck` |
| Finish | Overlay just closes after 1 second | Stars burst with "Bismillah, {name}" before the home screen appears | `stars.lottie`, already shipped |

### 4.2 Interaction

- **Slide transitions:** `AnimatePresence` with a short horizontal slide and fade (about 250 ms), direction-aware for Back.
- **Swipe:** drag left and right between intro slides. Buttons stay, for keyboard and accessibility.
- **Progress:** one continuous bar across all steps with an animated fill, replacing the separate bar and dots.
- **Haptics:** a light tick on Next and on gender select, a longer one on finish.
- **Copy:** tighten titles while editing the slides. Both locale files change together.

### 4.3 Risks specific to onboarding

- **First-paint cost.** Onboarding is the first screen, so the Lottie player downloads there for every new user. The player's WASM is 1.2 MB (about 480 KB compressed), far larger than the animations themselves. `LottieMoment` shows nothing while it loads. **Fix:** render the current Lucide icon immediately, start loading the player only after the page is idle, and swap the animation in when it is ready. If it never arrives, the icon stays. See section 7.
- **Offline first run.** The service worker already precaches the WASM and the three shipped `.lottie` files, so repeat visits and offline use are covered. New files in `public/lottie/` should be picked up the same way; confirm in the built `sw.js` after adding them.
- **Reduced motion.** Every hero falls back to the existing icon. Slides change with no movement.

### 4.4 Measure

Compare `onboarding_completed / onboarding_viewed` and the share of `onboarding_skipped` for two weeks before and after. Add a `version` value (for example `v2-motion`) to the existing events so the two groups can be told apart. Do not change the stored `v2` marker.

## 5. Other features

Ordered by payoff. "Earned" means the animation plays only when the user achieves something.

### Priority 1: daily core loop

| Feature | Where | Proposal | Tool |
| --- | --- | --- | --- |
| Prayer check-in | `src/components/PrayerCheckInWidget.tsx` | Check draws on tap with a light haptic. When all five prayers are logged, one stars burst | `AnimatedCheck`, `stars.lottie` |
| Mission complete | `src/components/MissionsWidget.tsx`, `missions/DailyMissionCard.tsx` | Check draw on each. A burst only for the first mission of the day | `framer-motion`, `stars.lottie` |
| Bottom navigation | `src/components/BottomNav.tsx` | Active indicator slides between tabs | `framer-motion` `layoutId` |
| Qibla aligned | `src/components/QiblaCompass.tsx` | Soft pulse and a haptic when the needle locks on | `framer-motion`, vibration |
| Mentor AI reply | `src/app/mentor-ai/components/` | Three-dot typing indicator while waiting | CSS |

### Priority 2: empty and first-use states

| Feature | Where | Proposal | Tool |
| --- | --- | --- | --- |
| Bookmarks, journal, dhikr history, chat history | `src/app/bookmarks`, `src/app/journal`, `dhikr/DhikrHistory.tsx`, `mentor-ai/components/ChatHistorySidebar.tsx` | One small illustration, looping gently while visible, with a clear next action | Lottie, reuse the Quran and moon files |
| Rewards and levels | `src/app/rewards`, see `HASANAH_LEVELS_AND_REWARDS_PLAN.md` | Badge on level-up | New Lottie: "Badge" 3.0 KB |
| Stats | `src/components/stats/` | Numbers count up and chart bars grow on first view | `framer-motion` |
| Khatam complete | `ramadhan/KhatamanProgress.tsx` | Badge, played once | Same Badge file |

### Priority 3: seasonal (before Ramadan)

| Feature | Where | Proposal | Tool |
| --- | --- | --- | --- |
| Ramadan hero and Wrapped | `ramadhan/RamadhanHeroCard.tsx`, `RamadhanWrappedCard.tsx` | Lights as the header | `lights.lottie` |
| Lailatul Qadr | `ramadhan/LailatulQadrCard.tsx` | Lights at its original speed, with no burst on top | `lights.lottie` |
| Eid | `ramadhan/EidCard.tsx` | Lights plus one burst | `lights.lottie`, `stars.lottie` |

### Leave alone

- **Quran reading view:** motion distracts from reading.
- **Dhikr counter taps:** already has ripple and a milestone burst. Add haptics only.
- **Payment and donation modals:** keep plain. Celebrating money is off-tone.
- **Spinners in 18 files:** they work. Replace with skeletons only when touching that screen anyway.

## 6. Assets

**Already shipped, reuse first:** `flame.lottie`, `lights.lottie`, `stars.lottie`.

**Already license-checked on 10 Nov 2026 (earlier shortlist), not yet downloaded:** "Quran" by Asish (3.3 KB), "Badge | Achievement Unlocked!" by Parimal Chahande (3.0 KB), "Clear Night Moon" by Akhil Atluri (2.1 KB).

**New, to be sourced.** These came from a search on 11 Nov 2026. I have not opened the pages, watched them play, or confirmed the license of each.

| Need | Where to look | Notes |
| --- | --- | --- |
| Mosque hero (prayer slide) | **Chosen:** ["Faisal Mosque" by Rana Adeel Farrukh](https://lottiefiles.com/free-animation/faisal-mosque-9tRlJCX1th), 16 KB | Object-only and inside the 50 KB limit. The more generic ["Mosque Animation" by Abdul Latif](https://lottiefiles.com/free-animation/mosque-animation-0G5ZytIlNk) looks closer to the brand teal but is 88 KB, over the limit. |
| Location pin | ["Map Location Pin" by Abhishek dewangan](https://lottiefiles.com/free-animation/map-location-pin-DwVGC7Rt6G), about 1.2 KB, listed as themeable | Fallback: ["Location Map Pin" by Hacker Man](https://lottiefiles.com/2502-location-map-pin), about 2 KB |
| Tasbih (optional, dhikr empty state) | [tasbih](https://lottiefiles.com/free-animations/tasbih) | Only 2 free results. "Prayer Beads" by Pickolab is Premium, so skip it. |

**License.** LottieFiles states that free animations under the Lottie Simple License may be used in commercial apps, and that credit is encouraged but not required. Some animations carry other terms, so the license is checked per page on the day of download. The earlier shortlist flagged the "Commercial Use Policies" page as ambiguous. On reading the summary again, that page covers LottieFiles' own tools and excludes public animations, but an email to support@lottiefiles.com before launch is still cheap insurance.

**Rules for every file** (unchanged from the shortlist): dotLottie format, about 50 KB or less, self-hosted in `public/lottie/`, a row in `CREDITS.md`, no baked-in text, checked on all 8 themes, static fallback under reduced motion.

**Budget:** about 10 to 15 KB of new files for onboarding, about 25 KB for the whole plan.

## 7. Performance and reliability guardrails

**Two principles, both binding:**

1. **The animation is the point.** On a normal phone the user sees every animation move, in full, as its creator made it. The guardrails below change *when and how* an animation loads, never *whether* it plays.
2. **The app never waits for it.** Every screen works with the animation removed, and animation never gates a tap, a save, or a navigation.

### 7.0 Keeping the animation true

| Rule | What it means in practice |
| --- | --- |
| Play it whole | Always start from the first frame and play to the end. Never start mid-way because the player arrived late, and never cut it short |
| Keep the creator's timing | No speeding up, slowing down, or dropping frames to save work. Original speed and easing |
| Keep it alive on screen, the way it was drawn | Files drawn as a loop (flame, location pin) repeat for as long as they are visible. Files that build themselves in (mosque, Quran) play once and hold their finished frame, because looping them makes the picture vanish and redraw every two seconds. Celebration bursts (stars, badge) play once |
| The icon is a stand-in, not the design | Onboarding uses `quietLoad`: the player starts loading immediately, the box stays empty and fixed-size until the animation is ready, then it fades in. No icon is shown first, because icon-then-animation looked like a glitch. The icon is the final state only when the user turned on reduced motion, the player failed, or the device cannot run it. Secondary moments (streak toast, journey card) may still use the icon while loading |
| Recolour, do not redraw | Theming may change colours to fit the 8 themes. It must not remove layers or change movement. (Two exceptions exist, both for layers that only work on a white page: the glint removed from `stars.lottie` and the white ground bar removed from `mosque.lottie`. Any edit like that is recorded in `CREDITS.md`.) |
| Fix the loading before cutting the motion | If a budget in 7.4 is missed, the order of remedies is: load later, load smaller, simplify the surrounding code. Removing or freezing an animation is the last resort and needs your approval |
| Measure that it actually played | Phase 1 adds an analytics event when an onboarding hero starts playing, so the share of users who saw motion is known. Target: at least 90% of users without reduced motion |

### 7.1 What is already safe

| Fact | Checked how |
| --- | --- |
| The Lottie player is a lazy chunk, not in the main bundle | `LottieMoment` loads it with `next/dynamic`, `ssr: false` |
| The WASM is self-hosted and precached for offline | Listed in the built `public/sw.js` |
| The three shipped `.lottie` files are precached | Listed in the built `public/sw.js` |
| Web vitals are already reported from real users | `src/components/WebVitals.tsx` posts to `/api/analytics` |
| A bundle report exists | `npm run analyze` |

### 7.2 Where the risk is

| Risk | Why it matters | Guardrail |
| --- | --- | --- |
| **Player WASM is 1.2 MB (about 480 KB compressed)** | On a first visit it would compete with the app's own code on a slow phone | Start loading it right after first paint, not during it. The icon shows for that short gap, then the animation plays from its first frame. Once loaded, the player is reused, so slides 2 and 3 and every later moment animate instantly |
| Measured 11 Nov 2026 (4x CPU slowdown, ~10 Mbps with 150 ms latency, cold cache) | Mosque hero first paint was 2.25 s, with the WASM starting at 1.53 s when the first player mounted | **Fixed:** the entry gate starts the onboarding code and the player at hydration when there is no onboarding marker, and the player calls `DotLottie.preload()` on import. The WASM now starts at about 1.02 s and the hero paints at about 1.76 s (0.6 s after first paint, the WASM transfer itself). Frame rate stayed at 60 with no janks before and after |
| Animation delays an action | A check-in that waits for an animation feels laggy | State and storage update first, animation plays after, and is never awaited |
| Several canvases at once | Each Lottie is a live canvas; several on one screen drain battery and drop frames | At most one Lottie playing per screen. Lists never contain a Lottie per row |
| Looping animations | A loop runs forever, including off-screen | Loops are allowed while visible (section 7.0). They pause when off-screen or when the tab is hidden, and resume when back in view |
| `framer-motion` animating layout | Animating width, height, top, or left forces layout on every frame | Animate only `transform` and `opacity`. Use `layoutId` sparingly (bottom navigation only) |
| `framer-motion` spreading into the main bundle | It is used in 8 files today; adding it to always-loaded components such as `BottomNav` and `PrayerCheckInWidget` moves it into the first load | Check `npm run analyze` before and after. If first-load JS grows beyond the budget, use CSS transitions for those components instead |
| Layout shift | A hero that appears late pushes content down | Every animation box has a fixed size in its `className`, and the fallback has the same size |
| Player fails (old WebView, blocked WASM, low memory) | A blank hole or a crash on the first screen | Fallback icon stays if the player does not load. Wrap the player in an error boundary that renders the fallback |
| Low-end Android | Much of the Indonesian audience uses budget phones | Test on a throttled profile (4x CPU slowdown, slow 4G) and one real budget device. The animation must still play there, smoothly |

### 7.3 Changes this adds to the work

All of this lives in `LottieMoment`, so every current and future use gets it:

1. Show `fallback` while loading and on error, then cross-fade to the animation once it is ready.
2. Start the player import right after first paint (`requestIdleCallback`, with a short timeout so it is never postponed for long).
3. Pause when off-screen or when the tab is hidden, resume when visible.

Data saver is deliberately **not** a reason to skip animation: the files are tiny and the player is precached anyway, so skipping would cost the motion and save almost nothing.

A test for 1 goes in `LottieMoment.test.tsx`.

### 7.4 Pass or fail before each phase ships

Measure on the production build, before and after, on the same throttled profile.

| Measure | Budget |
| --- | --- |
| First-load JS for the home route (`npm run analyze`) | No more than 5 KB compressed above the baseline |
| LCP, INP, CLS from real users (`/api/analytics`) | No regression at the 75th percentile over the two weeks after release |
| Lighthouse mobile performance score, home and first-run onboarding | Within 2 points of the baseline |
| Frame rate during onboarding slide change and prayer check-in (Chrome Performance panel, 4x CPU slowdown) | No long tasks over 50 ms caused by the animation |
| Total `.lottie` weight | 50 KB or less per file, about 25 KB added for the whole plan |
| Tap-to-saved time for prayer check-in and mission complete | Unchanged; the animation starts after the state update |

| Share of users who saw the onboarding hero play | At least 90% of users without reduced motion |
| Time from onboarding shown to hero moving, throttled first visit | Under about 2 seconds; instant on later slides |

A phase that misses a speed budget does not ship until it is fixed, following the order of remedies in section 7.0. A phase that hits the speed budgets by not animating also fails. The baseline is recorded in phase 0, before any change.

### 7.5 Rollback

Each feature's animation is a leaf component with a static fallback, so removing one is a one-line change that cannot affect data. No stored data or API changes anywhere in this plan.

## 8. Phases

| Phase | Work | Size |
| --- | --- | --- |
| 0 | Record the performance baseline (section 7.4). Source and preview the assets, add to `CREDITS.md`. Harden `LottieMoment` (section 7.3). Add a `haptic()` helper in `src/lib/`. | Small |
| 1 | Onboarding revamp (section 4), locale fix for the hard-coded toast, both locale files. | Medium |
| 2 | Priority 1 features. | Medium |
| 3 | Priority 2 features. | Medium |
| 4 | Priority 3 features, timed before Ramadan. | Small |

Each phase ships on its own. Phase 1 gets two weeks of measurement before phase 2 copies its patterns.

**Validation per phase:** `npm run lint`, `npm run typecheck`, focused tests (`ClientEntryGate.test.tsx`, `LottieMoment.test.tsx`, and a new onboarding test for step order, skip, and finish), coverage kept above the 80% CI threshold, then a manual pass on a phone: all 8 themes, reduced motion on, offline, and both languages. The performance budgets in section 7.4 are a release gate, not a nice-to-have.

## 9. Gender personalization

**Goal:** after the gender step, the app should feel like it was made for that user: theme, copy, animation, missions, and rewards. The rule that keeps this right: **personalize the content, never the value.** Men and women get different missions and words where the fiqh or the culture differs, but the same reward for the same effort, and the same respect.

### 9.1 What gender does today

Found by searching every read of `USER_GENDER` and `session.user.gender`.

| Area | Today | Where |
| --- | --- | --- |
| Missions | Male: Friday prayer (200 Hasanah). Female: qadha fasting tracker, dhikr during menstruation, shalawat 100x | `src/data/missions/daily.ts`, `useWidgetMissions.ts`, `missions/page.tsx` |
| Prayer check-in | Male (and unknown): sheet asking "alone" (25) or "congregation at the mosque" (75); Friday Dhuhr becomes Jumat (200). **Female: always 25, no choice** | `PrayerCheckInWidget.tsx:289-292, 456` |
| Prayer card | Friday Dhuhr shows as Jumat for men | `PrayerTimeCard.tsx:51` |
| Fasting | Menstruation, postpartum, pregnant, breastfeeding statuses hidden for men | `FastingCalendar.tsx`, `FastingDayModal.tsx` |
| Missions widget | Different header icon only | `MissionsWidget.tsx:238` |
| Theme | **Nothing.** No code reads gender for the theme | `ThemeContext.tsx` |
| Copy, animation, AI mentor | Nothing | — |

Problems found:

1. **The gender step is misleading.** The options say "Blue Theme" and "Pink Theme", while the line above says gender is "not your theme". Neither is true today.
2. **Women earn a third of the Hasanah for the same daily prayer** (25 against 75). For women, praying at home is not the lesser option: the hadith "her prayer in her house is better than her prayer in her courtyard…" (Sunan Abi Dawud) says the opposite, and women are still allowed the mosque ("do not prevent the female servants of Allah from the mosques of Allah", Bukhari and Muslim). Gamifying on top of this gap would make it worse.
3. **Unknown gender gets the alone-or-congregation sheet** in prayer check-in. On re-check this is acceptable, since women may also pray in congregation; Jumat and the female-only statuses are already limited to a known gender.
4. **No support for menstruation days.** During haid a woman does not pray, but the prayer widget still shows five unchecked prayers and the prayer push notifications still fire. For about a quarter of every month, the core screen tells her she is failing. This is the biggest gap for female users.
5. Gender is read from storage-or-session in six places with copy-pasted code.
6. **Found while building G1: the server cut every prayer reward back to 25.** Sync validated rewards against the base prayer mission (25, no options), so a signed-in man's 75 for congregation was stored on the server as 25. Fixed with the gender change: validation now accepts every reward any gender can earn (`missionRewardOptions` in `src/data/missions/index.ts`). Jumat (200) uses its own mission id and was not affected.

### 9.2 What changes, by layer

**Fairness fixes (do first, small)**

- **Done.** Women: one tap logs the prayer at 75, with no sheet, because both places would pay the same and a choice that changes nothing is an extra tap. Men keep alone 25 and congregation 75. Jumat stays 200 for men.
- Unknown gender: unchanged (see problem 3).
- One `useGender()` hook to replace the six copies: **not done yet.** It is a refactor with no visible change, so it waits until those files are touched for G4.

**Gender step (onboarding)**

- **Done.** Copy rewritten so it is true: why we ask, and that the theme is only a suggestion that can be changed anytime.
- **Done.** A hero animation above the title: stars before a choice, lanterns for male, cherry blossom for female, using `quietLoad` like the rest of onboarding.
- **Done. Phone check (11 Nov 2026):** 375, 360, 390 and 412 px wide viewports, every onboarding screen. No horizontal overflow, no cut-off text, all primary buttons inside the screen. The Next button text colour now follows the theme (dark on bright themes, white on dark), with contrast 4.85 to 8.08 on Midnight, Default, Ocean and Blossom.
- **Done. Theme survives Detect My Location (11 Nov 2026).** A saved `default` theme (what an unchosen theme stores) now counts as unchosen, so onboarding suggests Midnight or Blossom and the choice holds after location detection. Before this fix, a browser with a saved default kept the emerald theme through the whole onboarding. Checked in Anoa on the Male path with a saved default: Midnight before and after detection.
- **Done. Theme follows the active theme, pattern included (11 Nov 2026).** The onboarding applies its start theme in a layout effect, so no frame of the default green shows, and it draws the active theme's pattern above its backdrop on every screen: stars for Midnight, floral for Blossom. A saved theme is never overridden.
- **Done. Live theme preview:** onboarding starts on Midnight, and selecting an option applies its suggested theme straight away. The theme can be changed later in settings; there is no undo link on this screen (removed at the owner's request, 11 Nov 2026). A theme the user had already saved before onboarding is never overridden.
- Haptic tick and spring on select (already in place).

**Theme**

Suggested defaults, applied only on first setup and only if the user has not picked a theme already:

| Gender | Suggested | Alternates shown in settings first |
| --- | --- | --- |
| Male | Midnight (blue) | Ocean, Royal, Default |
| Female | Blossom (pink, light mode) | Lavender, Sunset, Default |

Midnight replaced the earlier Ocean proposal: Ocean turned out to be teal, and Midnight is the app's blue theme. Showing a gender's alternates first in settings is not built yet.

No theme is locked to a gender. Settings show the gender's alternates first, then all others.

**Copywriting**

Gender-aware variants for greetings and celebrations only, through the existing locale files (`en` and `id`), for example:

| Moment | Male (`id`) | Female (`id`) | `en` (both) |
| --- | --- | --- | --- |
| Name greeting | "Assalamu'alaikum, akhi {name}" | "Assalamu'alaikum, ukhti {name}" | "Assalamu'alaikum, {name}" |
| Welcome | "Bismillah, {name}. Gas, akhi!" | "Bismillah, {name}. Yuk mulai, ukhti!" | "Bismillah, {name}. Let's begin." |
| Streak kept | "Konsisten banget, akhi" | "MasyaAllah, istiqomah terus, ukhti" | unchanged |

`akhi` and `ukhti` only in Indonesian, where Gen Z users use them naturally. English stays neutral, because "brother/sister" reads stiff there. Mission names, fiqh text, and dalil stay as they are.

**Lottie** — see 9.3.

**Gamification**

Same tiers and same point values for both; different content where the fiqh differs:

| | Male | Female | Both |
| --- | --- | --- | --- |
| Weekly highlight | Jumat streak (consecutive Fridays) | Al-Kahf on Friday (already a sunnah for both, framed as her Friday mission) | — |
| Prayer badges | "Subuh di masjid" count | "Tepat waktu" (on-time) count | Five-prayer days |
| Uzur-aware | — | Streak is protected during haid; uzur missions count (dhikr, dua, listening to Quran, sadaqah) | — |
| Badge copy | "Penjaga Subuh" | "Penjaga Waktu" | Level names unchanged |

Builds on `HASANAH_LEVELS_AND_REWARDS_PLAN.md`; no new level system.

**Uzur mode (menstruation and postpartum)**

The most valuable item for female users. Off unless she turns it on.

- A switch on the prayer widget: "Sedang berhalangan" / "On my period".
- While on: the five prayers are replaced by a calm card with uzur missions; prayer-time push notifications pause; the streak continues through uzur missions and is never broken by the missing prayers.
- Turns off by her, or automatically after 15 days (the maximum length of haid in the Syafi'i school), with a reminder about qadha of fasting, not of prayer.
- **Privacy:** stored on the device only, never synced, never sent to analytics, never shown on share cards or Wrapped. This is health data.

**AI mentor**

Pass gender as context so the mentor uses the right fiqh rulings and, in Indonesian, the right form of address. No separate personality.

### 9.3 Lottie per gender

Same rules as section 3: objects, not people. The free catalog is thin here: on 11 Nov 2026 almost every "hijab" or "muslimah" animation was a figure, and searches for kopiah or peci returned nothing.

| Use | Male | Female | Status |
| --- | --- | --- | --- |
| Gender hero | `lights.lottie` lanterns, gold as drawn | `blossom.lottie`: ["cherry blossom" by Mishal Alnazawi](https://lottiefiles.com/free-animation/cherry-blossom-dZ3c1KjOBv), 4.4 KB | **Shipped.** Blossom license checked 11 Nov 2026. "A simple rose" rejected: light-blue leaves and a ground line |
| Welcome burst | `stars.lottie`, tinted to the chosen theme | same | Shipped |
| Uzur card | — | `moon` / "Clear Night Moon" from the earlier shortlist | Checked 10 Nov, not downloaded |
| Jumat check-in | `mosque.lottie` | — | Shipped |
| Prayer mat (neutral, both) | ["hand-drawn mat"](https://lottiefiles.com/free-animation/hand-drawn-mat-i1bMlgk9ls) | same | Search only |

**Recolour, do not redraw** (section 7.0) applies: one animation file per object, tinted per theme with dotLottie theming, rather than separate "blue" and "pink" files. If the female candidates do not hold up when previewed, the fallback is the same lanterns in Blossom colours.

### 9.4 Where the code changes

| Change | Files |
| --- | --- |
| `useGender()` | new `src/hooks/useGender.ts`; replace reads in `PrayerCheckInWidget.tsx`, `PrayerTimeCard.tsx`, `missions/page.tsx`, `useWidgetMissions.ts`, `FastingTrackerWidget.tsx`, `MissionsWidget.tsx` |
| Fair rewards, neutral unknown | `PrayerCheckInWidget.tsx` |
| Gender step, live theme preview | `OnboardingOverlay.tsx`, `ThemeContext.tsx` (read only), both locale files |
| Suggested theme map, copy variants, animation per gender | one small `src/lib/personalization/gender.ts` (data only) |
| Uzur mode | `PrayerCheckInWidget.tsx`, notification scheduling in `src/lib/notifications/`, streak in `src/lib/habits/streak-utils.ts`, new missions in `src/data/missions/` |
| Gamification content | `src/data/missions/`, badge copy in locale files |
| AI mentor | the mentor's system prompt builder in `src/app/api/` |

No database schema change: gender is already stored. Uzur mode stays on the device.

### 9.5 Order and measurement

| Step | Work | Size |
| --- | --- | --- |
| G1 | Fairness fixes, `useGender()`, true copy on the gender step | Small |
| G2 | Gender step revamp: animations, live theme preview, suggested theme | Small |
| G3 | Uzur mode | Medium |
| G4 | Copy variants and gamification content | Medium |
| G5 | AI mentor context | Small |

G1 can ship with the onboarding release. G3 needs a review of the fiqh text by someone qualified, the same way `100_DAYS_DALIL_REVIEW.md` was done.

Measure with existing events plus `version` labels: suggested theme still in use after 7 days (target above 50%); D7 and D30 retention by gender, before and after; female prayer check-ins per week. **No analytics events for uzur mode.**

### 9.6 Risks

- **Stereotyping.** Blue and pink can feel patronizing to some Gen Z users. Mitigation: suggestion only, one tap to undo, and alternates for each.
- **Fiqh differences between schools.** Haid length and the reward framing differ between madhhabs. Mitigation: follow the Syafi'i school the app already uses for Indonesia, state it in the guidance, and get G3 reviewed.
- **Changing gender later** must re-resolve missions, theme suggestion (only if still on the suggested theme), and copy. Past Hasanah is not recalculated.

## 10. Decisions needed

1. **Merge intro slides from 4 to 3?** Recommended yes.
2. **Objects only, no people?** Recommended yes, as in the earlier shortlist.
3. **Haptics on Android?** Recommended yes, with a settings toggle only if users ask.
4. **Email LottieFiles support about commercial use before launch?** Recommended yes.
5. **Accept the performance budgets in section 7.4 as a release gate?** Recommended yes. The numbers are my proposal; adjust them if you have stricter targets.
6. **Equal prayer reward for women?** **Decided yes (11 Nov 2026), built.**
7. **Gender-suggested theme on first setup?** **Decided yes, built** with Midnight / Blossom.
8. **`akhi` / `ukhti` in Indonesian copy?** **Decided yes.** Built for the onboarding welcome; the streak and other celebrations come with G4.
9. **Uzur mode?** **Deferred by the owner (11 Nov 2026).** The design in 9.2 stays as the starting point.

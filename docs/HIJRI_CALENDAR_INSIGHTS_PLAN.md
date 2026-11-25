# Hijri Calendar: Fasting Accuracy and Monthly Insights Plan

**Status:** Implemented on `feat/hijri-calendar-insights` (25 November 2026). Owner decisions in §9; differences from this plan in §10
**Prepared:** 25 November 2026
**Goal:** Make the Hijri calendar correct about fasting rulings and turn it from a date grid into a place that explains what each month means and what to do in it, without adding claims that lack a sound source.

## 1. What is wrong today

Screenshot: Ramadan 1448H month view (`/hijri-calendar`).

| # | Problem | Cause in code |
| --- | --- | --- |
| 1 | Ramadan days show a "Puasa dianjurkan" dot on Mon/Thu and 13–15, as if fasting were optional and only some days counted. Every day of Ramadan is an obligatory fast (QS. Al-Baqarah 2:183–185). | `getHijriEvents` in `src/data/hijri-events.ts` has no case for month 9, so it falls through to the weekly and monthly sunnah rules. |
| 2 | Ayyamul Bidh (13–15) is marked in Ramadan. It is a voluntary fast, and the obligatory fast already covers those days. The same goes for Mon/Thu. | Same as #1. |
| 3 | The selected-day panel for 1 Ramadan says "Tidak ada amalan yang ditandai" (no marked practice), on the first day of the obligatory fast. | Same as #1. The panel only lists `getHijriEvents` results. |
| 4 | Mon/Thu, Ayyamul Bidh, Muharram, Arafah and the other sunnah fasts share one dot. Prohibited days use a red dot of the same shape in the grid, while the legend shows a triangle, so the grid and the legend disagree. Colour alone separates them, which fails for colour-blind users and on light themes where the red is pale. | `HijriCalendarPageContent.tsx:230` renders a single `h-1.5 w-1.5` dot for any event and only changes its colour. |
| 5 | The page tells the user nothing about the month itself: why it matters, what the Prophet Muhammad SAW did in it, and what to prepare for next. Nawaetu already has this material (`src/data/ramadhan/practices.ts`, `lailatul-qadr-guide.ts`, `zakat-intentions.ts`), but the calendar does not link to it. | No month-level content exists. Only the "Sejarah di Bulan Ini" history card is month-aware. |

## 2. Fiqh rules the calendar should follow

These are the rules the data layer encodes. References are listed so a reviewer can check each one. Before shipping, check every hadith number against `src/data/ramadhan/practices.ts` (which already holds evidence for several of these) or HadeethEnc, and reuse that text rather than writing new translations.

### 2.1 Fasting status per day (priority order, first match wins)

1. **Prohibited (haram):** 1 Syawal (Idulfitri), 10 Dzulhijjah (Iduladha), 11–13 Dzulhijjah (Tasyrik). *Bukhari 1990, Muslim 1137; Muslim 1141.* Already correct.
2. **Obligatory (wajib):** every day of Ramadan, 1 to 29 or 30. *QS. Al-Baqarah 2:183–185.* **New.** When it matches, no sunnah fast is listed for that day.
3. **Recommended (sunnah):** the existing rules, unchanged outside Ramadan:
   - Weekly: Monday and Thursday. *Muslim 1162; Tirmidhi 747.*
   - Monthly: Ayyamul Bidh, 13–15 of each month. *Nasa'i 2424; Tirmidhi 761.*
   - Annual: Muharram, Tasu'a (9), Asyura (10) *Muslim 1163, 1134, 1162*; six days of Syawal *Muslim 1164*; Arafah, 9 Dzulhijjah, for those not on Hajj *Muslim 1162*.
4. **Caution, shown in the day panel only, with no grid marker.** The grid stays limited to the clear rulings (wajib, sunnah, haram). Cautions depend on context (habit, qadha, madhhab, the days around it), so a marker would oversimplify them. The home fasting card already shows the same advice.
   - The last one or two days of Sya'ban, unless it is a habitual fast or a make-up fast. *Bukhari 1914, Muslim 1082.* Same rule as `preRamadan` in `src/lib/fasting-guide.ts`.
   - After 15 Sya'ban, for Syafi'i users or users with no madhhab set (see §2.3). *Abu Dawud 2337, Tirmidhi 738.* Same rule as `afterMidSyaban`. Always worded "ulama berbeda pendapat", never "dilarang".
   - Singling out Friday alone. *Bukhari 1985, Muslim 1144.* Shown on Fridays: "Jika berpuasa, sertakan hari Kamis atau Sabtu."

### 2.3 Madhhab

The grid and the wajib, sunnah and haram rulings are the same for everyone, so two users comparing calendars never see different markers. The madhhab setting (already stored and used by `fasting-guide.ts`) changes only two lines of day-panel and month-card copy:

| Topic | No madhhab set | Syafi'i | Hanafi | Maliki / Hanbali |
| --- | --- | --- | --- | --- |
| Fasting after 15 Sya'ban | Caution shown, with "ulama berbeda pendapat" | Caution shown | Not shown | Not shown |
| Earliest time to pay zakat fitrah | "Paling lambat sebelum shalat Id. Waktu paling awal berbeda menurut mazhab." | From the start of Ramadan | Allowed before Ramadan too | One or two days before Eid |

Everything else uses one wording. The settings link ("Atur mazhab") appears only next to these two lines.

### 2.2 Things the calendar must not claim

- **No special fast or prayer for Rajab, Nisfu Sya'ban, Isra Mi'raj or Maulid** as acts of worship tied to that date. The hadiths usually quoted for them are weak or disputed. Rajab can be shown as one of the four sacred months (*QS. At-Taubah 9:36; Bukhari 3197*). Isra Mi'raj and the Prophet's birth can appear in the history card only if the sirah data dates them, and with the note that the exact date is disputed.
- **17 Ramadan as Nuzulul Quran** is shown, with an explanation that separates what is certain from what is disputed (copy in §3.4).
- **Lailatul Qadar is never pinned to one night.** Mark the odd nights of the last ten. *Bukhari 2017.*
- Hijri dates are calculated and may differ from the local announcement by a day. Every ruling marker inherits that uncertainty, so the "Sesuaikan tanggal" link stays visible.

## 3. Ramadan: what the calendar should show

### 3.1 In the grid

- Every day carries the **obligatory** marker (see §4). Mon/Thu and Ayyamul Bidh markers disappear.
- The last ten nights (21–30) get a subtle tile treatment (for example a top border in `--color-accent`) so the "sprint" is visible at a glance.
- Odd nights (21, 23, 25, 27, 29) get the Lailatul Qadar marker.
- Today keeps its existing outline. The selected day keeps its filled style.

### 3.2 In the selected-day panel

Replace "Tidak ada amalan yang ditandai" with a short stack. Example for 21 Ramadan:

> **Puasa Ramadan (wajib)** · Hari ke-21 dari 30
> **Sepuluh malam terakhir:** perbanyak qiyamul lail dan i'tikaf.
> **Malam ganjil, carilah Lailatul Qadar.** Malam ke-21 dimulai saat Maghrib pada 20 Ramadan (Min, 28 Feb) sampai Subuh.
> → Panduan Lailatul Qadar · → Doa & dzikir

The night-before rule matters and most apps get it wrong: the Islamic day begins at Maghrib, so "malam 21" is the evening of the Gregorian day before 21 Ramadan. The panel should state the Gregorian evening explicitly.

### 3.3 Month card: "Amalan di Bulan Ramadan"

Part of the month card (§5.1), placed above "Sejarah di Bulan Ini". It shows three practices, then "Lihat semua". Each line is one sentence; the dalil opens on tap (§6.1), so the card stays short. Each line links to content Nawaetu already has.

| Practice | Short copy (id) | Source | Links to |
| --- | --- | --- | --- |
| Puasa wajib | Wajib bagi setiap Muslim yang baligh, berakal, dan mampu. Yang sakit atau bepergian menggantinya di hari lain. | QS. Al-Baqarah 2:183–185 | Fasting tracker, rulings (`rulings.ts`) |
| Sahur | Makan sahur, karena di dalamnya ada berkah. Akhirkan sahur. | Bukhari 1923, Muslim 1095 | Imsak time in Jadwal Ramadan view |
| Menyegerakan berbuka | Berbukalah segera setelah Maghrib, dengan kurma atau air. | Bukhari 1957, Muslim 1098 | Sunnah foods in `practices.ts` |
| Qiyam Ramadan / Tarawih | Siapa yang shalat malam di bulan Ramadan karena iman dan mengharap pahala, diampuni dosanya yang telah lalu. | Bukhari 37, Muslim 759 | Tarawih tracker (`/api/ramadhan/taraweh`) |
| Tadarus Al-Quran | Ramadan adalah bulan diturunkannya Al-Quran. Jibril AS bertadarus Al-Quran bersama Nabi Muhammad SAW setiap malam Ramadan. | QS. Al-Baqarah 2:185; Bukhari 6 | Quran reader, khatam target |
| Sedekah | Nabi Muhammad SAW paling dermawan di bulan Ramadan. Memberi makan orang berbuka bernilai pahala puasanya. | Bukhari 6; Tirmidhi 807 | Charity evidence in `practices.ts` |
| Sepuluh malam terakhir & i'tikaf | Nabi Muhammad SAW bersungguh-sungguh di sepuluh malam terakhir dan beri'tikaf di masjid. | Muslim 1175; Bukhari 2026 | `ITIKAF_GUIDE_ITEMS` |
| Lailatul Qadar | Lebih baik dari seribu bulan. Carilah di malam-malam ganjil sepuluh terakhir. | QS. Al-Qadr 97:3; Bukhari 2017 | `LailatulQadrGuideModal` |
| Zakat fitrah | Wajib, ditunaikan paling lambat sebelum shalat Idulfitri. Waktu paling awal mengikuti mazhab (§2.3). | Bukhari 1503, 1511; Muslim 984 | `ZakatFitrahCalculatorModal` |
| Umrah di bulan Ramadan | Pahalanya setara haji (bukan pengganti haji wajib). | Bukhari 1782, Muslim 1256 | None (info only) |

Day-specific notes, shown in the day panel only. The grid already carries the wajib bar and the odd-night crescent, and the history card already carries Badar, so none of these repeat elsewhere:

| Day | Day-panel note |
| --- | --- |
| 1 Ramadan | "Awal Ramadan, pasang niat puasa sejak malam." Links to intentions (`intentions.ts`). |
| 17 Ramadan | Nuzulul Quran (§3.4). |
| 21–29 odd | Lailatul Qadar (§3.2). |
| Last 2 days | "Tunaikan zakat fitrah sebelum shalat Id." |
| Last day | "Malam ini malam takbiran. Takbir dimulai saat Maghrib sampai shalat Id." (*QS. Al-Baqarah 2:185*) |

Historical events (Badar 17 Ramadan 2 H, Fathu Makkah 20 Ramadan 8 H if the sirah data dates it) stay in the history card only.

### 3.4 Nuzulul Quran explanation

Shown in the history card for Ramadan and in the day panel for 17 Ramadan. It has a short form that is always visible and a "Kenapa tanggal ini?" expander.

**id, short:** "Nuzulul Quran: peringatan turunnya Al-Quran pertama kali kepada Nabi Muhammad SAW. Di Indonesia diperingati setiap 17 Ramadan."

**id, expanded:**
> **Yang pasti:** Al-Quran mulai diturunkan pada bulan Ramadan (QS. Al-Baqarah 2:185), pada malam Lailatul Qadar (QS. Al-Qadr 97:1). Wahyu pertama adalah awal Surah Al-'Alaq, di Gua Hira.
> **Yang diperselisihkan:** tanggalnya. Sebagian ulama berpendapat 17 Ramadan, dengan merujuk QS. Al-Anfal 8:41 tentang "hari Al-Furqan", hari bertemunya dua pasukan di Badar, yang juga 17 Ramadan. Ulama lain menyebut malam-malam ganjil sepuluh terakhir, karena Lailatul Qadar dicari di sana. Ada juga yang menyebut 21 atau 24 Ramadan.
> **Amalannya:** tidak ada ibadah khusus yang ditetapkan untuk tanggal ini. Cara terbaik memperingatinya adalah memperbanyak membaca dan memahami Al-Quran sepanjang Ramadan.
> → Buka Al-Quran

**en, short:** "Nuzulul Quran marks the first revelation of the Quran to Prophet Muhammad SAW. In Indonesia it is observed on 17 Ramadan."
**en, expanded:** the same three parts (what is certain, what is disputed, what to do).

The history-card entry uses the "Peringatan" label rather than a dated event, so it never reads as a confirmed historical date. Check the al-Anfal reasoning and the alternative dates against a tafsir source (for example Ibn Katsir on 2:185 and 97:1) before shipping.

## 4. Distinct markers

Every marker type needs its own **shape**, not only its own colour, so the grid reads in every theme and for colour-blind users (WCAG 1.4.1). Use existing theme tokens only.

| Type | Grid marker | Token | Legend label (id / en) |
| --- | --- | --- | --- |
| Obligatory fast (Ramadan) | Short bar along the bottom of the tile | `--color-primary-strong` | Puasa wajib / Obligatory fast |
| Weekly sunnah (Mon/Thu) | Small filled dot ● | `--color-accent` | Senin/Kamis / Mon/Thu |
| Monthly sunnah (Ayyamul Bidh) | Hollow ring ○ | `--color-accent` | Ayyamul Bidh / Ayyamul Bidh |
| Annual sunnah (Asyura, Tasu'a, Arafah, Syawal, Muharram) | Small star ★ (icon) | `--color-success` or `--color-accent-strong` (check contrast) | Puasa sunnah tahunan / Annual sunnah fast |
| Prohibited | Triangle ▲ (the same `AlertTriangle` the legend already uses) | `--color-danger` | Puasa dilarang / Fasting prohibited |
| Lailatul Qadar night | Tiny crescent `Moon` icon | `--color-accent-strong` | Malam ganjil / Odd night |

Rules:

- A day can hold up to three markers in a row below the Gregorian date (for example Thursday 14 Sya'ban gets ● and ○). Order: prohibited, obligatory, annual, monthly, weekly. Above three, show the first two and "+".
- Prohibited suppresses all other fasting markers, as it already does in data.
- On the selected (filled) tile, markers switch to `--color-primary-foreground`, as the dot does today.
- **Show the legend only for marker types present in the current month.** Ramadan shows "Puasa wajib" and "Malam ganjil"; Dzulhijjah shows "Arafah", "Dilarang", Mon/Thu, and so on.
- The tile's `aria-label` already lists the event names, so screen readers are covered. Keep it, and add the obligatory and Lailatul Qadar names.

## 5. Month card: "what month is this?"

### 5.1 Layout, built to stay light

Every month gets the card, placed directly under the grid (above history). It has three parts and nothing else:

1. **Identity line:** the month name in Arabic script and Latin, its order ("Bulan ke-9"), and at most one chip: "Bulan haram" (sacred month) or "Bulan puasa wajib".
2. **One insight sentence:** what makes this month what it is, including the meaning of its name where the classical explanation is well known.
3. **Practices (only if the month has specific ones):** at most three lines, then "Lihat semua". Each line is one sentence. The dalil opens on tap.

Rules that keep it from repeating other parts of the page:

- **Nothing that is already in the grid:** no Mon/Thu or Ayyamul Bidh lines. The legend covers them.
- **Nothing that is already in the history card:** no battles or events here.
- **Nothing from the home screen:** no Ramadan countdown, since the 100-days journey card already shows it.
- **No filler:** a month with no specific practices shows only parts 1 and 2.

Example, Ramadan (mobile):

```
رمضان · Ramadan · Bulan ke-9            [Bulan puasa wajib]
Bulan diturunkannya Al-Quran. Pintu surga dibuka dan setan dibelenggu.
• Puasa wajib sebulan penuh                         ›
• Tarawih dan qiyamul lail                           ›
• Carilah Lailatul Qadar di 10 malam terakhir        ›
                                          Lihat semua (10)
```

### 5.2 Identity and insight per month

Name meanings follow the common classical explanation (for example Lisan al-'Arab). Word them as "Dinamakan ... karena ..., menurut penjelasan yang masyhur", not as a certainty.

| # | Month | Chip | Insight (one sentence) | Source |
| --- | --- | --- | --- | --- |
| 1 | Muharram | Bulan haram | Name means "dimuliakan". The Hijri year begins; the Prophet Muhammad SAW called it "bulan Allah". | QS. At-Taubah 9:36; Muslim 1163 |
| 2 | Safar | — | There is no bad luck in Safar. The Prophet Muhammad SAW denied this belief. This corrects a common myth (Rebo Wekasan). | Bukhari 5757, Muslim 2220 |
| 3 | Rabiul Awal | — | "Musim semi pertama". The Prophet Muhammad SAW was born in this month (most scholars), arrived in Madinah on the Hijrah, and passed away in it. | Sirah data, if dated there |
| 4 | Rabiul Akhir | — | "Musim semi kedua". No specific practice; keep the regular sunnah. | — |
| 5 | Jumadil Awal | — | Name linked to the dry season when water froze or dried up. No specific practice. | — |
| 6 | Jumadil Akhir | — | Same as above. No specific practice. | — |
| 7 | Rajab | Bulan haram | One of the four sacred months: avoid wrongdoing more carefully. No authentic practice specific to Rajab. | QS. At-Taubah 9:36; Bukhari 3197 |
| 8 | Sya'ban | — | The Prophet Muhammad SAW fasted most of it, and deeds are raised to Allah in it. The month to settle qadha before Ramadan. | Bukhari 1969, Muslim 1156; Nasa'i 2357 |
| 9 | Ramadan | Bulan puasa wajib | §5.1 example. | QS. Al-Baqarah 2:185; Bukhari 1899 |
| 10 | Syawal | — | Begins with Idulfitri; six days of fasting follow. | Muslim 1164 |
| 11 | Dzulqa'dah | Bulan haram | Name means "duduk": Arabs refrained from war. The Hajj season begins. | QS. At-Taubah 9:36 |
| 12 | Dzulhijjah | Bulan haram | The month of Hajj. Its first ten days are the most beloved days for good deeds. | Bukhari 969 |

### 5.3 Practices per month (part 3, only where they exist)

| Month | Practices to list | Sources |
| --- | --- | --- |
| Muharram | Fasting in Muharram; Tasu'a and Asyura (Asyura expiates the previous year) | Muslim 1163, 1162, 1134 |
| Sya'ban | Sunnah fasting; settle qadha first (shows the count when `pendingQadha` > 0, as Aisyah RA did in Sya'ban); Ramadan preparation linking to the 100-days journey | Bukhari 1969, 1950 |
| Ramadan | §3.3 | §3.3 |
| Syawal | Eid sunnahs (eat before the Eid prayer, takbir); six days of Syawal, with a note that scholars differ on whether qadha comes first | Bukhari 953; Muslim 1164 |
| Dzulhijjah | Takbir and dzikir from 1 Dzulhijjah; Arafah fast (9); qurban on 10–13 | Bukhari 969; Muslim 1162; QS. Al-Hajj 22:28 |

Tasyrik and Eid prohibitions are not repeated here, because the grid's triangle and the day panel already show them.

Copy rules (from `AGENTS.md`): "Nabi Muhammad SAW" / "Prophet Muhammad SAW" in Nawaetu-written text, never ﷺ or "Nabi SAW" alone; hadith text quoted from HadeethEnc stays unchanged. Every line needs both `en` and `id`.

## 6. Interaction and motion

**Starting point:** no new dependency is needed. `@lottiefiles/dotlottie-react` and `framer-motion` are installed. `src/components/ui/LottieMoment.tsx` already lazy-loads the player, respects `prefers-reduced-motion`, falls back to a static icon on failure, and supports `quietLoad`. Eight credited files are in `public/lottie/` (see `CREDITS.md`). Follow the rules in `docs/ONBOARDING_AND_MOTION_REVAMP_PLAN.md`: **one animation per moment**, Lottie for illustrated moments, `framer-motion` for transitions and tap feedback, and recolour to theme tokens.

### 6.1 Interactions

| Interaction | Behaviour | Tool |
| --- | --- | --- |
| Swipe between months | Horizontal drag on the grid moves to the previous or next month (calls the existing `navigateMonth`). The grid slides out in the swipe direction. The arrow buttons stay for keyboard and mouse. | `framer-motion` `drag="x"` + `AnimatePresence` |
| Tap a day | The tile gives a light press (`scale 0.96`), with a light haptic on Android. On desktop the side panel content cross-fades. On mobile the panel scrolls into view (it sits below the grid). | `framer-motion`, `navigator.vibrate(10)` where supported |
| Interactive legend | Tapping a legend item (for example "Ayyamul Bidh") highlights those days and dims the rest. Tap again to clear. It teaches the markers by doing, with no extra text. The legend chips are real `<button>`s with `aria-pressed`. | State in the page, CSS opacity |
| "Hari ini" chip | Appears when the user has navigated away from the current month and jumps back. | Existing `fetchCalendar(mode, new Date())` |
| Ramadan progress | In Ramadan, the month header shows "Hari ke-N dari 30" with a thin progress bar that fills on first view. The last ten days are shaded on the bar. | `framer-motion` width animation |
| Next odd night countdown | In the last ten days, the day panel shows "Malam ganjil berikutnya: malam 23, mulai Maghrib 18.12 (dalam 3 jam 20 menit)". It uses the Maghrib time that `calendarData` already carries (`day.timings.Maghrib`). | Plain state with a one-minute interval |
| Expandable practices | Each line in the month card (§5.1) expands to its dalil (Arabic, translation, reference) in place, the same way the evidence data is shown elsewhere. "Buka" opens the linked tracker, guide or calculator. | Existing accordion primitive in `src/components/ui/` |
| Month card follows the swipe | When the month changes, the month card cross-fades to the new month's identity and insight together with the grid, so "what month is this" is always the first thing read below the grid. | `framer-motion` `AnimatePresence` |

**Postponed:** logging a fast from the calendar. It touches persistence and guest sync, so it gets its own plan later.

### 6.2 Lottie moments

At most one Lottie is visible at a time, and only at the moments below. Everything else uses static icons and `framer-motion`.

| Moment | Where | Animation | Source |
| --- | --- | --- | --- |
| Opening Ramadan | Month card header, the first time the user opens the Ramadan month (stored per Hijri year), then a static icon | Lanterns swinging in | **Reuse** `lights.lottie` |
| Odd night selected (21, 23, 25, 27, 29) | Day panel, next to "Carilah Lailatul Qadar", plays once | Stars twinkling | **Reuse** `stars.lottie` |
| Idulfitri (1 Syawal) and Iduladha (10 Dzulhijjah) selected | Day panel, plays once | Takbir moment: crescent and stars, or a mosque drawing in | **Reuse** `mosque.lottie` |
| New month / hilal | Month card identity line, when the user swipes to a new month, very small (24 px), once per session | Crescent drawing in | **New** (§6.3: LottieFiles first) |
| Empty day panel (no practices) | Day panel | None. A sentence is enough, and an animation here would be noise | — |

### 6.3 New animations: LottieFiles first, Creator only as a fallback

**Decision:** search LottieFiles first. Make an animation in Creator only when no free file passes every check below.

**Step 1: search lottiefiles.com** for `crescent moon`, `hilal`, `moon stars`, `ramadan`, `islamic night`. Shortlist up to three per moment, preview each on a dark and a light theme, and pick one. Accept a file only if:

- it uses the Lottie Simple License, and it is recorded in `public/lottie/CREDITS.md` with the date checked (as the existing files are);
- it is **≤ 15 KB** as `.lottie`, with no embedded raster images;
- it has flat fills that can be recoloured to theme tokens, and no white background layer (the existing `mosque.lottie` and `stars.lottie` needed that layer removed);
- it contains no faces or figures. Nawaetu's existing set avoids them, and some users object to them in worship content;
- it reads clearly at 24–96 px.

- it matches the existing set in style: flat shapes, rounded ends, at most two colours, no gradients or 3D.

**Step 2 (fallback): create it with the Lottie Creator MCP** (`creator-mcp`), following the Nawaetu design system:

- **Colours:** only theme tokens from `src/app/globals.css`, chosen from `--color-primary`, `--color-primary-strong` and `--color-accent`. Name each fill layer after its token (`primary`, `accent`), so dotLottie theming can recolour it for each theme. No white or black fills, and no background layer.
- **Shape language:** match the app's icon set (`src/components/ui/icons`): flat shapes, rounded caps and corners, a stroke weight that matches the icons at 24 px.
- **Motion:** short and calm, 0.8–1.5 s, ease-out, no bounce. Loop only while the moment is on screen.
- **Size:** a 96×96 composition, 5 KB or less as `.lottie`.
- **Check** on the dev-only `/design-system` page (`DesignSystemFixture`) in all five themes, light and dark, before committing.

Candidates if the search comes up empty:

1. **Hilal draw-in:** 1.2 s, no loop. A crescent (two ellipses, one cutting the other) grows from its outer edge, then one small star fades in.
2. **Lailatul Qadar night:** 2 s, a gentle loop. A crescent with three stars that twinkle one after another. Only needed if `stars.lottie` looks off-brand next to the hilal.

Either way, add a row to `public/lottie/CREDITS.md`: the LottieFiles title, creator, URL and date checked, or "Nawaetu (made with LottieFiles Creator)".

### 6.4 Guardrails

- **Reduced motion:** `LottieMoment` already shows the fallback icon; the `framer-motion` transitions must also check `useReducedMotion()` and swap to an instant change.
- **Performance:** the player WASM is about 480 KB compressed. The calendar must load it with `quietLoad` after first paint, never block the grid on it, and never mount more than one player. Confirm the new files are precached in the built `sw.js`, so they work offline.
- **Accessibility:** animations are decorative (`aria-hidden`). Every moment has real text next to it. Swiping is never the only way to change month.
- **Restraint:** the Ramadan opening animation plays once per year and the hilal once per session. Repeating them every visit turns a moment into clutter.

## 7. Implementation outline

Smallest change that covers the above, in order:

1. **Data, fixes the bug (§1 #1–3).** In `src/data/hijri-events.ts`, add `"obligatory"` to `HijriEventKind` and a `ramadan` id. Return `[{ id: "ramadan", kind: "obligatory" }]` for month 9, right after the prohibited checks. Add `lailatulQadr` (odd 21–29, kind `"worship"`) and `zakatFitr` (last two days, kind `"worship"`) to the Ramadan result. `src/lib/fasting-guide.ts` filters by id and already returns nothing in Ramadan, so it needs no change; a test should prove that.
2. **Markers (§4).** In `HijriCalendarPageContent.tsx`, replace the single dot with a small `EVENT_MARKER: Record<HijriEventId, Marker>` map next to `EVENT_LABELS`, render up to three markers, and build the legend from the markers present in `calendarData`. Add `ramadan`, `lailatulQadr`, `zakatFitr` labels to both locale files (`src/data/translations/{id,en}/hijri-calendar.ts`).
3. **Month card (§5).** New `src/data/hijri-months.ts` with, for each of the 12 months, `{ month, chip?, insightId, insightEn, practices?: { titleId, titleEn, bodyId, bodyEn, source, href? }[] }`. Reuse `EvidenceData` text from `src/data/ramadhan/practices.ts` where the same evidence exists, instead of copying it. Render it under the grid, above history. This is the main new feature.
4. **Day panel (§2.1 #4, §2.3, §3.2, §3.4).** Show "Hari ke-N dari 30" for Ramadan, the day notes, the odd-night evening, the Nuzulul Quran explainer, and the caution lines. Cautions are computed in the panel from the same rules as `fasting-guide.ts`; move those two rules into a shared helper there rather than copying them. Madhhab-specific copy reads the existing madhhab setting.
5. **Interactions (§6.1).** Add swipe, tap feedback, the interactive legend, the "Hari ini" chip, Ramadan progress, the odd-night countdown and the month-card cross-fade in `HijriCalendarPageContent.tsx`. If the file grows past about 400 lines, move the grid into `src/components/hijri-calendar/HijriMonthGrid.tsx`.
6. **Lottie (§6.2, §6.3).** Wire the reused files through `LottieMoment` first. For the hilal, search LottieFiles; create it in Creator only if nothing passes. Add the result to `public/lottie/` and `CREDITS.md`.

## 8. Tests and validation

- `src/data/hijri-events.test.ts`:
  - Every day 1–30 of month 9 returns `ramadan` / `obligatory`.
  - A Monday in Ramadan does not return `mondayThursday`; 13–15 Ramadan do not return `ayyamulBidh`.
  - 21, 23, 25, 27, 29 Ramadan include `lailatulQadr`; 22 does not.
  - Prohibited days are unchanged.
- `src/lib/fasting-guide` tests: still `"none"` during Ramadan; the pre-Ramadan count is unchanged after the caution rules move into a shared helper.
- `hijri-months` test: all 12 months have both locales and an insight; no practice line names Mon/Thu or Ayyamul Bidh (no repeating the grid).
- Madhhab: the after-15-Sya'ban caution shows for Syafi'i and unset, and is hidden for Hanafi, Maliki and Hanbali; the zakat fitrah line changes per §2.3; grid markers are identical for every madhhab.
- `src/data/honorific.test.ts` passes with the new month copy.
- Manual: Ramadan, Sya'ban and Dzulhijjah in light and dark themes at 375 px width; legend matches the grid; VoiceOver reads the new event names.
- Interaction: swipe changes the month and arrows still work by keyboard; legend chips toggle with `aria-pressed`; with reduced motion on, nothing animates and every fallback icon shows.
- Lottie: only one player is mounted at a time; new files are ≤ 15 KB and appear in the built `sw.js`; colours checked in all themes.
- `npm run lint`, `npm run typecheck`, `npm run test:run`.

## 9. Owner decisions (25 November 2026)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Caution days in the grid? | No. They appear in the day panel only; the grid shows wajib, sunnah, haram and odd nights only (§2.1 #4, §4). |
| 2 | Month card vs history card | The month card goes above the history card; both stay, with no shared content (§5.1). |
| 3 | Nuzulul Quran | Shown, with a clear certain / disputed / what-to-do explanation (§3.4). |
| 4 | Madhhab | Affects two lines of copy only (the after-15-Sya'ban caution and the earliest time for zakat fitrah); grid markers are the same for everyone (§2.3). |
| 5 | Log a fast from the calendar | Postponed. Focus first on the month card: what month this is (§5). |
| 6 | New animations | Search LottieFiles first; create in Creator with Nawaetu's design tokens only as a fallback (§6.3). |

Still to check before shipping: every hadith number and the name meanings, against `practices.ts`, HadeethEnc, or a tafsir or lexicon source.

## 10. Implementation notes (where the build differs)

- **Month-wide fasts have no grid marker.** "Fasting in Muharram" and "six days of Syawal" cover the whole month, so a star on every day would mean nothing. The month card explains them, and the day panel still lists them. Tasu'a, Asyura, the 11th of Muharram and Arafah keep the star.
- **Practice rows show the title only.** Tapping a row shows its sentence, the dalil (reusing `practices.ts` evidence where it exists) and the tool. This is lighter than showing a sentence per row.
- **The odd-night countdown is in the month card**, next to Ramadan progress. The day panel shows the Maghrib evening for the selected odd night.
- **Hilal animation:** no LottieFiles candidate passed §6.3 (checked 2026-11-25: "media luna" had clouds, a background layer and five colours; "Moon" by Shokh used white fills; "Moon rotation with the star" was 50 KB). It was designed in LottieFiles Creator. Creator could not export without a connected LottieFiles workspace, so the same geometry is written as plain Lottie by `scripts/lottie/hilal.mjs`. It was loaded back into Creator to confirm it renders the same.
- **Theme colours:** the hilal's fills are Lottie slots (`primary`, `accent`). `LottiePlayer` takes a new `colorSlots` prop and sets them from the theme's CSS variables when the file loads, so it matches every theme.
- **Settings link for madhhab:** not added. The madhhab is set in the fasting tracker, whose Ramadan page is behind `RAMADHAN_PAGE_ENABLED`. With no madhhab set, the copy uses the neutral wording.

- **Mobile check (375 px and 320 px, Indonesian, incognito):**
  - Markers sit on their own row under the Gregorian date, so they never overlap it.
  - The legend hint line was dropped; the chips are clearly tappable on their own.
  - A day's notes share one box, and "Buka panduan" sits on the odd-night line. 29 Ramadan went from 549 px to 459 px.
  - At 320 px the tiles needed `min-w-0` against the global 44 px button minimum. This overlap existed before this change.
  - The "Hari ini" chip moved under the month title so long month names never wrap.
- **Partial months (existing bug, fixed):** paging into a Hijri month that ran past the three loaded Gregorian months showed only part of it (Syawal 1448 showed 22 days). `navigateMonth` now loads around a month with fewer than 29 days; the hook test covers it.

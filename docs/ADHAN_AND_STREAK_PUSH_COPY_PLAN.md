# Adhan & Streak Push Notification Copy Plan

## Goal

Make prayer and streak push notifications feel warm, current, and easy to act on for Gen Z users—without turning worship into guilt, pressure, or a joke.

Scope: Indonesian and English notification copy, matching the app’s currently supported locales and existing push routes.

## Language behavior

The notification worker runs on the server, so it cannot read the user’s browser `localStorage` or locale cookie directly. For authenticated subscriptions, resolve the language from `users.settings.locale`, which is already saved by the settings flow. Use `id` when the value is missing or unsupported, matching the app’s current default.

Do not use the server’s global language, the device language, or the subscription owner’s location to choose copy. Each subscription must use its own account locale.

## Action plan

### 1. Lock the copy contract

- Approve the title/body pairs in this document with product/content owners.
- Keep prayer names, Imsak meaning, Islamic references, and Gen Z slang respectful.
- Treat each title/body pair as an atomic unit; do not randomize titles and bodies independently.

### 2. Implement shared copy and locale resolution

- Add one small server-side copy map for `id` and `en`, keyed by prayer and streak reminder.
- Reuse it from both notification routes so the FCM, APNs, and WebPush payloads receive the same selected pair.
- Read `users.settings.locale` per subscription. Fall back to `id` for missing or unsupported values.
- Preserve authorization, active-subscription filtering, prayer preferences, token invalidation, and existing deduplication.

### 3. Make streak timing explicit

- Keep the product behavior at one reminder maximum per user per local calendar day.
- Recommended schedule: send once daily at 19:45, while the user can still complete an activity.
- Configure cron-job.org to `POST https://nawaetu.com/api/notifications/streak-reminder` with `Authorization: Bearer $CRON_SECRET`.
- If using a cron expression, use `45 19 * * *` (every day at 19:45).
- Set the cron-job.org timezone to the intended audience’s timezone—for example, `Asia/Jakarta` for 19:45 WIB. The existing date deduplication remains the final safety net.
- Keep the adhan job separate: it continues calling `prayer-alert` every minute because prayer delivery depends on each prayer’s calculated time.

### 4. Verify and release safely

- Add route tests for Indonesian, English, missing/unsupported locale fallback, pair integrity, and payload parity.
- Test streak behavior at the local-time window boundary, after completion, on repeated cron calls, and across timezones.
- Send test pushes to one Indonesian and one English account before enabling the schedule for all users.
- Monitor sends, failures, invalid tokens, skips, and streak completion behavior for the first release window.

## Voice rules

- Conversational and short: one clear action per notification.
- Encouraging, not guilt-based: invite users back; never shame missed prayers.
- Light Gen Z wording is okay: “lock in”, “reset”, “main character energy”, and “gas”. Use sparingly.
- Keep Islamic language accurate and respectful. Do not use slang for Allah, the adhan, or the prayer itself.
- Use at most one emoji in a title and none is required in the body.
- Avoid repeated exclamation marks, fear, judgment, and claims that prayer is a productivity hack.
- Keep titles roughly under 45 characters and bodies under 110 characters where possible.

## Prayer schedule copy

Use one complete title/body pair per prayer so randomization never creates an awkward combination. Select one pair per send from the prayer’s list.

### Imsak

| Title | Body |
| --- | --- |
| `Imsak masuk 🌙` | `Wrap up sahur pelan-pelan, lalu siap menyambut Subuh.` |
| `Last call sahur` | `Selesaikan sahur dan niatkan hari ini dengan baik.` |
| `Waktunya siap-siap Subuh` | `Air wudhu dulu, yuk. Semoga harimu dimudahkan.` |

### Fajr / Subuh

| Title | Body |
| --- | --- |
| `Subuh time 🌅` | `Bangun pelan-pelan, ambil wudhu, dan mulai hari bersama Allah.` |
| `Panggilan Subuh sudah tiba` | `Dunia bisa menunggu sebentar. Yuk tunaikan Subuh.` |
| `Lock in bareng Subuh` | `Lima menit untuk menghadap Allah, lalu lanjutkan harimu.` |

### Dhuhr / Dzuhur

| Title | Body |
| --- | --- |
| `Dzuhur time ☀️` | `Pause sebentar dari ramainya hari. Yuk tunaikan Dzuhur.` |
| `Waktunya Dzuhur` | `Reset sejenak dengan wudhu dan sholat Dzuhur.` |
| `Midday check-in` | `Dzuhur sudah masuk. Tarik napas, lalu menghadap Allah.` |

### Asr / Ashar

| Title | Body |
| --- | --- |
| `Ashar time 🌤️` | `Sebelum lanjut aktivitas, yuk sisihkan waktu untuk Ashar.` |
| `Waktunya Ashar` | `Satu jeda kecil untuk menjaga hati tetap terarah.` |
| `Ashar check-in` | `Ashar sudah masuk. Gas wudhu dan tunaikan sholat.` |

### Maghrib

| Title | Body |
| --- | --- |
| `Maghrib time 🌇` | `Hari hampir selesai. Yuk tutup fase ini dengan Maghrib.` |
| `Waktunya Maghrib` | `Ambil jeda dari semuanya dan hadir untuk Maghrib.` |
| `Maghrib sudah masuk` | `Wudhu dulu, lalu tunaikan sholat sebelum lanjut malam.` |

### Isha / Isya

| Title | Body |
| --- | --- |
| `Isya time 🌙` | `Sebelum benar-benar offline, yuk tunaikan Isya.` |
| `Waktunya Isya` | `Tutup harimu dengan satu jeda tenang bersama Allah.` |
| `Night reset: Isya` | `Isya sudah masuk. Pelan-pelan, wudhu, lalu sholat.` |

## English prayer schedule copy

Use the same prayer-specific keys and pair-selection behavior for `en`.

| Prayer | Title/body pairs |
| --- | --- |
| Imsak | `Imsak is in 🌙` — `Wrap up suhoor gently, then get ready for Fajr.`<br>`Suhoor last call` — `Finish suhoor and set your intention for the day.`<br>`Get ready for Fajr` — `Wudu first, then welcome the day with prayer.` |
| Fajr | `Fajr time 🌅` — `Take it slow, make wudu, and start the day with Allah.`<br>`Fajr is calling` — `The world can wait a moment. Come for Fajr.`<br>`Lock in with Fajr` — `A few minutes to turn to Allah, then carry on with your day.` |
| Dhuhr | `Dhuhr time ☀️` — `Pause the busy day for a moment. Come pray Dhuhr.`<br>`Time for Dhuhr` — `Reset with wudu and Dhuhr prayer.`<br>`Midday check-in` — `Dhuhr is in. Breathe, then turn to Allah.` |
| Asr | `Asr time 🌤️` — `Before the next thing, make a little room for Asr.`<br>`Time for Asr` — `One small pause to keep your heart grounded.`<br>`Asr check-in` — `Asr is in. Make wudu and pray.` |
| Maghrib | `Maghrib time 🌇` — `The day is winding down. Close this chapter with Maghrib.`<br>`Time for Maghrib` — `Step away for a moment and be present for Maghrib.`<br>`Maghrib is in` — `Make wudu, then pray before the night moves on.` |
| Isha | `Isha time 🌙` — `Before you fully log off, come pray Isha.`<br>`Time for Isha` — `End your day with a quiet pause with Allah.`<br>`Night reset: Isha` — `Isha is in. Take it slow, make wudu, and pray.` |

## Streak reminder copy

The current route sends only when the preference is enabled, the streak is active, and today’s reminder has not been sent. Preserve those rules. Substitute the current fixed copy with one complete pair selected using the existing streak count.

| Title | Body template |
| --- | --- |
| `Streak kamu masih nyala 🔥` | `Tinggal satu aktivitas bermakna untuk lanjutkan streak ${currentDays} hari.` |
| `Jangan biarkan streak lewat` | `${currentDays} hari sudah kamu bangun. Yuk selesaikan satu hal baik hari ini.` |
| `Masih sempat lock in` | `Hari ini belum selesai. Satu langkah kecil bisa menjaga streak ${currentDays} hari.` |
| `Your streak called 📲` | `Cek progresmu dan selesaikan satu aktivitas bermakna sebelum hari berganti.` |

English equivalents:

| Title | Body template |
| --- | --- |
| `Your streak is still glowing 🔥` | `One meaningful activity keeps your ${currentDays}-day streak going.` |
| `Don’t let the streak slip` | `You’ve built ${currentDays} days. Finish one good thing today.` |
| `Still time to lock in` | `Today isn’t over. One small step can protect your ${currentDays}-day streak.` |
| `Your streak called 📲` | `Check your progress and finish one meaningful activity before the day ends.` |

Recommended default pair:

- Title: `Streak kamu masih nyala 🔥`
- Body: `Tinggal satu aktivitas bermakna untuk lanjutkan streak ${currentDays} hari.`

## Implementation ownership

- Copy map: shared notification layer used by `prayer-alert` and `streak-reminder`.
- Locale source: `users.settings.locale`, already persisted by the settings flow.
- Prayer delivery: `src/app/api/notifications/prayer-alert/route.ts`.
- Streak delivery: `src/app/api/notifications/streak-reminder/route.ts`.
- Scheduler: cron-job.org with `CRON_SECRET`; no new dependency or database migration.
- Proof: focused route tests plus a manual push to one account per locale.

## Expected impact

### User impact

- Notifications read naturally in the user’s active language instead of defaulting to one language.
- Prayer reminders become clearer and more inviting at the exact prayer moment.
- Streak reminders give one low-pressure action while the day is still recoverable.
- Users receive no more than one streak reminder per day, reducing notification fatigue.

### Product impact

Measure the first release against the current baseline using existing delivery and streak data:

- Delivery quality: successful sends, failures, invalid tokens, and skips by route and locale.
- Relevance: percentage of streak reminders sent only to users with an incomplete active streak.
- Behavior: same-day completion after a reminder and next-day streak continuation.
- Trust: reminder disablement rate and support reports about wrong language, duplicates, or mistimed messages.

Success means language mismatches and duplicate streak reminders are eliminated, delivery remains reliable, and streak completion improves without a noticeable rise in opt-outs.

### Rollback

- Disable the cron-job.org streak schedule immediately if delivery or copy causes harm.
- Revert the copy map independently from scheduling and preserve the existing route safeguards.
- No data migration is required; existing `lastNotificationSent` state remains compatible.

## Acceptance criteria

- Every prayer notification uses only an approved prayer-specific pair.
- Every notification follows the owning user’s active supported locale (`id` or `en`).
- Missing or unsupported locale safely falls back to Indonesian (`id`).
- Imsak copy remains sahur/Subuh-specific; it never uses generic prayer copy.
- Every streak reminder includes the current streak count where the selected copy promises it.
- No copy change alters delivery timing, preferences, authorization, token invalidation, or deduplication.
- Titles and bodies are identical across FCM, APNs, and WebPush payloads for the same send.
- The tone is encouraging and respectful in a quick read on a lock screen.

## Explicit non-goals

- No new notification types, custom per-user cadence, analytics platform, or dependency.
- No guilt-based “you missed prayer” reminders or punitive streak language.
- No copy variants for every future locale in this change; add them when that locale’s notification delivery is supported.

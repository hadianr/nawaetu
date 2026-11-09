# 100 Days to Ramadan: Lottie Shortlist

**Prepared:** 10 November 2026
**Source:** [LottieFiles](https://lottiefiles.com/) free animations, searched and checked page by page.
**Rule from the plan:** each file about 50 KB or less, self-hosted `.lottie`, lazy-loaded, static frame under reduced motion, credit creators in `public/lottie/CREDITS.md`.

Every animation below showed "Free to use under the Lottie Simple License" on its own page on 10 Nov 2026. Re-check the page when downloading, because the license is per animation.

## Recommended picks

| Moment | Pick | Creator | dotLottie size | Link | Seen? |
| --- | --- | --- | --- | --- | --- |
| Day 1, 75, 50, 30, 10 and eve-of-Ramadan dialogs (hero) | **Lights**: gold hanging lanterns, stars and a crescent | Nazrin | 11.1 KB | [page](https://lottiefiles.com/free-animation/lights-raaw1YOy8N) | Yes |
| Streak kept / streak milestone | **Flame - Streak**: simple yellow flame | Noah | 12.1 KB | [page](https://lottiefiles.com/free-animation/flame-streak-Y3x3T9TqFh) | Yes |
| Milestone burst behind the hero | **success confetti** | Deepesh Reddy | 3.5 KB | [page](https://lottiefiles.com/free-animation/success-confetti-f5PdexvrBK) | No |
| Journey completed badge | **Badge \| Achievement Unlocked!** | Parimal Chahande | 3.0 KB | [page](https://lottiefiles.com/free-animation/badge-achievement-unlocked-mm5FJ6l23Z) | No |
| Sleep-prep habit and Sharpen phase | **It's Sleeptime** (alternatives: **Clear Night Moon** 2.1 KB, Akhil Atluri; **moon** 1.1 KB, Leonardo) | Prasil Lakshmanan | 3.3 KB | [page](https://lottiefiles.com/free-animation/its-sleeptime-DlGpjEPhS4) | No |
| Quran habit empty/prompt state (optional) | **Quran** | Asish | 3.3 KB | [page](https://lottiefiles.com/free-animation/quran-eceoBbwQtP) | No |

**Total if all are used:** about 35 KB, loaded only when a moment shows.

"Seen" means I looked at the preview frame. The others I judged from their page listing only, so **preview each one moving before choosing**.

## Why these

- **Lights** is the best fit by far: it says Ramadan without people or text, it is 11 KB, and the gold works on dark themes. Check it on the light themes before shipping.
- **Flame** matches the flame icon already in the streak chip, so it feels native instead of pasted on.
- All picks are non-figurative (lanterns, flame, confetti, moon, book). I skipped animations of people praying or reading to stay safe on tone. If you want people, say so and I'll shortlist some.

## Not needed

- **Habit tap check:** the card already draws a check with `framer-motion` (0 KB extra). A Lottie check is only worth it if you want a bigger burst. Smallest options if so: **successful check circle** (0.89 KB, 0035_Phan Thị Thu Hằng) or **checkmark** (1.4 KB, Jenny Seong).

## Rejected

| Animation | Why |
| --- | --- |
| Cultural islamic ramadan kareem crescent moon (Abdul Latif) | "Eid Mubarak" text is baked in (wrong season), 56 KB |
| congratulation badge animation (Gautam Gohel) | 37.8 KB optimised but 151 KB as dotLottie |
| success circle check (Вячеслав Частыло) | 95 KB |
| Islamic Shape (Hasan Almasi) | Only 2.9 KB, but fixed blue, green and yellow clash with most themes. Could be recoloured later |
| Ramadan greeting cards and "Eid Mubarak" animations | Greeting-card text, wrong moment |

## Before adding any file

1. Download as **dotLottie**, and recolour with dotLottie theming where it clashes with a theme.
2. Check it on all 8 themes and both light and dark.
3. Add a row to `public/lottie/CREDITS.md` (title, creator, URL, license, date checked).
4. Provide a static first-frame fallback for `prefers-reduced-motion`.
5. Keep any looping animation under about 3 seconds, or play once.

## Not checked

- I have not watched any animation play, only a still frame of four of them.
- The LottieFiles "Commercial Use Policies" page reads ambiguously. Confirm with LottieFiles support before launch (see section 4.6 of the plan).

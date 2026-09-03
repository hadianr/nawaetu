# Gen Z Hadith & Dua Relevance Plan

## Outcome

Help users recognize how existing hadiths and duas speak to present-day concerns by giving the surrounding copy a Gen Z-native voice—without changing the source text, translation, or religious meaning.

The first release should make a user answer “this is for what I’m dealing with today” quickly, then offer the Arabic, transliteration, translation, source, and a short practical reflection.

Discovery should be organized primarily by the user's situation and daily-life topic—not by who narrated or collected the hadith. Collection, narrator, and authenticity remain visible and available as secondary reference filters, but they should not determine the main browsing experience.

### `/hadith` grouping decision

The current narrator/collection chip row must be replaced in the primary `/hadith` browsing flow. Users should first see topic groups such as **Emotional Wellbeing**, **Digital Life**, **Relationships**, **Study & Work**, **Money & Consumption**, **Purpose**, **Worship**, **Gratitude**, and **Environment**. A hadith may appear in more than one topic when the source genuinely supports those applications.

Do not present “All Narrators” or individual narrator/collection chips as the main grouping. If collection filtering is retained, move it behind a secondary “Browse by source” control or an equivalent advanced filter. Narrator and collection metadata must still appear on each hadith card for transparency and verification.

## What already exists

The current architecture already supports the core experience:

- `HADITH_LIBRARY` stores Arabic, transliteration, Indonesian/English translations, authenticity, category, and optional bilingual explanation.
- `DUA_LIBRARY` stores prayers, occasions, sources, and bilingual virtue text.
- `/hadith` and `/dua` already present expandable cards with source, copy, share, and commentary.
- `DailySpiritWidget` already selects from the shared `SPIRITUAL_CONTENT` adapter.
- Mission references resolve to hadith or dua IDs through `reference-matcher.ts`.

Relevant records already include:

| Current concern | Existing content to surface |
| --- | --- |
| Anxiety, grief, emotional load | `hadith_anxiety_relief`, `dua_sedih_gelisah` |
| Burnout, overwork, perfectionism | `hadith_anxiety_relief`, `hadith_kemudahan_bukan_beban` |
| FOMO and comparison | `hadith_hasad_fomo`, `dua_bersyukur_nikmat_kecil` |
| Doomscrolling / brain rot | `hadith_meninggalkan_hal_unuse` |
| Social media ethics | `hadith_tabayyun_hoax`, `hadith_ghibah_cyberbullying`, `dua_jaga_lisan` |
| Purposeful work and study | `dua_amanah_kerja`, existing intention and knowledge content |

Do not add duplicate hadiths or duas before testing these records as topic recommendations.

## Copywriting layer and meaning guardrails

The canonical religious content and the user-facing entry copy are separate layers.

### May be rephrased

- `title` / `titleEn`, when they remain accurate and do not become clickbait;
- short topic hooks and previews;
- `explanation` / `explanationEn` and dua `virtue` / `virtueEn`, when clearly framed as application or reflection;
- practical action prompts and section labels;
- share-card captions, provided the source and attribution remain visible.

### Must remain authoritative

- Arabic text;
- transliteration, except for a separately reviewed readability correction;
- Indonesian and English translations of the source;
- collection, hadith number, narrator, authenticity, and dua references;
- the distinction between what the source says and what a modern reflection infers.

Use copywriting to lower the entry barrier, not to intensify the claim. A useful pattern is:

> modern hook → faithful plain-language meaning → source text and attribution → grounded action

Example:

- Avoid: “Stop scrolling or your iman is broken.”
- Prefer: “Brain full of noise? This hadith points us back to what actually benefits us.”
- Then show the existing source for leaving what is unbeneficial, followed by: “Try one intentional scroll break today.”

Each rewritten item should pass a meaning review: a reader comparing the copy with the source should find the same subject, scope, obligation, and level of certainty. Avoid fear bait, shame, guaranteed outcomes, diagnosis, and claims that a dua replaces professional support.

## Content model

Keep the canonical Arabic, translation, reference, and authenticity fields authoritative. Add only presentation metadata needed for discovery:

```ts
type SpiritualTopic =
  | "anxiety"
  | "burnout"
  | "fomo"
  | "digital-wellbeing"
  | "purpose"
  | "frugal-living"
  | "gratitude"
  | "relationships"
  | "self-worth"
  | "study-work"
  | "mental-health";
```

Preferred implementation: add an optional `topics?: SpiritualTopic[]` field to the shared hadith/dua base types, then map topics to existing records. Keep topic definitions in one small data module so labels and ordering are not duplicated across pages.

Each topic should have:

- a plain-language Indonesian label and English label;
- one sentence explaining the modern situation;
- a curated list of hadith/dua IDs;
- an optional action prompt, such as “pause before sharing” or “choose one necessary expense.”

Do not store social-media slang inside Arabic, transliteration, or source translations. Slang may appear in titles, topic labels, previews, and reflections only when it clarifies the modern situation rather than replacing the source meaning.

## Topic framing

Use current terms as entry points, not as claims that the Prophet ﷺ used those terms.

| Topic | Responsible framing |
| --- | --- |
| Frugal living | Connect moderation, gratitude, generosity, and avoiding waste to spending choices; do not imply poverty is automatically virtuous. |
| Ikigai | Present it as a modern purpose vocabulary, then distinguish personal purpose from worship, responsibility, and service. |
| Anxiety | Offer spiritual comfort and a next step; explicitly avoid promising that a dua replaces professional care. |
| Burnout | Emphasize sustainable obligations, rest, ease, and asking for help; avoid glorifying exhaustion. |
| FOMO | Connect comparison and envy to gratitude, contentment, and intentional attention. |
| Brain rot | Use “doomscrolling,” distraction, and leaving what is unbeneficial; avoid shaming users for mental fatigue. |
| NPD / narcissistic behavior | Do not diagnose users or label people from a card. Focus on pride, manipulation, boundaries, accountability, and seeking qualified help where needed. |
| Other relevant topics | Consider loneliness, parasocial attachment, financial pressure, climate anxiety, loneliness, exam stress, creator pressure, and online conflict only when a sound source and useful action both exist. |

## Presentation flow

1. Add a compact “What are you carrying today?” topic entry point above the existing library filters.
2. Show a topic card with a short modern framing sentence and 3–5 curated source items.
3. Reuse the existing hadith/dua cards for the full source experience.
4. Show the rewritten hook before the source and “Try this today” below it; never place either inside the quotation.
5. Preserve Arabic, transliteration, translation, authenticity, narrator, and source prominence.
6. Keep the daily widget deterministic and use the topic metadata only to improve context and navigation.
7. Make all topic labels, framing, action prompts, and source explanations available in Indonesian and English.

The primary category order should reflect daily relevance, for example: emotional wellbeing, digital life, relationships, study/work, money and consumption, purpose, worship, gratitude, and environmental responsibility. “All narrators” and collection chips can remain as an advanced or secondary way to browse the library.

## Content workflow

For every new or revised item:

1. Select a primary source from the Qur’an or an accepted hadith collection.
2. Record exact reference and authenticity; do not rely on a viral quote or unattributed graphic.
3. Keep the source fields intact and have Arabic, transliteration, and translation reviewed by a qualified reviewer.
4. Rewrite the title, hook, and reflection with a clear modern use case, while explicitly separating source meaning from application.
5. Compare old and new copy for changed subject, scope, obligation, certainty, or emotional pressure.
6. Check that the application does not make medical, psychological, legal, or financial promises.
7. Add the rewritten copy to the appropriate existing dua/hadith module only after review.
8. Link missions by stable ID, never by matching slang or title text.

## Delivery phases

### Phase 1 — Curate and expose existing content

- Add topic metadata and topic definitions.
- Map the existing relevant IDs above.
- Make topic grouping the primary presentation layer; demote narrator/collection browsing to secondary filters.
- Add topic filtering/entry points to the current presentation layer.
- Add a small disclaimer for mental-health topics.

### Phase 2 — Fill verified gaps

Audit coverage for frugal living, purpose/ikigai, loneliness, financial pressure, and creator/online pressure. Add only source-backed items with bilingual review. Prefer one strong item over a large collection.

### Phase 3 — Learn from use

Measure topic opens, source opens, saves/shares, and completion of the suggested action. Do not rank sacred content solely by clicks; use editorial curation as the default and analytics as a review signal.

## Acceptance checks

- Every topic resolves to at least one valid hadith or dua ID.
- The default browsing path groups content by user-relevant topics, not narrator or author/collector identity.
- Existing `/hadith`, `/dua`, daily widget, mission references, copy, and share flows remain functional.
- Arabic/source/authenticity are unchanged by presentation metadata.
- Gen Z hooks, titles, and reflections are tested separately from canonical source fields.
- Rewritten copy passes a meaning-preservation review for subject, scope, obligation, and certainty.
- Indonesian and English have no missing topic label, reflection, or action copy.
- Mental-health wording contains no diagnosis or treatment promise.
- Tests cover topic-to-content resolution and stable IDs, plus the existing library completeness and reference-matcher tests.
- Run focused tests, typecheck, and `graphify update .` after implementation.

## Explicit non-goals

- No replacement of the current hadith/dua data libraries.
- No AI-generated religious citations or unsourced “inspirational hadith.”
- No personality-disorder diagnosis or therapy feature.
- No social feed, comments, streak mechanics, or recommendation service.
- No new dependency unless the existing UI cannot support the topic entry point.

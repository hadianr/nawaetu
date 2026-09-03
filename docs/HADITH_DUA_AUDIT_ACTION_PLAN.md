# Hadith & Dua Audit — Recommended Actions

## Current baseline

- 100 hadiths and 50 duas, 150 items total.
- No duplicate IDs detected within either library.
- `/hadith` and `/dua` reuse `useIslamicContentFilter` for search, filtering, debounce, batching, and target highlighting.
- Canonical source fields are separate from Gen Z-oriented titles, tadabbur, virtue copy, search aliases, and topic metadata.
- Current client-side search and first-batch rendering are fast enough for 100 hadiths and 50 duas.

## Priority 0 — restore a trustworthy proof loop

### 1. Clear disk space and run the pending tests

The test runner previously failed with `ENOSPC`. After space is available, run:

```bash
npm run test:run -- src/data/hadiths/__tests__/hadith-dua-matcher.test.ts src/data/spiritual-content.test.ts
npm run typecheck
npm run build
```

Acceptance:

- Existing hadith/dua tests pass.
- Build completes without TypeScript or bundling errors.
- Record the result before adding more content.

### 2. Add one library integrity test

Extend `src/data/hadiths/__tests__/hadith-dua-matcher.test.ts` with validation for:

- unique IDs across both libraries;
- required Arabic, transliteration, translation, and source/reference fields;
- valid hadith collection and authenticity values;
- valid `additionalOccasions` values;
- no item listing its primary occasion as an additional occasion;
- every non-`all` dua tab returning at least one item through `getDuasByOccasion`;
- every hadith topic returning at least one item.

This catches empty tabs, accidental metadata drift, and broken content before release.

## Priority 1 — complete discovery coverage

### 3. Give every hadith a discovery topic

Only 37 of 100 hadiths currently have explicit topic mappings. Map the remaining items to one or more honest daily-life topics. Add a `general`/`other` fallback only for items that genuinely do not fit the main topic set.

Required topic coverage:

- Emotional Wellbeing
- Digital Life
- Relationships
- Study & Work
- Money & Consumption
- Purpose & Meaning
- Worship
- Gratitude
- Environment

Acceptance: selecting any topic on `/hadith` returns useful results, and no hadith becomes undiscoverable except through “All Topics” or search.

### 4. Make dua occasion semantics explicit

Keep `occasion` as the primary context and use `additionalOccasions` only for legitimate secondary discovery. Review the current protection and gratitude mappings for duplication and wording. Add missing secondary occasions only when the prayer naturally belongs there.

Acceptance:

- Protection and Gratitude tabs remain populated.
- Morning, evening, sleeping, social, and general contexts remain intact.
- A prayer is not duplicated in the same effective tab.

### 5. Finish search vocabulary by user need

For the most common needs, provide Indonesian and English aliases in `searchTerms`:

- anxiety, burnout, grief, overthinking;
- family, parents, generation gap;
- friends, bestie, circle, loneliness, support system;
- work, career, college, interview, freelance, personal brand;
- money, debt, BNPL, frugal living, financial anxiety;
- FOMO, comparison, likes, validation, body image;
- doomscrolling, brain rot, deepfake, misinformation, toxic comments.

Aliases must improve discovery only; they must never be presented as part of the religious source.

## Priority 1 — standardize content quality

### 6. Add a lightweight content review checklist

Every new or rephrased item must pass:

- source and authenticity verification;
- Arabic/transliteration/translation review;
- meaning comparison between source and modern copy;
- Indonesian/English parity check;
- no diagnosis, fear bait, shame, guaranteed outcome, or claim that a dua replaces professional care;
- narrator, collection, hadith number, and reference remain visible.

Titles, tadabbur, virtue copy, search aliases, and action prompts are editorial layers. Arabic, translations, references, and authenticity are canonical layers.

### 7. Tighten type safety at the data boundary

Replace free-form category strings with shared constants or unions incrementally. Validate topic keys and dua occasions at import/test time. Do not add a service or schema migration for this static library.

## Priority 2 — maintainability improvements

### 8. Split the hadith library when content growth justifies it

`src/data/hadiths/index.ts` currently owns all 100 records and query helpers. Keep it for exports, but move records into small topical modules once the file becomes difficult to review. Follow the existing modular pattern used by `src/data/duas/`.

Trigger: the hadith file exceeds practical review size or content contributors routinely edit unrelated sections. Do not split it solely for aesthetics.

### 9. Keep one shared presentation contract

Continue using `useIslamicContentFilter` and the existing card/share components. If `/hadith` and `/dua` gain more topic UI, extract only the repeated topic/filter presentation after a second real consumer exists.

## Performance decision

Do nothing further for speed at the current scale. Search is an in-memory scan over 150 items, debounced by 150 ms; only the first 25 results render initially; cards use memoization and `content-visibility`; share modals are lazy-loaded.

Revisit indexing, server-side search, or pagination only if the library grows into hundreds/thousands of records or profiling shows a real interaction problem.

## Recommended execution order

1. Clear disk space and run the proof commands.
2. Add the integrity tests.
3. Complete hadith topic coverage.
4. Review dua secondary occasions and search aliases.
5. Run bilingual/source content review.
6. Re-run tests, typecheck, build, and `graphify update .`.

## Definition of done

- 100 hadiths and 50 duas pass integrity validation.
- Every primary topic and dua tab has meaningful results.
- Users can find common current-life concerns in Indonesian or English.
- Canonical religious fields remain unchanged by editorial copy updates.
- `/hadith` and `/dua` retain current responsive performance.
- Tests, typecheck, build, and graph update complete successfully.


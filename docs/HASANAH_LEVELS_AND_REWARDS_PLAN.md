# Nawaetu Hasanah, Levels, and Partner Rewards Plan

**Status:** Product and technical planning  
**Prepared:** 1 September 2026  
**Scope:** Document the current progression system and define a safe path toward sponsor-funded physical, digital, and charitable rewards. No rewards or redemption functionality exists yet.

## 1. Executive summary

Nawaetu already has a useful engagement loop: users complete worship-related activities, receive **Hasanah**, progress through levels and ranks, maintain streaks, and see their progress in the profile and statistics screens.

The current system is suitable for motivation, but it is **not ready to represent redeemable value**. Guest totals are stored and modified in the browser, authenticated totals are not yet canonical for every earning source, and there is no reward inventory, reservation, fulfillment, refund, expiry, sponsor budget, or fraud-review system.

The recommended model is:

- **Hasanah:** permanent, non-transferable engagement score; never spent and never represented as actual reward from Allah.
- **Level and rank:** permanent recognition derived from lifetime Hasanah; redemption never lowers either.
- **Reward Credits:** a future, separate, sponsor-funded balance issued only for server-verified, campaign-eligible activity; credits can be reserved, spent, reversed, capped, or expired according to clearly disclosed rules.
- **Rewards:** benefits supplied by partners or donors. They may be physical goods, digital products, vouchers, access, experiences, discounts, services, or a sponsor-funded donation made on the user's behalf.

This separation is the central invariant. It protects user trust, preserves the meaning of existing progress, and gives Nawaetu a financially controllable reward economy.

## 2. Goals and non-goals

### Goals

1. Make the current Hasanah and level behavior explicit and understandable.
2. Preserve all legitimately earned progress as rules evolve.
3. Create a credible proposal for brands, merchants, donors, Islamic institutions, and CSR programs.
4. Support any reward form without prematurely integrating a marketplace provider.
5. Launch a small, manually operated pilot before building automated fulfillment.
6. Prevent double redemption, overspending a sponsor budget, and obvious manipulation.
7. Frame partner support as an opportunity for ongoing benefit (*amal jariyah*) without promising a particular spiritual outcome.

### Non-goals for the first pilot

- Converting existing Hasanah directly into money, crypto, or a transferable asset.
- Cash withdrawal, user-to-user transfers, auctions, loot boxes, paid entries, or chance-based prizes.
- An open marketplace where anyone can list rewards.
- Automated shipping, returns, tax handling, or multi-provider voucher integrations.
- Public leaderboards based on worship activity.
- Selling users' worship history or exposing individual worship activity to sponsors.

## 3. Current system audit

### 3.1 Level calculation

The shared progression rules live in `src/lib/habits/progression.ts` and are versioned as `LEVEL_RULES_VERSION = 1`.

| Level | Lifetime Hasanah required | Hasanah to next level |
|---:|---:|---:|
| 1 | 0 | 100 |
| 2 | 100 | 300 |
| 3 | 300 | 600 |
| 4 | 600 | 1,000 |
| 5 | 1,000 | 1,500 |
| 6 | 1,500 | 2,100 |
| 7 | 2,100 | 2,800 |
| 8 | 2,800 | 3,600 |
| 9 | 3,600 | 4,500 |
| 10 | 4,500 | 5,500 (fallback rule) |

After the last explicit threshold, each next level requires another 1,000 Hasanah. The implementation also accepts an earned-level floor, so a rules change cannot reduce a level already stored on the server.

Ranks are derived from level:

| Levels | Rank key |
|---:|---|
| 1–4 | `mubtadi` |
| 5–9 | `seeker` |
| 10–14 | `warrior` |
| 15–24 | `abid` |
| 25–39 | `salik` |
| 40–59 | `mukhlis` |
| 60+ | `muhsin` |

Current UI copy also groups levels into broader title bands in the profile. Before exposing rank-based rewards, the product should choose one public rank taxonomy and use it consistently.

### 3.2 Current earning sources

Hasanah is currently awarded from several client experiences, including:

- daily and seasonal missions;
- obligatory and sunnah prayer check-ins;
- dhikr milestones;
- Sirah quizzes;
- intentions and reflection;
- Qur'an/khataman activity;
- fasting, Taraweh, and other Ramadan activities.

Configured mission rewards currently range from 5 to 200 Hasanah. Some backdated activities receive 50% of the normal amount, and some missions allow an explicit completion option with a different reward.

### 3.3 Guest/local progression

For a guest, `addHasanah()` in `src/lib/habits/leveling.ts`:

1. reads the total from browser storage;
2. adds or subtracts the requested amount;
3. writes the new total;
4. increments local daily analytics;
5. emits browser events so the UI refreshes.

This provides a fast offline-friendly experience, but browser storage and client calls are user-controlled. A local Hasanah total is therefore suitable for personal motivation, **not proof of entitlement to a reward**.

### 3.4 Authenticated/server progression

The server has a stronger foundation:

- `hasanah_ledger` stores immutable award evidence by user, source, source ID, amount, timestamp, and origin.
- A unique `(user, source, source ID)` index makes repeat submissions idempotent.
- `user_progress_state` stores lifetime Hasanah, earned level, and rule version.
- A per-user database advisory lock prevents concurrent updates from losing awards.
- mission rewards are checked against the canonical mission catalog rather than trusting an arbitrary client amount;
- progression and streak updates occur in one transaction.

The authenticated application then hydrates the canonical server progression back into local storage for existing UI components.

### 3.5 Gaps that block redemption

| Gap | Why it matters once rewards have value | Required response |
|---|---|---|
| Local totals are editable | A user can fabricate eligibility | Never redeem against local-only totals |
| Not every feature posts a positive canonical award | Displayed Hasanah and server ledger can diverge | Map and test every eligible earning event |
| Existing guest imports may contain unverified history | Retroactive conversion creates a fraud and budget risk | Grandfather levels, but do not automatically mint spendable credits |
| Hasanah is sometimes subtractable on undo | A spendable balance needs explicit reversal records | Use append-only credit/debit entries and reference the original event |
| No campaign or sponsor attribution | Nawaetu cannot cap or report partner liability | Every Reward Credit issuance belongs to a funded campaign |
| No inventory or fulfillment state | Concurrent redemptions can oversell | Reserve stock and credits atomically |
| No terms, privacy explanation, or support flow | Physical/digital delivery creates user obligations | Publish reward-specific terms before pilot launch |
| Two public concepts, “Hasanah” and “XP,” are used interchangeably | Users and partners may misunderstand value | Standardize product language before launch |

### 3.6 Why the current economy must be rebalanced

The current thresholds were designed for motivation, not economic value. Level 10 begins at only 4,500 Hasanah, while the ordinary mission catalog can expose more than 800 Hasanah in one day before counting additional sunnah-prayer, quiz, dhikr-milestone, and seasonal awards. Several high-value activities are also manually confirmed by the user. A determined user could therefore reach a nominally high level in days, and an attacker could edit local storage or automate client actions.

No reward with material value should use the current level or browser total as sufficient proof. Before rewards launch, Nawaetu must rebalance both sides of the economy:

1. normalize awards around expected effort and verification strength;
2. cap how much reward-eligible progress can be earned per day;
3. replace the short level curve with a multi-month curve;
4. require a minimum number of distinct verified active days in addition to a Hasanah threshold;
5. grandfather existing recognition without converting old or local totals into spendable value.

### 3.7 Proposed Hasanah earning scale (v2 planning baseline)

Hasanah values must represent **Nawaetu engagement effort and evidence quality**, not the religious superiority or divine value of one act over another. Final numbers should be simulated against real activity distributions before release.

| Activity class | Proposed lifetime Hasanah | Reward-eligible treatment | Limit |
|---|---:|---|---|
| Daily intention | 5 | No Reward Credits; private/manual | Once per local day |
| Daily reflection | 5 | No Reward Credits; private/manual | Once per local day |
| Obligatory prayer check-in | 10 each | Eligible only with canonical time window and unique prayer/date evidence | Five per local day |
| Congregational selection | +5 each | Treat as self-reported; do not make the bonus redeemable initially | Five per local day |
| Qur'an reading goal | 15 per completed goal | Eligible when derived from canonical reading progress/time, not a free-form button | One standard goal per day |
| Dhikr goal | 10 per completed goal | Eligible when derived from counter progress; cap repeated counter milestones | Two goals per day |
| Other manual daily mission | 5–15 | Lifetime Hasanah only during the pilot | Maximum 20 per day combined |
| Time/quantity-verified daily mission | 10–25 | Eligible when the server validates the rule | Maximum 40 per day combined |
| Weekly mission | 30–50 | Eligible once per mission/week | Canonical week key |
| Seasonal major goal | 50–150 | Campaign-specific review; never repeatable through reset | Explicit event limit |
| Quiz or learning assessment | 1 per correct item, max 20 | Eligible only once per question/content version | 20 per day |

Initial global controls:

- **Lifetime Hasanah cap:** 150 per local day from repeatable activity; explicitly approved non-repeatable milestones may sit outside it.
- **Reward-eligible Hasanah/credit cap:** equivalent of 100 per local day.
- **Backdating:** lifetime Hasanah may receive 50% within a short permitted window; backdated events issue no Reward Credits during the pilot.
- **Undo:** append a reversal tied to the original evidence; never overwrite or silently subtract a balance.
- **Manual claims:** may help lifetime progress but should not fund valuable rewards until there is stronger evidence or a conservative campaign rule.

The caps prevent a dense catalog from making progression depend on how many buttons a user can find. They also make the level timeline predictable enough to price partner rewards.

### 3.8 Proposed level curve (v2)

The following curve assumes a consistent user averages **75–125 verified Hasanah per active day**. “Approximate effort” is a calibration target, not a promise: users choose different activities and should never be encouraged to rush worship for points.

| Level | Lifetime Hasanah threshold | Approximate consistent effort at 100/day | Product meaning | Reward access |
|---:|---:|---:|---|---|
| 1 | 0 | New | Beginning the journey | None; onboarding recognition |
| 2 | 250 | 3 active days | First steps | None |
| 3 | 600 | 6 active days | Establishing a routine | None |
| 4 | 1,100 | 11 active days | Returning consistently | None |
| 5 | 1,800 | 18 active days | Foundation milestone | Partner discounts or free community content only |
| 6 | 2,800 | 28 active days | Building discipline | Same as Level 5 |
| 7 | 4,200 | 42 active days | Sustained practice | Preview upcoming rewards |
| 8 | 6,000 | 60 active days | Two-month milestone | Entry-level digital reward eligibility |
| 9 | 8,500 | 85 active days | Strong routine | Small digital rewards |
| 10 | 12,000 | 120 active days | Established consistency | Standard reward eligibility |
| 11 | 16,000 | 160 active days | Long-term commitment | Standard rewards |
| 12 | 21,000 | 210 active days | Deepening consistency | Medium reward eligibility |
| 13 | 27,000 | 270 active days | Sustained growth | Medium rewards |
| 14 | 34,000 | 340 active days | Year-scale discipline | Medium rewards and impact campaigns |
| 15 | 42,000 | 420 active days | Long-standing consistency | Premium limited reward eligibility |
| 16 | 52,000 | 520 active days | Continued service | Premium rewards |
| 17 | 64,000 | 640 active days | Enduring practice | Recognition and premium rewards |
| 18 | 78,000 | 780 active days | Multi-year consistency | Recognition and premium rewards |
| 19 | 95,000 | 950 active days | Exceptional longevity | Recognition and premium rewards |
| 20 | 115,000 | 1,150 active days | Legacy milestone | Highest recognition; no unlimited entitlement |

After Level 20, use explicit additional thresholds rather than the current automatic `+1,000` fallback. A flat increment would make later levels progressively easier relative to accumulated history.

Reward eligibility begins no earlier than Level 8 and must also require verified tenure:

| Reward tier | Minimum lifetime Hasanah | Minimum verified active days | Illustrative reward |
|---|---:|---:|---|
| Community | 1,800 | 14 | discount, badge, free public content |
| Digital | 6,000 | 45 | e-book, course module, small voucher |
| Standard | 12,000 | 90 | partner voucher or service access |
| Medium | 21,000 | 150 | higher-value digital or limited physical item |
| Premium | 42,000 | 300 | scarce physical item, course seat, or sponsored experience |

These are eligibility floors, not guaranteed inventory. Each reward may require separate Reward Credits, geography, account standing, and campaign availability. Level and lifetime Hasanah never decrease after redemption.

### 3.9 Migration rule for existing users

- Preserve the user's highest earned legacy level as a visible “legacy level” or recognition floor.
- Recalculate the v2 level from canonical server-ledger Hasanah; never trust a browser-only total for reward eligibility.
- Do not issue Reward Credits for historical guest or unverified events.
- If historical server evidence is incomplete, let it preserve recognition but require new verified active days before redemption.
- Show the migration clearly; do not silently make users appear to lose progress.
- Version the v2 rules and store the applicable rule version with progression and every campaign.

## 4. Recommended product model

### 4.1 Three separate concepts

#### A. Lifetime Hasanah

- Earned through Nawaetu activity under the existing progression rules.
- Never spent, transferred, purchased, or exchanged for cash.
- May be corrected only through an auditable reversal.
- Drives level, rank, progress displays, milestones, and eligibility.
- UI disclaimer: “Hasanah is Nawaetu's motivational progress score, not a measure or guarantee of spiritual reward.”

#### B. Level and rank

- Derived from lifetime Hasanah using a versioned rule.
- Never decreases because a user redeems a reward.
- Can unlock access to a reward category, early access window, or per-user redemption limit.
- Should not be the only eligibility rule; campaign geography, inventory, account standing, and sponsor terms may also apply.

#### C. Reward Credits

- Issued only by the server for an eligible event after the reward program begins.
- Attached to a funded partner campaign with a hard issuance/redemption budget.
- Non-transferable, not purchasable, and not redeemable for cash.
- May expire only when the date is disclosed before earning; avoid expiry in the first pilot if sponsor terms permit.
- Has separate `available`, `reserved`, `spent`, and `reversed` accounting.

This model allows offers such as “Level 5 members may redeem 500 Reward Credits for a partner e-book” without deducting lifetime Hasanah.

### 4.2 Reward forms

The catalog can support the following without changing the core progression model:

| Form | Examples | Best early use | Main operational issue |
|---|---|---|---|
| Digital content | e-books, courses, templates, premium app access | First pilot | unique code/link access control |
| Voucher | food, books, transport, data packages, merchant credit | Scalable pilot | code inventory, territory, expiry |
| Discount/perk | percentage discount, free shipping, bonus item | Lowest sponsor cost | disclose required purchase clearly |
| Physical item | prayer equipment, books, modest wear, food packs | Limited campaign | address privacy, shipping, returns |
| Experience/service | class, mentoring, event pass, consultation | Community partner | scheduling and attendance limits |
| Charitable redemption | sponsor donates a fixed amount to a verified program | Strong mission fit | proof of transfer and recipient governance |
| Community unlock | sponsor funds a shared target after collective activity | Avoids individual commodification | transparent aggregate measurement |
| Recognition | badge, certificate, partner thank-you | Always available fallback | must not imply religious superiority |

Discounts that require payment must never be labeled “free,” and charitable redemptions must show the sponsor, beneficiary, amount or formula, campaign cap, and proof/reporting schedule.

### 4.3 Support and reward contribution entry point

The future Rewards section should also invite individuals, brands, institutions, and community partners to help supply rewards or other support. This invitation should remain visible even when the reward catalog is empty.

Use one **“Support Nawaetu / Dukung Nawaetu”** card with two paths:

1. **Offer Support / Tawarkan Dukungan** — opens a short contribution form and should be the primary action.
2. **Contact Us / Hubungi Kami** — opens the published email or contact channel for larger, sensitive, or unusual proposals.

The form should accept any useful contribution type:

- physical products;
- digital products, access, subscriptions, or voucher codes;
- discounts or partner benefits;
- classes, mentoring, venues, professional services, or volunteer time;
- logistics, printing, connectivity, or promotional support;
- a fixed reward-procurement or charitable-impact budget;
- another contribution proposed by the supporter.

Keep the first version manually reviewed. Required fields should be limited to:

- supporter or organization name;
- contact name and email or phone number;
- contribution type;
- short description, approximate quantity or value, and applicable location;
- whether the supporter can handle delivery or fulfillment;
- optional website or social profile;
- consent for Nawaetu to follow up and acknowledgement of the privacy notice.

The form must not request bank credentials, payment-card details, identity documents, or other sensitive financial information. Submission does not guarantee acceptance, publication, partnership, or promotion. Nawaetu should review every offer for usefulness, authenticity, operational feasibility, and alignment with Islamic values before contacting the supporter or listing a reward.

Suggested empty-state copy:

> **Help make meaningful rewards possible**  
> Individuals, brands, and organizations can contribute products, digital benefits, services, charitable funding, or other support. We hope every lasting benefit becomes a form of *amal jariyah*, while recognizing that spiritual reward belongs to Allah alone.

This intake flow should be added during the manual partner pilot in Phase 2. A partner portal, automatic approval, payment collection, and self-service reward publishing are intentionally deferred until submission volume proves they are needed.

## 5. Comparable products and lessons

Research checked on 1 September 2026. These products are references for mechanics, not endorsements or confirmed integration partners.

| Product | Relevant model | Lesson for Nawaetu |
|---|---|---|
| [Charity Miles](https://charitymiles.org/faq/) | Activity can activate charity- or employer-arranged sponsorship; sponsors choose rates and caps | Let each sponsor fund a bounded campaign and state its cap rather than promising an unlimited conversion rate |
| [Sweatcoin marketplace](https://help.sweatco.in/hc/en-us/articles/360012673612-How-do-I-spend-my-Sweatcoins) | Verified activity leads to changing partner offers; some are fully covered while others are discounts requiring payment | Clearly distinguish gifts, vouchers, and paid discounts; keep fulfillment instructions in the redemption receipt |
| [Sweatcoin for partners](https://lp.sweatco.in/partners) | Marketplace and challenge campaigns are presented as measurable brand engagement | Offer partners campaign formats and aggregated results, not access to personal worship histories |
| [Optimity Rewards](https://www.myoptimity.com/about-rewards) | Habit activity earns gems; rewards unlock at a threshold; monthly redemption limits control the economy | Add per-user and per-campaign caps before scaling |
| [THE DEEDS+](https://play.google.com/store/apps/details?id=com.inmcf.deeds_plus) | Indonesian Muslim app combines worship activity, points, prizes, a mall, and donations | A close category reference, but Nawaetu should validate trust, clarity, and retention before copying a broad mall model |
| [Wahi](https://www.wahiapp.com/) | Muslim learning goals, streaks, points, and leaderboard | Points and progression are familiar in Muslim products; Nawaetu should avoid public comparison of worship behavior by default |
| [MusHabit](https://play.google.com/store/apps/details?id=com.mushabit.mushabit) | Deliberately uses simple visual consistency as its only reward | Tangible prizes are optional; preserve meaningful intrinsic recognition even when no sponsor inventory exists |
| [Telkomsel Poin × BWI](https://www.bwi.go.id/wakaf-poin-telkomsel/) | Loyalty points can be exchanged into a fixed-value waqf contribution | A useful Indonesian precedent for an optional “turn activity into sponsor-funded impact” campaign |
| [OttoGifts](https://www.opoint.mzi.co.id/id/product/ottogifts) | Indonesian reward catalog and API with merchant vouchers and transaction monitoring | Evaluate an aggregator only after manual pilots prove volume; it can later reduce voucher sourcing and delivery work |
| [IhsanOne](https://www.ihsanone.org/) | Islamic giving and volunteering are combined with referral points and rewards | Potential product/partnership reference for verified giving and volunteering, while avoiding referral-driven abuse |

## 6. Partner proposition

### 6.1 Positioning

Proposed message:

> Help Nawaetu users sustain beneficial daily habits. Your contribution funds useful rewards or charitable impact for verified participation, while your brand receives respectful recognition and aggregate campaign reporting. We hope the benefit continues as *amal jariyah*; the spiritual reward remains Allah's determination.

Avoid claims such as “buy Hasanah,” “guaranteed amal jariyah,” or “every prayer earns Rp X.” Nawaetu measures product activity, not sincerity, validity of worship, or divine reward.

### 6.2 What a partner can contribute

- a fixed quantity of digital codes or subscriptions;
- physical products plus an agreed shipping arrangement;
- a public discount or a Nawaetu-exclusive offer;
- professional time, classes, mentoring, venue access, or event tickets;
- a cash budget used by Nawaetu to procure rewards;
- a capped donation to a verified social program triggered by aggregate participation;
- co-funded community challenges;
- operational support such as fulfillment, logistics, printing, or connectivity.

### 6.3 Suggested partner categories

- Qur'an, Islamic book, education, and course providers;
- halal food, beverage, wellness, and modest lifestyle brands;
- prayer equipment and Muslim-friendly travel providers;
- telecommunications and internet-data providers;
- Islamic financial institutions and their CSR or zakat/waqf arms;
- mosques, foundations, pesantren, and verified charitable organizations;
- productivity, learning, and creator software providers;
- logistics companies able to sponsor shipping;
- local MSMEs seeking a measurable community campaign.

Partnership screening should reject gambling, interest-based lending promotion, adult content, misleading health claims, exploitative data collection, undisclosed paid offers, or any campaign inconsistent with Nawaetu's values.

### 6.4 Simple campaign packages

Start with three understandable packages:

1. **Gift campaign:** partner supplies a fixed inventory; eligible users redeem while stock lasts.
2. **Benefit campaign:** partner provides a discount, access benefit, or service with a per-user limit.
3. **Impact campaign:** partner donates a fixed amount when the community reaches a disclosed aggregate goal, up to a hard cap.

Each one-page campaign agreement should define inventory/budget, eligibility, countries, dates, claim limit, fulfillment owner, delivery SLA, returns/cancellations, branding approval, reporting, data access, prohibited substitutions, and unused inventory treatment.

## 7. Delivery roadmap

### Phase 0 — terminology and measurement baseline

**Outcome:** Nawaetu can explain the current system and measure whether rewards improve consistency.

- Choose “Hasanah” as the user-facing progress term and remove interchangeable “XP” copy, or explicitly define XP as an alias.
- Add the motivational-score disclaimer wherever the total is explained.
- Publish the level threshold and rank explanation.
- Inventory every current `addHasanah` call and map it to a canonical source, event ID, amount, undo behavior, and backdating rule.
- Measure 4–8 weeks of baseline data: eligible active users, day-7/day-30 retention, weekly Hasanah distribution, level distribution, suspicious repetition, and feature contribution.
- Decide whether pre-launch Hasanah grants level eligibility only. Recommended: **yes**, but it grants no opening Reward Credit balance.

**Exit criteria:** one terminology set, complete earning-event map, baseline dashboard, and written grandfathering rule.

### Phase 1 — canonical progression

**Outcome:** authenticated level and Hasanah are trustworthy enough to gate access, though no spending exists.

- Route every eligible authenticated earning event through the server ledger.
- Give every event a deterministic source ID and an explicit reversal reference.
- Keep guest mode motivational; require sign-in for future rewards.
- On first account sync, label imported evidence separately and apply a documented eligibility policy.
- Reconcile `user_progress_state.hasanah_total` against ledger entries and alert on drift.
- Rate-limit abnormal event frequency and log rejected or duplicate evidence.
- Add one end-to-end test covering earn → duplicate retry → canonical total → level boundary → undo/reversal.

**Exit criteria:** no client-supplied arbitrary award can produce redeemable eligibility, retries do not duplicate awards, and the aggregate state can be rebuilt from evidence.

### Phase 2 — manual partner pilot

**Outcome:** prove demand and operations with one partner and one reward without building a marketplace.

- Secure one partner commitment with 50–200 units or one capped impact budget.
- Prefer a digital reward or charitable community unlock; it avoids address collection and shipping.
- Create a static reward detail page with terms, remaining availability, eligibility, and a claim form.
- Require authenticated email verification and one claim per account/person as appropriate.
- Review claims in an internal queue; issue codes or fulfillment instructions manually.
- Record claim state and an immutable operator note.
- Send a confirmation/receipt and provide one support channel.
- Report only aggregate reach, claims, completion, and retention to the partner.

**Exit criteria:** successful fulfillment rate ≥95%, no budget overrun, support volume is understood, and both users and partner want another campaign.

### Phase 3 — Reward Credit ledger and self-service redemption

**Outcome:** automate the proven workflow.

Add only the data required by successful pilots:

- `reward_campaign`: sponsor, budget/inventory, schedule, geography, eligibility, status;
- `reward_item`: reward type, description, terms, stock, fulfillment method;
- `reward_credit_ledger`: immutable issue, reserve, spend, release, expire, and correction entries tied to campaign and evidence;
- `redemption`: user, item, quantity, credit cost, state, idempotency key, timestamps;
- `fulfillment`: code reference or delivery state, kept separate from public reward content;
- `audit_event`: actor, action, target, reason, and timestamp.

Redemption must use one database transaction to verify eligibility, lock the relevant user and inventory, reserve credits, decrement stock, and create the redemption. Webhook retries and user retries must be idempotent.

Suggested state flow:

`available → reserved → fulfilled`  
`reserved → cancelled/expired → available`  
`fulfilled → refunded/replaced` only through an audited support action.

**Exit criteria:** concurrency tests cannot oversell stock or double-spend credits; reconciliation matches sponsor liability and inventory; support can cancel or replace safely.

### Phase 4 — catalog and provider integration

**Outcome:** scale only after repeat demand.

- Add partner portal capabilities only if manual partner operations become the bottleneck.
- Evaluate an Indonesian voucher aggregator for digital inventory and delivery.
- Add physical fulfillment only with a partner or logistics owner and a clear privacy/returns process.
- Personalize by country and eligibility, not inferred religiosity or sensitive behavior.
- Introduce multiple simultaneous campaigns only after financial reconciliation is routine.

## 8. Reward economy and budget controls

Do not promise a universal cash conversion rate for Hasanah or Reward Credits. Each campaign has a funded liability and can define its own issuance rule.

For each proposed campaign, calculate:

`maximum liability = reward unit cost × redeemable inventory + fulfillment subsidy + contingency`

and:

`expected liability = eligible users × expected claim rate × average unit cost`

Required controls:

- hard campaign budget or stock ceiling;
- start/end time and territory;
- per-user and, if necessary, per-household cap;
- monthly redemption cap similar to the control used by Optimity;
- no credit issuance after the campaign budget is exhausted;
- reservation timeout for abandoned redemptions;
- daily reconciliation of credits, inventory, redemptions, and fulfillment;
- explicit contingency for failed codes, replacement, shipping, and support;
- no sponsor promise based solely on unverified projected users.

The first pilots should use fixed inventory rather than a perpetual “X Hasanah = Rp Y” promise.

### 8.1 Redemption eligibility invariant

A large Hasanah number alone is not enough. The server should approve a redemption only when all of these are true:

`eligible = authenticated account + canonical lifetime threshold + verified active-day threshold + sufficient Reward Credits + campaign eligibility + available inventory + no unresolved risk hold`

For the first valuable reward, use the Digital tier as the minimum: **6,000 canonical lifetime Hasanah, at least 45 verified active days, and sufficient campaign-issued Reward Credits**. This makes a one-day scripted burst useless even if it reaches the numeric threshold.

Additional controls:

- verify email before any claim and require stronger verification only when reward value or abuse evidence justifies it;
- one redemption per reward/campaign unless the campaign explicitly allows more;
- 24-hour reservation and claim cooldown for scarce rewards;
- per-user monthly value cap and hard sponsor campaign cap;
- no redemption from a balance created entirely through guest import, backdating, manual edits, or zero-value evidence;
- hold suspicious claims for review instead of permanently confiscating progress automatically;
- prevent multiple accounts from repeatedly claiming to the same voucher recipient, address, or other fulfillment identity, while allowing legitimate households to appeal;
- issue and redeem inside auditable database transactions with idempotency keys;
- reconcile Reward Credit liability, redemptions, inventory, and fulfillment every day during a campaign.

Do not advertise “redeem 6,000 Hasanah for reward X” if Hasanah is not actually deducted. Use “unlock at 6,000 lifetime Hasanah” and display the separate Reward Credit cost. If Nawaetu later chooses to call the spendable balance “Redeemable Hasanah,” the UI and ledger must still separate it from **Lifetime Hasanah**; the separate name **Reward Credits** is safer and less likely to imply that spiritual merit is being bought or sold.

## 9. Trust, safety, privacy, and fairness

### 9.1 Abuse controls

- Server-calculated awards from canonical definitions.
- Unique evidence IDs and idempotency keys.
- Account age or verified-email requirement for high-value rewards.
- Velocity limits by source and campaign.
- Flag impossible repetition, many accounts on one fulfillment identity, and repeated cancellation/retry patterns.
- Manual review before denying or confiscating material value.
- A documented appeal path and auditable adjustment, never silent balance edits.
- Do not punish offline users merely because they sync later; use occurrence time, signed evidence where available, and bounded backdating rules.

### 9.2 Privacy

- Sponsors receive aggregate campaign reports by default, not names, emails, prayer logs, intentions, Qur'an history, or exact activity timelines.
- Collect delivery address only after a physical claim, disclose the fulfillment party, and delete it on a defined schedule.
- Keep private intentions and reflections completely outside reward eligibility and partner analytics.
- Avoid ad-tech tracking on worship screens and reward claims.
- Obtain specific consent before sending identity or contact details to a fulfillment partner.

### 9.3 Fairness

- Provide at least one path that does not require spending money.
- Label purchase-required discounts prominently.
- Avoid favoring only users who can perform high-volume activities; use caps and diverse campaign criteria.
- Provide accessible claim flows and a reasonable redemption window.
- Do not create shame, public worship rankings, or messaging that questions sincerity.
- Commission Indonesian legal, tax, privacy, consumer-protection, and Sharia review before anything with monetary value launches.

## 10. Metrics

### User outcomes

- day-7 and day-30 retained users versus baseline/control;
- percentage of users active on 3+ days per week;
- reward discovery → eligibility → claim → fulfillment conversion;
- median time to fulfillment;
- support contacts and complaints per 100 claims;
- perceived motivation and perceived religious appropriateness.

### Partner outcomes

- eligible reach and unique claimants;
- claim/activation rate;
- aggregate challenge completion;
- optional, consented referral conversions;
- cost per fulfilled reward or impact action;
- repeat-partner rate.

### Integrity and sustainability

- duplicate/rejected event rate;
- suspicious claim rate and appeal reversal rate;
- ledger reconciliation difference (target: zero);
- unfulfilled/failed reward rate;
- actual liability versus campaign cap;
- Reward Credits issued but never usable because inventory is absent.

Rewards should continue only if they improve consistent beneficial behavior without materially increasing unhealthy point chasing, complaints, manipulation, or discomfort about worship being commercialized.

## 11. First pilot recommendation

Run one **community impact campaign** and, if inventory permits, one **digital gift campaign**:

1. A partner commits a fixed donation, for example when the community collectively completes a disclosed number of eligible consistency days during a month.
2. The partner also supplies a small number of digital books, course seats, subscriptions, or vouchers available to signed-in users at a chosen level.
3. Existing Hasanah controls eligibility; it is not deducted.
4. Claims are reviewed and fulfilled manually.
5. Nawaetu publishes the campaign cap, aggregate progress, final result, and proof of impact.

This tests mission fit, user interest, partner reporting, support workload, and abuse patterns with almost no irreversible engineering.

## 12. Partner outreach checklist

Prepare a concise partner pack containing:

- Nawaetu's mission, audience, countries, and privacy principles;
- current active-user and retention figures, clearly dated and never inflated;
- screenshots of progression and the proposed campaign placement;
- the three campaign packages;
- requested contribution, exact cap, timing, and fulfillment owner;
- aggregate metrics the partner will receive;
- brand-safety and prohibited-category policy;
- statement that support is intended to encourage beneficial habits and may become *amal jariyah*, without guaranteeing spiritual outcomes;
- pilot agreement and primary operational contacts.

Suggested first outreach:

1. Existing community relationships and local Islamic education/book partners.
2. Digital-product providers with near-zero fulfillment cost.
3. Foundations, zakat/waqf organizations, and CSR programs for aggregate impact campaigns.
4. Halal consumer brands for fixed-inventory gifts.
5. Voucher aggregators only after repeat pilots justify integration and minimum spend.

## 13. Decisions required before implementation

| Decision | Recommended default |
|---|---|
| Public term | Use “Hasanah” consistently; define it as a motivational score |
| Redeemable unit | Separate Reward Credits, never lifetime Hasanah |
| Existing balances | Preserve levels; do not back-convert into credits |
| Guest eligibility | Sign-in required for redemption |
| First valuable-reward floor | Level 8, 6,000 canonical Hasanah, and 45 verified active days |
| Daily earning controls | 150 lifetime Hasanah and 100 reward-eligible equivalent |
| First reward | Digital benefit or aggregate charitable unlock |
| Fulfillment | Manual for first 1–3 campaigns |
| Sponsor data | Aggregate reporting only by default |
| Expiry | No expiry in pilot; disclose prospectively if later required |
| Transfer/cash-out | Not supported |
| Leaderboard | Not part of rewards |

## 14. Definition of readiness

Nawaetu is ready to launch its first reward pilot only when:

- the partner agreement, budget/inventory, terms, and fulfillment owner are signed off;
- public wording clearly separates Nawaetu Hasanah from spiritual merit and monetary value;
- all pilot-eligible activity is canonical and server-verified;
- guest/import policy is published;
- eligibility can be reproduced from server data;
- duplicate claims and budget overrun are technically prevented or manually controlled for the pilot size;
- privacy notice, consent, support, cancellation, and incident procedures exist;
- legal and Sharia reviewers have approved the specific pilot structure;
- Nawaetu can publish an honest aggregate outcome report after the campaign.

## 15. Action items: how to start

### Milestone 1 — agree on the rules (1–2 days)

**Outcome:** the team has one approved product policy before changing balances.

- [ ] Approve or amend the defaults in Section 13.
- [ ] Confirm that lifetime Hasanah is never spent and Reward Credits are separate.
- [ ] Confirm the first reward floor: Level 8, 6,000 canonical Hasanah, and 45 verified active days.
- [ ] Approve the legacy-user rule: preserve recognition, but do not convert old/local totals into Reward Credits.
- [ ] Choose one public term—recommended: “Hasanah,” with “XP” removed from user-facing copy.
- [ ] Assign one product owner for progression rules and one operational owner for partner/reward fulfillment; one person may hold both roles initially.

**Deliverable:** a dated decision record added to this document.  
**Stop condition:** no implementation begins while the four balance and migration decisions remain unresolved.

### Milestone 2 — map and secure current earning (3–5 days)

**Outcome:** every way to earn Hasanah is known and classified before values change.

- [ ] Create one earning-event matrix containing: feature, source ID, current amount, proposed amount, repeat limit, validation type, backdating rule, undo behavior, guest behavior, and server behavior.
- [ ] Inventory every `addHasanah()` caller and every direct progression/database write.
- [ ] Mark each event as `server verified`, `self-reported`, `local only`, or `not eligible for rewards`.
- [ ] Identify duplicate paths where one activity can award Hasanah more than once.
- [ ] Confirm deterministic evidence IDs for every reward-eligible event.
- [ ] Add a temporary rule that no current local or imported balance is redeemable.

**Deliverable:** completed earning-event matrix with no unknown award path.  
**Acceptance:** every positive award and reversal has one responsible source and a stated daily/repetition limit.

### Milestone 3 — measure the real economy (minimum 4 weeks)

**Outcome:** v2 values are based on user behavior rather than guesses.

- [ ] Record daily canonical Hasanah earned per user and by source without exposing private content.
- [ ] Measure median, 75th, 90th, 95th, and maximum daily earning.
- [ ] Measure active days needed to reach each current and proposed level.
- [ ] Count duplicate submissions, backdated activity, undo/re-award loops, and abnormal bursts.
- [ ] Segment guest/local totals from authenticated canonical totals.
- [ ] Simulate the proposed v2 scale and Level 1–20 curve against the collected distribution.

**Decision rule:** target Level 8 at roughly 45–80 genuine active days and Level 10 at roughly 90–160 active days for consistent users. Adjust the curve or earning values if the observed distribution misses this range materially.

**Deliverable:** a short calibration report with the recommended final thresholds and expected time-to-level percentiles.

### Milestone 4 — make authenticated progression canonical (1–2 sprints)

**Outcome:** reward eligibility can be reproduced entirely from trusted server data.

- [ ] Route each approved authenticated earning event through `processProgressionEvidence()`.
- [ ] Reject arbitrary client award amounts; calculate them from server-owned, versioned rules.
- [ ] Add append-only reversal evidence tied to the original award.
- [ ] Apply the lifetime and reward-eligible daily caps transactionally.
- [ ] Store and expose verified active-day count separately from streak length.
- [ ] Reconcile the aggregate progression state against the ledger and alert on drift.
- [ ] Keep guest earning functional for motivation but label it ineligible for redemption until canonical sync rules accept it.
- [ ] Implement and communicate the legacy migration rule.
- [ ] Add one end-to-end test: valid earn → duplicate retry → cap → level boundary → undo → rebuild.

**Acceptance:** changing browser storage cannot change server reward eligibility; duplicate or concurrent requests cannot create extra awards; ledger replay produces the same lifetime total, level, and active-day count.

### Milestone 5 — release the v2 progression without rewards (1 sprint plus observation)

**Outcome:** the new economy is understandable and stable before it carries value.

- [ ] Ship the final v2 award scale, thresholds, rank names, and rule version.
- [ ] Update all “XP” and Hasanah explanations consistently.
- [ ] Show lifetime Hasanah, level progress, and verified active days without showing a redeem button.
- [ ] Explain any legacy-level treatment before migration takes effect.
- [ ] Monitor complaints, earning distribution, ledger drift, suspicious activity, and retention for at least two weeks.
- [ ] Make only evidence-backed corrections and increment the rule version for material changes.

**Acceptance:** no unresolved progression-loss incident, zero unexplained reconciliation difference, and observed level speed remains within the calibrated range.

### Milestone 6 — open support intake (can start during Milestones 3–5)

**Outcome:** potential supporters can contact Nawaetu before a marketplace exists.

- [ ] Add the “Support Nawaetu” card described in Section 4.3 to the future Rewards section.
- [ ] Provide “Offer Support” and “Contact Us” actions.
- [ ] Send the short form to a manually reviewed inbox or internal list.
- [ ] Publish contribution criteria, privacy notice, and the statement that submission does not guarantee acceptance.
- [ ] Prepare the one-page partner pack from Section 12.
- [ ] Contact 5–10 suitable existing relationships or digital-product providers.

**Acceptance:** a supporter can submit an offer, receive acknowledgement, and be tracked to an accept/decline/follow-up decision without sensitive financial data.

### Milestone 7 — run one manual reward pilot

**Outcome:** validate demand and operations before building Reward Credit infrastructure.

- [ ] Select one fixed-inventory digital reward or capped community-impact campaign.
- [ ] Sign a simple agreement covering inventory/budget, eligibility, dates, fulfillment, reporting, and unused support.
- [ ] Complete legal, privacy, consumer-protection, and Sharia review for that exact pilot.
- [ ] Publish terms, stock/cap, eligibility, support route, and fulfillment timing.
- [ ] Calculate eligibility from canonical data and manually review suspicious claims.
- [ ] Fulfill manually and maintain an auditable claim ledger.
- [ ] Publish aggregate campaign results and review the metrics in Section 10.

**Go/no-go for automation:** build Phase 3 Reward Credits and self-service redemption only after at least one pilot fulfills ≥95% of accepted claims, stays within budget, reconciles to zero unexplained difference, and demonstrates enough user and partner demand to repeat.

### Immediate first sprint backlog

Start with these items only:

1. [ ] Approve the decisions in Section 13.
2. [ ] Build the earning-event matrix.
3. [ ] Trace and classify every current award and reversal path.
4. [ ] Define the minimum anonymous metrics needed for four-week calibration.
5. [ ] Add tests for current level boundaries and duplicate canonical awards before changing rules.

Do **not** build a marketplace, voucher integration, partner portal, physical fulfillment system, or spendable-credit database in the first sprint.

---

### Current code references

- Progression calculation: `src/lib/habits/progression.ts`
- Guest/local award flow: `src/lib/habits/leveling.ts`
- Canonical ledger transaction: `src/core/repositories/progression.repository.ts`
- Mission award validation and sync: `src/core/repositories/db-sync.repository.ts`
- Progression tables and constraints: `src/db/schema.ts`
- Authenticated hydration: `src/components/auth/GuestSyncManager.tsx`
- User-facing progression response: `src/app/api/user/full-data/route.ts`
- Level behavior tests: `src/lib/habits/progression.test.ts`

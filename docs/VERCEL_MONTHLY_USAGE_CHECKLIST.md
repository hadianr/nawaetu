# Vercel Hobby Monthly Usage Check

Review this checklist once per month before a release. Open the team **Usage** page and record the current period, consumed amount, included amount, and trend for each metric.

Usage page: `Vercel Dashboard → Team → Usage`

## Record

| Metric | Current | Included / limit | Trend or note |
|---|---:|---:|---|
| Build execution |  | See current Vercel limits |  |
| Deployments per day |  | 100/day |  |
| Function invocations |  | 1,000,000 |  |
| Edge requests |  | 1,000,000 |  |
| Fast Data Transfer |  | 100 GB |  |
| Fast Origin Transfer |  | 10 GB |  |
| Image transformations |  | 5,000 |  |
| Image cache reads |  | 300,000 |  |
| Image cache writes |  | 100,000 |  |
| Speed Insights events |  | 10,000 / 30 days |  |
| Web Analytics events |  | 50,000 / month |  |
| Runtime log retention |  | 1 hour |  |

## Action thresholds

These are team operating thresholds, not Vercel limits:

- At 70%: review the highest-growth metric and avoid unnecessary preview redeployments.
- At 85%: batch releases, keep documentation-only changes on the ignored-build path, and disable nonessential analytics during testing.
- At 95%: stop nonessential previews and investigate before the limit is reached.

## Nawaetu-specific checks

- Confirm cron-job.org remains the only active scheduler for prayer alerts and streak reminders.
- Confirm Preview deployments remain protected by Vercel Authentication Standard Protection.
- Confirm `vercel.json` still contains the deterministic install and documentation-only `ignoreCommand`.
- Confirm Supabase, Upstash, Sentry, and payment secrets are targeted to the narrowest required environments.
- Record the review date and a link or screenshot of the Usage page in the issue or release notes.

Official references: [Hobby plan](https://vercel.com/docs/plans/hobby), [Vercel limits](https://vercel.com/docs/limits), and [manage and optimize usage](https://vercel.com/docs/pricing/manage-and-optimize-usage).

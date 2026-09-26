// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// VERCEL_URL is the generated deployment URL, not the custom production
// domain. Use VERCEL_ENV so production observability works on every deploy.
const isProduction = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";

if (isProduction) {
  Sentry.init({
    dsn: "https://01c92628e40472d65fa8216a0628ddd9@o4510815612960768.ingest.us.sentry.io/4510815614468096",
    environment: process.env.VERCEL_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}

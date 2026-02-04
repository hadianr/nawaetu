// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production environment (nawaetu.com)
const isProduction = process.env.NODE_ENV === "production" && 
  (process.env.VERCEL_URL === "nawaetu.com" || process.env.NEXT_PUBLIC_VERCEL_URL === "nawaetu.com");

if (isProduction) {
  Sentry.init({
    dsn: "https://01c92628e40472d65fa8216a0628ddd9@o4510815612960768.ingest.us.sentry.io/4510815614468096",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}

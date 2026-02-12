// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Defer Sentry initialization to idle callback to avoid blocking FCP
const initSentry = () => {
  // Only initialize Sentry in production environment (nawaetu.com)
  const isProduction = typeof window !== "undefined" && 
    (window.location.hostname === "nawaetu.com" || window.location.hostname === "www.nawaetu.com");
  
  if (!isProduction) {
    return;
  }

  Sentry.init({
    dsn: "https://01c92628e40472d65fa8216a0628ddd9@o4510815612960768.ingest.us.sentry.io/4510815614468096",

    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration()],

    // Reduce sample rate - only capture 10% of traces in production
    tracesSampleRate: 0.1, // Changed from 1 to 0.1
    // Disable logs to reduce bundle size
    enableLogs: false,

    // Define how likely Replay events are sampled.
    // Reduced from 1 to 0.05 to minimize payload
    replaysSessionSampleRate: 0.05,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 0.5,

    // Disable sending user PII to reduce processing
    sendDefaultPii: false,
  });
};

// Defer Sentry initialization until idle or interaction
if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(initSentry, { timeout: 5000 });
  } else {
    setTimeout(initSentry, 2000);
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

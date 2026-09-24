/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

type SentryClient = typeof import("@sentry/nextjs");
type PendingError = {
  error: unknown;
  context?: Record<string, unknown>;
};

let sentryModule: Promise<SentryClient> | undefined;
let sentryInit: Promise<SentryClient | null> | undefined;
let sentryInitialized = false;
const pendingErrors: PendingError[] = [];

function loadSentry(): Promise<SentryClient> {
  return sentryModule ??= import("@sentry/nextjs");
}

function isProductionBrowser(): boolean {
  return typeof window !== "undefined" &&
    (window.location.hostname === "nawaetu.com" || window.location.hostname === "www.nawaetu.com");
}

function capturePendingError(Sentry: SentryClient, pending: PendingError): void {
  if (!pending.context) {
    Sentry.captureException(pending.error);
    return;
  }

  Sentry.withScope((scope) => {
    for (const [key, value] of Object.entries(pending.context ?? {})) {
      scope.setExtra(key, value);
    }
    Sentry.captureException(pending.error);
  });
}

function initSentry(): Promise<SentryClient | null> {
  if (sentryInit) return sentryInit;

  const attempt = (async () => {
    if (!isProductionBrowser()) return null;

    const Sentry = await loadSentry();
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

    // Ignore known React 19 and browser noise errors.
    // The Circular JSON TypeError occurs when Sentry Replay or Breadcrumbs tries to deeply serialize a clicked DOM element containing React's internal `__reactFiber` property which holds circular references.
    ignoreErrors: [
      /TypeError: Converting circular structure to JSON.*HTMLButtonElement/i,
      /Converting circular structure to JSON/i,
      /ReferenceError: Can't find variable: __firefox__/i,
      /Can't find variable: __firefox__/i,
      /window\.webkit\.messageHandlers/i,
      /undefined is not an object \(evaluating 'window\.webkit\.messageHandlers'\)/i,
      /Registration failed - push service error/i,
      /AbortError: Registration failed/i,
      // Ignore browser extension and Web3 errors
      /Failed to connect to MetaMask/i,
      /MetaMask extension not found/i,
    ],
    });

    sentryInitialized = true;
    for (const pending of pendingErrors.splice(0)) {
      capturePendingError(Sentry, pending);
    }
    return Sentry;
  })();

  sentryInit = attempt.catch(() => {
    // Observability must never affect application startup.
    sentryInit = undefined;
    return null;
  });

  return sentryInit;
}

export function captureClientException(error: unknown, context?: Record<string, unknown>): void {
  if (!isProductionBrowser()) return;

  const pending = { error, context };
  if (!sentryInitialized) {
    pendingErrors.push(pending);
    void initSentry();
    return;
  }

  void loadSentry().then((Sentry) => capturePendingError(Sentry, pending)).catch(() => undefined);
}

function captureEarlyBrowserError(error: unknown, context: Record<string, unknown>): void {
  if (!sentryInitialized) {
    pendingErrors.push({ error, context });
    void initSentry();
  }
}

// Defer idle-only Sentry initialization past the initial performance window.
// Browser errors, rejected promises, and route transitions still initialize it immediately.
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    captureEarlyBrowserError(event.error ?? new Error(event.message || "Unhandled browser error"), {
      source: "window.error",
      filename: event.filename,
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    captureEarlyBrowserError(event.reason, { source: "unhandledrejection" });
  });

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => void initSentry(), { timeout: 10000 });
  } else {
    setTimeout(() => void initSentry(), 10000);
  }
}

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
): void {
  void initSentry()
    .then((Sentry) => Sentry?.captureRouterTransitionStart(url, navigationType))
    .catch(() => undefined);
}

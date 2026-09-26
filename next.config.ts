import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  sw: "sw.js", // Use actual SW output filename
  // Register from the guarded client component so unsupported browsers do not
  // create an unhandled rejection when /sw.js cannot load.
  register: false,
  // Workbox's front-end navigation wrapper can race registration and read an
  // undefined registration during client-side Quran navigation.
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // Keep the Workbox runtime inside /sw.js so deployment cannot leave the
    // worker pointing at a missing /workbox-*.js asset.
    inlineWorkboxRuntime: true,
    // Next may omit this optional App Router manifest from the deployment.
    exclude: [/\.map$/, /\/_buildManifest\.js$/],
    // Source maps are optional debugging assets and are not deployed reliably.
    manifestTransforms: [
      async (manifest) => ({
        manifest: manifest.filter(({ url }) =>
          !url.endsWith('.map') && !url.endsWith('/_buildManifest.js')
        ),
      }),
    ],
    skipWaiting: true,   // Activate new SW immediately without waiting for tabs to close
    clientsClaim: true,  // New SW takes control of all open clients immediately after activation
    // Workbox resolves imported workers from the site root. The leading slash
    // is required so the generated /sw.js keeps the Firebase handler.
    importScripts: ["/firebase-messaging-sw.js"],
  },
});

const nextConfig: NextConfig = {
  // Keep the framework-only dev badge from competing with the mobile nav.
  devIndicators: false,
  // Permit the loopback host used by local browsers to connect to HMR.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],

  // Transpile packages that use @babel/runtime to prevent chunk loading issues
  transpilePackages: ['framer-motion'],
  // Generate browser source maps only when Sentry can upload them for a
  // production deployment; preview builds keep runtime monitoring without
  // uploading the larger browser map set.
  productionBrowserSourceMaps: Boolean(process.env.SENTRY_AUTH_TOKEN) && process.env.VERCEL_ENV !== "preview",

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Modern output configuration (disable standalone in Vercel to avoid NFT trace missing error)
  output: process.env.VERCEL ? undefined : 'standalone',

  // CSS optimization - defer non-critical CSS
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slot",
      "@google/generative-ai",
      "@sentry/nextjs"
    ],
    webVitalsAttribution: ["CLS", "LCP"],
    optimizeCss: true,
    webpackBuildWorker: true,
    scrollRestoration: false,
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn logs for debugging
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Keep one indexable host and preserve the requested path and query string.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.nawaetu.com' }],
        destination: 'https://nawaetu.com/:path*',
        permanent: true,
      },
    ];
  },

  // Force SW to not cache + Static security headers (moved from middleware for zero per-request CPU cost)
  async headers() {
    // Shared security headers applied to ALL routes
    const securityHeaders = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Permissions-Policy', value: 'geolocation=(self), magnetometer=(self), gyroscope=(self), accelerometer=(self)' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} https://*.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://vercel.live https://www.gstatic.com`,
          "worker-src 'self' blob:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https://*.google.com https://*.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://avatar.vercel.sh https://lh3.googleusercontent.com https://cdn.islamic.network",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https://www.googletagmanager.com https://*.googleapis.com https://*.firebaseio.com https://api.aladhan.com https://*.sentry.io https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://lh3.googleusercontent.com https://quran-api-id.vercel.app https://api.quran.gading.dev https://api.quran.com https://api.bigdatacloud.net https://openrouter.ai https://cdn.islamic.network",
          "media-src 'self' https://raw.githubusercontent.com https://www.ayouby.com https://cdn.islamic.network",
          "frame-src 'self' https://*.google.com https://vercel.live",
          "frame-ancestors 'self' chrome-extension://* edge-extension://* moz-extension://* chrome-extension: edge-extension: moz-extension:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    ];

    return [
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // SW files — no cache
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/workbox-:hash.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      // Note: /_next/static/* Cache-Control is managed automatically by Next.js
      // (public, max-age=31536000, immutable for content-hashed assets).
      // Setting it manually here triggers a build warning in Next.js 16+.
      // Disallow robots from user-specific authored pages
      {
        source: '/(bookmarks|settings|stats|journal|hadith)(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

// Only enable the Sentry build plugin when production credentials are available.
// Runtime Sentry initialization remains handled by the instrumentation files.
const isProd = process.env.NODE_ENV === "production";
const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN);
const isVercelPreview = process.env.VERCEL_ENV === "preview";
const baseConfig = withPWA(nextConfig);

// SWUpdatePrompt registers the generated worker with the native browser API.
// Avoid shipping next-pwa's unused Workbox client bootstrap in the initial bundle.
const configWithoutPwaClientEntry: NextConfig = {
  ...baseConfig,
  webpack(config, options) {
    const configured = baseConfig.webpack ? baseConfig.webpack(config, options) : config;

    // Vercel's persistent Webpack filesystem cache grew beyond 3 GB locally and
    // exhausted the build volume. Keep the per-build cache in memory on Vercel;
    // local builds retain Next's normal filesystem cache.
    if (process.env.VERCEL && !options.dev && configured.cache) {
      configured.cache = { type: "memory" };
    }

    if (options.isServer || typeof configured.entry !== "function") return configured;

    const originalEntry = configured.entry;
    configured.entry = async () => {
      const entries = await originalEntry();

      for (const key of ["main.js", "main-app"]) {
        const entry = entries[key];
        if (Array.isArray(entry)) {
          entries[key] = entry.filter((item) => !String(item).endsWith("/sw-entry.js"));
        }
      }

      return entries;
    };

    return configured;
  },
};

export default isProd && hasSentryAuthToken
  ? withSentryConfig(configWithoutPwaClientEntry, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "nawaetu",

    project: "javascript-nextjs",

    // Keep unauthenticated CI/Preview builds quiet; authenticated production
    // builds retain Sentry upload logs for verification.
    silent: !hasSentryAuthToken,

    // Disable Sentry's build-time telemetry; runtime error reporting remains enabled.
    telemetry: false,
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: !isVercelPreview,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Disabling generic "enabled" flag isn't native to withSentryConfig options object usually, 
    // but wrapping conditionally is safer.
  })
  : configWithoutPwaClientEntry;

import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  sw: "sw.js", // Use actual SW output filename
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,   // Activate new SW immediately without waiting for tabs to close
    clientsClaim: true,  // New SW takes control of all open clients immediately after activation
    importScripts: ["/firebase-messaging-sw.js"], // Import Firebase logic into the main PWA SW
  },
});

const nextConfig: NextConfig = {
  // Transpile packages that use @babel/runtime to prevent chunk loading issues
  transpilePackages: ['framer-motion'],
  serverExternalPackages: ["@prisma/instrumentation", "@opentelemetry/instrumentation"],
  productionBrowserSourceMaps: true,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Modern output configuration
  output: 'standalone',

  // CSS optimization - defer non-critical CSS
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "lodash",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slot",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "react-markdown",
      "@google/generative-ai",
      "groq-sdk",
      "sentry",
      "@sentry/nextjs"
    ],
    optimizeCss: false, // Disabled to avoid critters dependency and parse errors
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

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        usedExports: true, // Enable tree-shaking for unused code removal
        sideEffects: false,
        minimize: true,
        minimizer: config.optimization.minimizer || [],
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          minSize: 40000, // Increase min size to prevent too many small chunks
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription|next|@babel[\\/]runtime)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 20,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Force SW to not cache
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/workbox-:hash.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

// Only enable Sentry in Production to avoid "tunnelRoute" (monitoring) blocking dev server (30s timeout/latency)
const isProd = process.env.NODE_ENV === "production";

export default isProd
  ? withSentryConfig(withPWA(nextConfig), {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "nawaetu",

    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Disabling generic "enabled" flag isn't native to withSentryConfig options object usually, 
    // but wrapping conditionally is safer.
  })
  : withPWA(nextConfig);

import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Ensure heavy libraries are transpiled to match our modern browserslist
  transpilePackages: ["lucide-react", "date-fns", "lodash"],
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
    optimizeCss: true, // Inline critical CSS, defer non-critical
    webpackBuildWorker: true,
    scrollRestoration: false,
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
          maxInitialRequests: 3,  // Limit initial chunks - reduce render-blocking
          maxAsyncRequests: 5,
          minSize: 20000,         // Increase min size to merge small chunks
          minRemainingSize: 0,
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for react/next
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription|next)[\\/]/,
              priority: 40,
              enforce: true,
              reuseExistingChunk: true,
            },
            // Common libraries - be selective
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return `npm.${packageName?.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 2,  // Revert to 2, but with minSize increase
              reuseExistingChunk: true,
              enforce: true,
            },
            // Shared components (reduce unused code)
            commons: {
              name: 'commons',
              minChunks: 3,
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
              minSize: 30000,  // Only create commons if it saves space
            },
          },
        },
      };
    }
    return config;
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

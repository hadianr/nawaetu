import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // design.md: icons come from AppIcon or the reviewed glyph list, never straight from Lucide.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/AppIcon.tsx", "src/components/ui/icons.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "lucide-react", message: "Import icons from @/components/ui/AppIcon or @/components/ui/icons." }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "node_modules/**",

    // Generated PWA/service-worker output.
    "public/sw.js",
    "public/sw.js.map",
    "public/workbox-*.js",
    "public/workbox-*.js.map",
    "public/swe-worker-*.js",
    "public/swe-worker-*.js.map",

    // Browser extension files are plain JS and have their own runtime constraints.
    "extension/**",
  ]),
]);

export default eslintConfig;

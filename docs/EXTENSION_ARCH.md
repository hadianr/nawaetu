# 🧩 Nawaetu Browser Extension Architecture

## Strategy: "One Codebase, Two Builds"

We aim to deploy Nawaetu as both a **PWA** (Web) and a **Browser Extension** (Chrome/Edge) without maintaining two separate projects.

### 1. Hybrid Build System via `next.config.ts`

- **PWA (Production)**: Standard `next build` (SSR/ISR supported).
- **Extension (Static)**: `output: 'export'` (Pure HTML/CSS/JS).

### 2. File Structure

```text
/public
  /manifest.json       <-- PWA Manifest
  /manifest.v3.json    <-- Extension Manifest (renamed during build)
  /icons/              <-- Shared Icons
```

### 3. Build Script (`scripts/build-extension.sh`)

This script will:
1.  Force `NEXT_PUBLIC_BUILD_MODE='extension'`.
2.  Run `next build` with static export config.
3.  Post-process the `out/` folder:
    - mv `manifest.v3.json` -> `manifest.json`
    - Remove `sw.js` (Service Workers behave differently in extensions).
    - Zip the folder for upload to Chrome Web Store.

### 4. Implementation Steps (v1.6.0)

1.  **Duplicate Manifest**: Create `public/manifest.v3.json` with:
    - `action.default_popup`: `index.html`
    - `permissions`: `["storage", "alarms"]` (for notifications).
2.  **Env Config**: Update `next.config.ts` to switch `output` mode based on `process.env.BUILD_MODE`.
3.  **Routing Check**: Ensure `next/link` works correctly in static mode (no server prefetching).

### 5. Limitations & Workarounds

- **API Routes**: Next.js API routes (`/api/*`) **WILL NOT WORK** in the extension (no server).
  - *Solution*: Clients must hit the remote API (`https://nawaetu.com/api/...`) instead of local.
- **Image Optimization**: `next/image` requires a server.
  - *Solution*: Use `unoptimized: true` in `next.config.ts` for extension build.

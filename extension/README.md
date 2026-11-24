# Nawaetu Browser Extension

This directory contains the source code for the Nawaetu Browser Extension: a standalone side panel with prayer times, adzan notifications, Quran, and dhikr.

## How it works
The popup (`popup.html`, `popup.css`, `popup.js`) is its own page and calls public APIs directly; it does not embed nawaetu.com. Changes to it reach users only through a new store release, so bump `version` in `manifest.json` and upload a new package. Its colors come from the app's Emerald theme tokens (see `design.md`).

## Packaging for the Store

To publish this extension to the Chrome Web Store, Edge Add-ons, or Firefox Add-ons, you need to package it as a `.zip` file.

You can automatically generate the zip file by running the following command from the root of the Nawaetu project:

```bash
npm run build:extension
# or
yarn build:extension
# or
pnpm build:extension
```

This will create a `nawaetu-extension.zip` file in the root directory.

## Publishing Steps

### Google Chrome Web Store
1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
2. Register as a developer ($5 one-time fee).
3. Click "New Item" and upload the `nawaetu-extension.zip` file.
4. Fill in the store listing details:
   - **Description**: Gamified Islamic habit tracker app featuring Al-Quran, Prayer Times, Qibla Compass, and AI Spiritual Assistant.
   - **Category**: Productivity or Lifestyle.
   - **Screenshots**: Upload at least 1 screenshot (1280x800 or 640x400).
   - **Promotional Tile**: Upload a 440x280 image.
5. In the "Privacy" tab, justify the use of the `storage` permission (used locally if needed) and explain that the extension frames the main website.
6. Submit for review.

### Microsoft Edge Add-ons
1. Go to the [Edge Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview).
2. Register as a developer (free).
3. Create a new extension and upload the `nawaetu-extension.zip`.
4. Fill out similar store listing details and submit.

### Firefox Add-ons (Mozilla)
1. Go to the [Firefox Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/).
2. Submit a new Add-on, upload the zip, and follow the instructions.

## Development & Testing Locally
1. Open Chrome/Edge and navigate to `chrome://extensions` or `edge://extensions`.
2. Enable "Developer mode" (top right corner).
3. Click "Load unpacked" and select this `extension` directory.
4. The extension icon will appear in your browser toolbar.

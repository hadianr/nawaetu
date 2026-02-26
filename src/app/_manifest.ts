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

import { APP_CONFIG } from "@/config/app-config";

export type NawaetuManifest = {
  gcm_sender_id: string;
  permissions: string[];
} & Record<string, unknown>;

export function buildManifest(): NawaetuManifest {
  return {
    name: "Nawaetu - #StartWithIntention | Muslim Habit Tracker",
    short_name: "Nawaetu",
    description: APP_CONFIG.description,
    gcm_sender_id: "567398306395",
    start_url: `/?v=${APP_CONFIG.version}`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#0a0a0a",
    permissions: ["notifications"],
    categories: ["lifestyle", "productivity", "education"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name: "Baca Al-Quran",
        short_name: "Quran",
        description: "Baca Al-Quran langsung",
        url: "/quran",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Tasbih Digital",
        short_name: "Tasbih",
        description: "Dzikir dengan tasbih digital",
        url: "/dhikr",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Arah Kiblat",
        short_name: "Kiblat",
        description: "Cari arah kiblat",
        url: "/qibla",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
          },
        ],
      },
    ],
  };
}

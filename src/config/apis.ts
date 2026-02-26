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

export const API_CONFIG = {
    // Quran & Kemenag Data
    QURAN_ID: {
        BASE_URL: "https://quran-api-id.vercel.app", // Host: gadingnst
    },
    QURAN_GADING: {
        BASE_URL: "https://api.quran.gading.dev"
    },
    QURAN_COM: {
        BASE_URL: "https://api.quran.com/api/v4",
    },
    AUDIO: {
        ISLAMIC_NETWORK_CDN: "https://cdn.islamic.network/quran/audio",
    },

    // Prayer Times & Location
    ALADHAN: {
        BASE_URL: "https://api.aladhan.com/v1",
    },
    LOCATION: {
        BIGDATA_CLOUD: "https://api.bigdatacloud.net/data/reverse-geocode-client",
        NOMINATIM: "https://nominatim.openstreetmap.org/reverse",
    },

    // LLM Providers
    OPENROUTER: {
        BASE_URL: "https://openrouter.ai/api/v1",
    },
} as const;

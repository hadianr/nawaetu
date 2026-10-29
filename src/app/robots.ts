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

import { MetadataRoute } from 'next'

const disallow = [
    '/api/',
    '/admin/',
    // User-specific pages — require login, cannot be meaningfully crawled
    '/bookmarks',
    '/settings',
    '/stats',
    '/journal',
    '/notification-debug',
]

// AI search/assistant crawlers are named explicitly so the policy is deliberate.
// Training-only bots (GPTBot, CCBot) are left to the '*' rule.
const aiCrawlers = [
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Perplexity-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'Google-Extended',
    'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: '*', allow: '/', disallow },
            { userAgent: aiCrawlers, allow: '/', disallow },
        ],
        sitemap: 'https://nawaetu.com/sitemap.xml',
    }
}

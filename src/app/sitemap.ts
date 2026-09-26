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
import { SIRAH_CHAPTERS, SIRAH_SECTIONS } from '@/data/sirah'

// ISR: Sitemap is static \u2014 revalidate once per day so bots don't trigger
// re-generation on every crawl
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://nawaetu.com'
    const currentDate = new Date()

    // Public static pages — bot-accessible
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/quran`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/qibla`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/mentor-ai`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dhikr`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        { url: `${baseUrl}/hadith`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/dua`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/hijri-calendar`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/ramadhan`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/sirah`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/rewards`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    ]

    // Generate all 114 Surah pages dynamically
    // These are now statically pre-built via generateStaticParams; bot crawls serve from cache
    const surahPages: MetadataRoute.Sitemap = Array.from({ length: 114 }, (_, i) => ({
        url: `${baseUrl}/quran/${i + 1}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    const sirahPages: MetadataRoute.Sitemap = [
        ...SIRAH_CHAPTERS.map((chapter) => ({
            url: `${baseUrl}/sirah/${chapter.slug}`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        })),
        ...SIRAH_SECTIONS.map((section) => ({
            url: `${baseUrl}/sirah/${section.chapterSlug}/${section.id}`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        })),
    ]

    // Personal progress and settings remain excluded from search discovery.
    return [...staticPages, ...surahPages, ...sirahPages]
}

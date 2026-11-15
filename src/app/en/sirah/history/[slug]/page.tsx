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

import { notFound } from "next/navigation";
import { HISTORY_CHAPTERS, getHistoryChapter } from "@/data/history/chapters";
import { HISTORY_CONTENT } from "@/data/history/content";
import { HistoryChapterView } from "@/components/history/HistoryChapterView";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, article } from "@/components/seo/JsonLd";
import { SIRAH_BREADCRUMB, sirahBreadcrumb } from "@/data/sirah/seo";

export function generateStaticParams() {
    return HISTORY_CHAPTERS.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const chapter = getHistoryChapter(slug);
    if (!chapter) notFound();
    return pageMetadata(`${chapter.titleEn} · Timeline of the Sirah`, chapter.introEn, `/en/sirah/history/${slug}`, {
        locale: "en",
        languages: { id: `/sirah/history/${slug}`, en: `/en/sirah/history/${slug}` },
    });
}

export default async function EnglishHistoryChapterPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const chapter = getHistoryChapter(slug);
    if (!chapter) notFound();
    const path = `/en/sirah/history/${slug}`;
    // Only this chapter's hadiths reach the client.
    return (
        <>
            <JsonLd data={sirahBreadcrumb(SIRAH_BREADCRUMB.historyEn, { name: chapter.titleEn, path })} />
            <JsonLd data={article(`${chapter.titleEn} · Timeline of the Sirah`, chapter.introEn, path, "en")} />
            <HistoryChapterView
                chapter={chapter}
                hadiths={HISTORY_CONTENT[slug] ?? []}
                prev={HISTORY_CHAPTERS.find((c) => c.order === chapter.order - 1)}
                next={HISTORY_CHAPTERS.find((c) => c.order === chapter.order + 1)}
            />
        </>
    );
}

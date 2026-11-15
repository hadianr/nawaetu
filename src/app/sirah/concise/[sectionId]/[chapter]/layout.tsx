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

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { getConcisePage, getConcisePageLabel, getConcisePages, getConciseSection, getConciseSectionLabel } from "@/data/sirah/concise";

// Editions can split a part into a different number of pages, so a number is valid if either edition has it.
function maxChapters(sectionId: string): number {
  const pages = (locale: string) => {
    const section = getConciseSection(locale, sectionId);
    return section ? getConcisePages(section).length : 0;
  };
  return Math.max(pages("id"), pages("en"));
}

export function generateStaticParams({ params }: { params: { sectionId: string } }) {
  return Array.from({ length: maxChapters(params.sectionId) }, (_, i) => ({ chapter: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ sectionId: string; chapter: string }> }) {
  const { sectionId, chapter } = await params;
  const ref = getConcisePage("id", sectionId, Number(chapter));
  if (!ref) return {};
  return pageMetadata(
    `${getConcisePageLabel(ref)} - ${getConciseSectionLabel(ref.section)}`,
    "Bab dari Catatan Penting Seputar Sejarah dan Kepribadian Rasulullah karya Syaikh Haitsam Sarhan, teks tanpa diubah.",
    `/sirah/concise/${sectionId}/${chapter}`,
  );
}

export default async function ConciseChapterLayout({ children, params }: { children: ReactNode; params: Promise<{ sectionId: string; chapter: string }> }) {
  const { sectionId, chapter } = await params;
  const n = Number(chapter);
  if (!Number.isInteger(n) || n < 1 || n > maxChapters(sectionId)) notFound();
  return children;
}

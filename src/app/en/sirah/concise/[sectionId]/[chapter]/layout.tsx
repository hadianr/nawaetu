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
import { pageMetadata, seoTitle } from "@/lib/seo";
import { JsonLd, chapterPart } from "@/components/seo/JsonLd";
import { getConcisePages, getConciseSection, getConciseSectionLabel } from "@/data/sirah/concise";
import { CONCISE_BOOK_INFO, concisePageSeoDescription, concisePageSeoTitle, getConcisePageForSeo } from "@/data/sirah/concise/seo";
import { SIRAH_BREADCRUMB, sirahBreadcrumb } from "@/data/sirah/seo";

function pageCount(sectionId: string): number {
  const section = getConciseSection("en", sectionId);
  return section ? getConcisePages(section).length : 0;
}

export function generateStaticParams({ params }: { params: { sectionId: string } }) {
  return Array.from({ length: pageCount(params.sectionId) }, (_, i) => ({ chapter: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ sectionId: string; chapter: string }> }) {
  const { sectionId, chapter } = await params;
  const ref = getConcisePageForSeo(sectionId, Number(chapter), "en");
  if (!ref) return {};
  const path = `/sirah/concise/${sectionId}/${ref.number}`;
  // The English edition's extra appendix page has no Indonesian counterpart, so it gets no language pair.
  const indonesian = getConciseSection("id", sectionId);
  const paired = !!indonesian && getConcisePages(indonesian).length >= ref.number;
  return pageMetadata(`${concisePageSeoTitle(ref, "en")} · Concise Sirah`, concisePageSeoDescription(ref, "en"), `/en${path}`, {
    locale: "en",
    ...(paired ? { languages: { id: path, en: `/en${path}` } } : {}),
  });
}

export default async function EnglishConcisePageLayout({ children, params }: { children: ReactNode; params: Promise<{ sectionId: string; chapter: string }> }) {
  const { sectionId, chapter } = await params;
  const n = Number(chapter);
  if (!Number.isInteger(n) || n < 1 || n > pageCount(sectionId)) notFound();
  const ref = getConcisePageForSeo(sectionId, n, "en");
  if (!ref) return children;
  const path = `/en/sirah/concise/${sectionId}/${ref.number}`;
  const title = concisePageSeoTitle(ref, "en");
  return (
    <>
      <JsonLd data={sirahBreadcrumb(
        SIRAH_BREADCRUMB.conciseEn,
        { name: seoTitle(getConciseSectionLabel(ref.section), "en"), path: `/en/sirah/concise/${sectionId}/1` },
        { name: title, path },
      )} />
      <JsonLd data={chapterPart(title, concisePageSeoDescription(ref, "en"), path, CONCISE_BOOK_INFO, ref.number, "en")} />
      {children}
    </>
  );
}

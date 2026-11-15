/**
 * Nawaetu - how search engines and AI assistants should name and credit the concise sirah
 * Copyright (C) 2026 Hadian Rahmat
 */

import { seoTitle } from "@/lib/seo";
import type { BookInfo } from "@/components/seo/JsonLd";
import { getConcisePage, getConcisePageLabel, getConciseSection, getConciseSectionLabel, getConciseSirah, type ConcisePageRef } from "./index";

export type SeoLang = "id" | "en";
import { getConciseNote } from "./notes";

const id = getConciseSirah("id");
const en = getConciseSirah("en");

export const CONCISE_BOOK_INFO: BookInfo = {
    name: "Catatan Penting Seputar Sejarah dan Kepribadian Rasulullah",
    alternateName: "A Concise Biography of the Prophet and His Special Traits",
    author: "Syaikh Haitsam bin Muhammad Sarhan",
    translators: [...id.translators, ...en.translators],
    inLanguage: ["id", "en"],
    sameAs: [id.sourceUrl, en.sourceUrl],
    path: "/sirah/concise",
};

const TITLE_MAX = 55;

function shorten(title: string): string {
    // Name the Prophet once: "Para Pengasuh Nabi Muhammad SAW · Pekerjaan Nabi Muhammad SAW" -> "... · Pekerjaan".
    let seen = false;
    let t = title.replace(/ Nabi Muhammad SAW|Prophet Muhammad SAW's /g, (m) => (seen ? (m.startsWith("Prophet") ? "His " : "") : ((seen = true), m)));
    if (t.length > TITLE_MAX && t.includes(":")) t = t.slice(0, t.indexOf(":")).trim();
    if (t.length > TITLE_MAX) t = `${t.slice(0, t.lastIndexOf(" ", TITLE_MAX)).replace(/[,·]$/, "").trim()}…`;
    return t;
}

/** A search title for a reading page: its chapters, or the first one when several make the title too long. */
export function concisePageSeoTitle(ref: ConcisePageRef, lang: SeoLang = "id"): string {
    const all = seoTitle(getConcisePageLabel(ref), lang);
    const first = ref.chapters[0].chapter.title;
    if (all.length > TITLE_MAX && ref.chapters.length > 1 && first) return shorten(`${seoTitle(first, lang)} ${lang === "en" ? "and more" : "dan lainnya"}`);
    return shorten(all);
}

/** A description unique to the page: its "Memahami Lebih Dalam" context, or a line naming the part. */
export function concisePageSeoDescription(ref: ConcisePageRef, lang: SeoLang = "id"): string {
    const note = getConciseNote(ref);
    if (note) return lang === "en" ? note.contextEn : note.contextId;
    const part = seoTitle(getConciseSectionLabel(ref.section), lang);
    return lang === "en"
        ? `${part}: part of the Concise Sirah by Shaykh Haytham Sarhan, the book's text unchanged.`
        : `${part}: bagian dari Ringkasan Sirah karya Syaikh Haitsam Sarhan, teks buku tanpa diubah.`;
}

export function getConcisePageForSeo(sectionId: string, page: number, lang: SeoLang = "id"): ConcisePageRef | undefined {
    return getConciseSection(lang, sectionId) ? getConcisePage(lang, sectionId, page) : undefined;
}

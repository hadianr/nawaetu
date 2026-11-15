/**
 * Nawaetu - titles, descriptions and structured data for the Sirah pages
 * Copyright (C) 2026 Hadian Rahmat
 *
 * JSON-LD lives on each page, not in layouts, so a parent's breadcrumb never repeats on its child pages.
 */

import { book, breadcrumbList, collectionPage } from "@/components/seo/JsonLd";
import { CONCISE_BOOK_INFO } from "./concise/seo";

const SIRAH = { name: "Sirah Nabawiyah", path: "/sirah" };
const HOME = { name: "Nawaetu", path: "/" };

export const SIRAH_SEO = {
    hub: {
        title: "Sirah Nabawiyah: Ringkasan, Kisah Lengkap & Lini Masa",
        description: "Pelajari perjalanan hidup Nabi Muhammad SAW dengan tiga cara: ringkasan karya Syaikh Haitsam Sarhan (Indonesia dan Inggris), 50 bab Ar-Rahiq al-Makhtum, dan lini masa peristiwa berbasis hadits.",
    },
    concise: {
        title: "Ringkasan Sirah Nabawiyah: Sejarah & Kepribadian Nabi Muhammad SAW",
        description: "Buku ringkas Syaikh Haitsam Sarhan tentang sejarah dan kepribadian Nabi Muhammad SAW, dalam bahasa Indonesia dan Inggris, dimuat tanpa diubah dengan izin penulis dan dibaca per halaman.",
    },
    full: {
        title: "Sirah Nabawiyah Lengkap per Bab (Ar-Rahiq al-Makhtum)",
        description: "50 bab sirah Nabi Muhammad SAW dari Ar-Rahiq al-Makhtum (terjemahan bahasa Indonesia), dengan progres baca dan pencarian.",
    },
    history: {
        title: "Lini Masa Peristiwa Sirah Nabawiyah",
        description: "Peristiwa penting dalam kehidupan Nabi Muhammad SAW secara berurutan, dari sebelum kenabian sampai wafat, dengan hadits sahih dari HadeethEnc dan tanggal yang bisa dicek sumbernya.",
    },
} as const;

export const SIRAH_BREADCRUMB = {
    concise: { name: "Ringkasan Sirah", path: "/sirah/concise" },
    full: { name: "Sirah Lengkap", path: "/sirah/full" },
    history: { name: "Lini Masa Peristiwa", path: "/sirah/history" },
};

export function sirahBreadcrumb(...items: { name: string; path: string }[]) {
    return breadcrumbList([HOME, SIRAH, ...items]);
}

export const sirahHubJsonLd = () => [
    breadcrumbList([HOME, SIRAH]),
    collectionPage(SIRAH_SEO.hub.title, SIRAH_SEO.hub.description, "/sirah", [
        { ...SIRAH_BREADCRUMB.concise, description: "Sejarah dan kepribadian Nabi Muhammad SAW, karya Syaikh Haitsam Sarhan, dibaca per halaman." },
        { ...SIRAH_BREADCRUMB.full, description: "50 bab sirah dari Ar-Rahiq al-Makhtum (terjemahan Indonesia)." },
        { ...SIRAH_BREADCRUMB.history, description: "Peristiwa penting dalam kehidupan Nabi Muhammad SAW secara berurutan, dengan hadits dari HadeethEnc." },
    ]),
];

export const conciseIndexJsonLd = () => [sirahBreadcrumb(SIRAH_BREADCRUMB.concise), book(CONCISE_BOOK_INFO)];
export const fullIndexJsonLd = () => [sirahBreadcrumb(SIRAH_BREADCRUMB.full)];
export const historyIndexJsonLd = () => [sirahBreadcrumb(SIRAH_BREADCRUMB.history)];

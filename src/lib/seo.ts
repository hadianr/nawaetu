import type { Metadata } from "next";

const SITE_URL = "https://nawaetu.com";

/** The shared social card; regenerate it with `npm run og-image`. */
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Nawaetu — Aplikasi Muslim untuk Ibadah Harian",
};

export interface PageLanguages {
  /** Path of the Indonesian version, also used as x-default. */
  id: string;
  /** Path of the English version. */
  en: string;
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options: { locale?: "id" | "en"; languages?: PageLanguages } = {},
): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const languages = options.languages && {
    "id-ID": new URL(options.languages.id, SITE_URL).toString(),
    en: new URL(options.languages.en, SITE_URL).toString(),
    "x-default": new URL(options.languages.id, SITE_URL).toString(),
  };

  return {
    title: `${title} | Nawaetu`,
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      title: `${title} | Nawaetu`,
      description,
      url,
      siteName: "Nawaetu",
      locale: options.locale === "en" ? "en_US" : "id_ID",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Nawaetu`,
      description,
      images: [OG_IMAGE],
    },
  };
}

// Metadata titles follow Nawaetu's honorific style, not the book's glyphs: "Nama-Namanya ﷺ" becomes
// "Nama-Nama Nabi Muhammad SAW", Companions' honorifics become "RA", and other Arabic script is dropped.
// Only titles and descriptions use this; the book text on the page stays as printed.
export function seoTitle(label: string, lang: "id" | "en" = "id"): string {
  if (lang === "en") {
    return label
      .replace(/^His\b\s*(ﷺ\s*)?/, "Prophet Muhammad SAW's ")
      .replace(/\s*ﷺ/g, "")
      .replace(/رضي الله عن(ه|ها|هما|هم)/g, "RA")
      .replace(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+/g, "")
      .replace(/\(\s*\)/g, "")
      .replace(/[.:]\s*(·|$)/g, " $1")
      .replace(/\s+/g, " ")
      .trim();
  }
  return label
    .replace(/(\p{L}+)nya ﷺ/gu, "$1 Nabi Muhammad SAW")
    .replace(/\bNabi ﷺ/g, "Nabi Muhammad SAW")
    .replace(/\s*ﷺ/g, "")
    .replace(/رضي الله عن(ه|ها|هما|هم)/g, "RA")
    .replace(/عليه السلام/g, "AS")
    .replace(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/:\s*(·|$)/g, " $1")
    .replace(/\s+/g, " ")
    .trim();
}

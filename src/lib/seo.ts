import type { Metadata } from "next";

const SITE_URL = "https://nawaetu.com";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title: `${title} | Nawaetu`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Nawaetu`,
      description,
      url,
      siteName: "Nawaetu",
      locale: "id_ID",
      type: "website",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Nawaetu`,
      description,
      images: ["/og-image.png"],
    },
  };
}

// Metadata titles follow Nawaetu's honorific style, not the book's glyphs: "Nama-Namanya ﷺ" becomes
// "Nama-Nama Nabi Muhammad SAW", Companions' honorifics become "RA", and other Arabic script is dropped.
// Only titles and descriptions use this; the book text on the page stays as printed.
export function seoTitle(label: string): string {
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

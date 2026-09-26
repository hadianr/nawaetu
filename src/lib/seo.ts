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

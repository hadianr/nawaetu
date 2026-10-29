const SITE_URL = "https://nawaetu.com";

export function JsonLd({ data }: { data: object }) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function breadcrumbList(items: { name: string; path: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`,
        })),
    };
}

export function article(headline: string, description: string, path: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        inLanguage: "id-ID",
        mainEntityOfPage: `${SITE_URL}${path}`,
        author: { "@type": "Organization", name: "Nawaetu" },
        publisher: { "@type": "Organization", name: "Nawaetu", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512x512.png` } },
    };
}

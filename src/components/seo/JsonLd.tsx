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

export function article(headline: string, description: string, path: string, inLanguage = "id-ID") {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        inLanguage,
        mainEntityOfPage: `${SITE_URL}${path}`,
        author: { "@type": "Organization", name: "Nawaetu" },
        publisher: { "@type": "Organization", name: "Nawaetu", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512x512.png` } },
    };
}

export interface BookInfo {
    name: string;
    alternateName?: string;
    author: string;
    translators: string[];
    inLanguage: string[];
    sameAs: string[];
    path: string;
}

/** A book Nawaetu publishes with permission, crediting its author, translators and original source. */
export function book(info: BookInfo) {
    return {
        "@context": "https://schema.org",
        "@type": "Book",
        name: info.name,
        ...(info.alternateName ? { alternateName: info.alternateName } : {}),
        author: { "@type": "Person", name: info.author },
        translator: info.translators.map((name) => ({ "@type": "Person", name })),
        inLanguage: info.inLanguage,
        sameAs: info.sameAs,
        url: `${SITE_URL}${info.path}`,
        isAccessibleForFree: true,
        publisher: { "@type": "Organization", name: "Nawaetu" },
    };
}

/** One reading page of a book, as a Chapter that is part of it. */
export function chapterPart(name: string, description: string, path: string, bookInfo: BookInfo, position: number, inLanguage = "id-ID") {
    return {
        "@context": "https://schema.org",
        "@type": "Chapter",
        name,
        description,
        position,
        inLanguage,
        url: `${SITE_URL}${path}`,
        isPartOf: { "@type": "Book", name: bookInfo.name, author: { "@type": "Person", name: bookInfo.author }, url: `${SITE_URL}${bookInfo.path}` },
    };
}

/** A hub page that groups other pages, e.g. the three ways to learn the sirah. */
export function collectionPage(name: string, description: string, path: string, parts: { name: string; path: string; description: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name,
        description,
        inLanguage: "id-ID",
        url: `${SITE_URL}${path}`,
        hasPart: parts.map((p) => ({ "@type": "WebPage", name: p.name, description: p.description, url: `${SITE_URL}${p.path}` })),
    };
}

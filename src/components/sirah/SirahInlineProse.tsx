"use client";

/**
 * Nawaetu - Sirah Nabawiyah Inline Prose Renderer
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Parses lightweight inline markdown within a paragraph string and returns
 * styled JSX with unique key generators. Handles nested formats.
 */

import React from "react";

interface Props {
    text: string;
}

/**
 * Parses bold (**text**) and italic (*text*) inside string segments.
 * Uses prefix parameter to guarantee unique keys across parent callers.
 */
function parseFormattedText(text: string, keyPrefix: string): React.ReactNode[] {
    const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let itemIdx = 0;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }

        const raw = match[0];
        const uniqueKey = `${keyPrefix}-fmt-${itemIdx++}`;

        if (raw.startsWith("**")) {
            nodes.push(<strong key={uniqueKey}>{raw.slice(2, -2)}</strong>);
        } else if (raw.startsWith("*")) {
            nodes.push(<em key={uniqueKey}>{raw.slice(1, -1)}</em>);
        }

        lastIndex = match.index + raw.length;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes;
}

/**
 * Parses dialog quotes ("text") and delegates inner text to parseFormattedText
 */
function parseInline(text: string): React.ReactNode[] {
    const quotePattern = /("[^"\n]+")(?=[^"]*($|\s|[.,;:!?]))/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let sectionIdx = 0;

    while ((match = quotePattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const leadingText = text.slice(lastIndex, match.index);
            nodes.push(...parseFormattedText(leadingText, `lead-${sectionIdx}`));
        }

        const rawQuote = match[0];
        const innerContent = parseFormattedText(rawQuote, `quote-inner-${sectionIdx}`);
        const quoteKey = `quote-${sectionIdx++}`;

        nodes.push(
            <em key={quoteKey} className="sirah-quote">
                {innerContent}
            </em>
        );

        lastIndex = match.index + rawQuote.length;
    }

    if (lastIndex < text.length) {
        const trailingText = text.slice(lastIndex);
        nodes.push(...parseFormattedText(trailingText, `trail-${sectionIdx}`));
    }

    return nodes;
}

export function SirahInlineProse({ text }: Props) {
    return <>{parseInline(text)}</>;
}

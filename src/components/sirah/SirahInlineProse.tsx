"use client";

/**
 * Nawaetu - Sirah Nabawiyah Inline Prose Renderer
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Parses lightweight inline markdown within a paragraph string and returns
 * styled JSX. Supported patterns:
 *   **text**  → <strong> (bold)
 *   *text*    → <em> (italic)
 *   "text"    → <em className="sirah-quote"> (dialog/narration)
 */

import React from "react";

interface Props {
    text: string;
}

function parseInline(text: string): React.ReactNode[] {
    // Match **bold**, *italic*, or "quoted dialog" — in that priority order
    const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|"[^"\n]+")/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = pattern.exec(text)) !== null) {
        // Plain text segment before this match
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }

        const raw = match[0];

        if (raw.startsWith("**")) {
            nodes.push(<strong key={key++}>{raw.slice(2, -2)}</strong>);
        } else if (raw.startsWith("*")) {
            nodes.push(<em key={key++}>{raw.slice(1, -1)}</em>);
        } else {
            // Dialog quote — keep the surrounding quotation marks
            nodes.push(
                <em key={key++} className="sirah-quote">
                    {raw}
                </em>
            );
        }

        lastIndex = match.index + raw.length;
    }

    // Remaining plain text after last match
    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes;
}

export function SirahInlineProse({ text }: Props) {
    const nodes = parseInline(text);
    return <>{nodes}</>;
}

/**
 * Nawaetu - Sirah Nabawiyah Content Migration Script
 * Migrates sections.json content field from string to string[] (paragraph array)
 *
 * Run: npx tsx scripts/migrate-sirah-paragraphs.ts
 *
 * Idempotent: safe to re-run on already-migrated data.
 */

import fs from "fs";
import path from "path";

const DATA_PATH = path.resolve("src/data/sirah/sections.json");
const CHUNK_SIZE = 3; // sentences per paragraph

function splitIntoParagraphs(content: string): string[] {
    // Already has paragraph breaks — respect them
    if (content.includes("\n\n")) {
        return content
            .split("\n\n")
            .map((p) => p.trim())
            .filter(Boolean);
    }

    // Split on sentence boundary: end punctuation followed by space + uppercase or quote
    const sentencePattern = /(?<=[.!?])\s+(?=[A-Z"'\u201C\u2018\u00AB])/g;
    const sentences = content
        .split(sentencePattern)
        .map((s) => s.trim())
        .filter(Boolean);

    if (sentences.length <= CHUNK_SIZE) {
        // Short section — keep as single paragraph
        return [content.trim()];
    }

    // Group sentences into chunks
    const paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += CHUNK_SIZE) {
        paragraphs.push(sentences.slice(i, i + CHUNK_SIZE).join(" "));
    }

    return paragraphs;
}

function main() {
    if (!fs.existsSync(DATA_PATH)) {
        console.error(`File not found: ${DATA_PATH}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const sections: any[] = JSON.parse(raw);

    let migrated = 0;
    let skipped = 0;

    const result = sections.map((sec) => {
        if (typeof sec.content === "string") {
            migrated++;
            return { ...sec, content: splitIntoParagraphs(sec.content) };
        }
        // Already an array — idempotent skip
        skipped++;
        return sec;
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(result, null, 2), "utf-8");

    console.log(`✓ Done.`);
    console.log(`  Migrated : ${migrated} sections`);
    console.log(`  Skipped  : ${skipped} (already array)`);
    console.log(`  Total    : ${result.length} sections`);
}

main();

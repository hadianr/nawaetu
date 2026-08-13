/**
 * Nawaetu - Sirah Content Annotation Script
 * Adds lightweight inline markdown (**bold**, *italic*) to sections.json content arrays.
 *
 * Run: npx tsx scripts/annotate-sirah-content.ts
 *
 * Idempotent: already-wrapped patterns are not double-wrapped.
 * Safe to re-run after content updates.
 */

import fs from "fs";
import path from "path";

const DATA_PATH = path.resolve("src/data/sirah/sections.json");

// ─── Bold patterns (proper names, holy places, key honorifics) ────────────────

const BOLD_PATTERNS: RegExp[] = [
    // Honorifics + full forms
    /\b(Rasulullah SAW|Nabi Muhammad SAW|Nabi SAW|Nabi Muhammad)\b/g,
    // Allah
    /\b(Allah SWT|Allah)\b/g,
    // Malaikat
    /\b(Jibril|Mikail|Israfil|Izrail)\b/g,
    // Keluarga Nabi yang sering disebut
    /\b(Abdul Muththalib|Abu Thalib|Aminah|Halimah As-Sa'diyah|Halimah|Khadijah|Fatimah|Ali bin Abi Thalib)\b/g,
    // Sahabat utama
    /\b(Abu Bakar|Umar bin Khattab|Utsman bin Affan|Ali bin Abi Thalib|Hamzah bin Abdul Muththalib|Hamzah)\b/g,
    // Tempat suci dan kota
    /\b(Makkah|Madinah|Ka'bah|Zamzam|Arafah|Mina|Muzdalifah|Masjidil Haram|Masjid Nabawi)\b/g,
    // Peristiwa besar
    /\b(Isra Mi'raj|Hijrah|Badr|Uhud|Khandaq|Hudaibiyah|Fathu Makkah|Fath Makkah)\b/g,
];

// ─── Italic patterns (narrator/riwayat markers) ───────────────────────────────

const ITALIC_PATTERNS: RegExp[] = [
    // Perawi hadith
    /\b(Ibnu Sa'd|Ibnu Hisyam|Ibnu Ishaq|Al-Baihaqi|Imam Muslim|Imam Ahmad|Al-Bukhari|Al-Bukhari dan Muslim|At-Tirmidzi|Abu Dawud|Ibnu Majah|An-Nasa'i)\b/g,
    // Verba riwayat — only at start of clause (after period-space or at string start)
    /(?<=^|\.\s)(Diriwayatkan bahwa|Diriwayatkan)\b/gm,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check if a match position is already inside a **...** or *...* span.
 * Prevents double-wrapping on re-runs.
 */
function isAlreadyWrapped(text: string, matchStart: number, matchEnd: number): boolean {
    // Look behind for an opening marker within reasonable distance
    const before = text.slice(Math.max(0, matchStart - 3), matchStart);
    const after = text.slice(matchEnd, Math.min(text.length, matchEnd + 3));
    return (
        before.includes("**") || before.includes("*") ||
        after.includes("**") || after.includes("*")
    );
}

function applyBold(text: string, pattern: RegExp): string {
    return text.replace(pattern, (match, _g1, offset) => {
        if (isAlreadyWrapped(text, offset, offset + match.length)) return match;
        return `**${match}**`;
    });
}

function applyItalic(text: string, pattern: RegExp): string {
    return text.replace(pattern, (match, _g1, offset) => {
        if (isAlreadyWrapped(text, offset, offset + match.length)) return match;
        return `*${match}*`;
    });
}

function annotateParagraph(paragraph: string): string {
    let result = paragraph;
    for (const pattern of BOLD_PATTERNS) {
        pattern.lastIndex = 0;
        result = applyBold(result, pattern);
    }
    for (const pattern of ITALIC_PATTERNS) {
        pattern.lastIndex = 0;
        result = applyItalic(result, pattern);
    }
    return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
    if (!fs.existsSync(DATA_PATH)) {
        console.error(`File not found: ${DATA_PATH}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const sections: any[] = JSON.parse(raw);

    let totalAnnotations = 0;
    let sectionsModified = 0;

    const result = sections.map((sec) => {
        if (!Array.isArray(sec.content)) return sec;

        const annotated = sec.content.map((p: string) => annotateParagraph(p));

        const changed = annotated.some((p: string, i: number) => p !== sec.content[i]);
        if (changed) {
            sectionsModified++;
            // Count annotation markers added
            const before = sec.content.join("").match(/\*\*/g)?.length ?? 0;
            const after = annotated.join("").match(/\*\*/g)?.length ?? 0;
            totalAnnotations += (after - before) / 2;
        }

        return { ...sec, content: annotated };
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(result, null, 2), "utf-8");

    console.log(`✓ Annotation complete.`);
    console.log(`  Sections modified : ${sectionsModified} / ${result.length}`);
    console.log(`  Bold spans added  : ~${totalAnnotations}`);
}

main();

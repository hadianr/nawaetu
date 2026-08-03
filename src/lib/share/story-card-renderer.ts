/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * High-Performance HTML5 Canvas Story Card Renderer (9:16 Ratio)
 * Features:
 * - Perfectly Centered Content Layout (Mathematical Vertical & Horizontal Alignment)
 * - Optional Arabic Text Display (Can hide Arabic to show translation only)
 * - Consistent Quote Symbol Formatting ("...")
 * - 2 Minimalist Themes: Dark Emerald & Light Ceramic
 * - Nawaetu Signature Islamic Geometric Watermark Pattern (Vector Canvas)
 * - Dynamic Adaptive Layout & Manual Font Size Controls (Normal / Besar / Extra Besar)
 * - Obligatory nawaetu.com Branding Watermark
 * - High-Efficiency WebP Image Compression (~150KB - 250KB)
 */

export type StoryTheme = "dark" | "light";
export type FontSizeScale = "normal" | "large" | "xlarge";

export interface ShareableCardData {
    id: string;
    title: string;
    arabic: string;
    latin?: string;
    translation: string;
    explanation?: string;
    sourceText: string; // e.g. "HR. Bukhari No. 6094 (Sahih)"
}

export interface StoryRenderOptions {
    theme: StoryTheme;
    fontSizeScale?: FontSizeScale;
    showArabic?: boolean;
    showLatin?: boolean;
    showExplanation?: boolean;
}

/**
 * Draws Nawaetu's signature Islamic geometric star/rosette pattern watermark on Canvas
 */
function drawIslamicPattern(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.12;

    const tileSize = 120;
    const cols = Math.ceil(width / tileSize) + 1;
    const rows = Math.ceil(height / tileSize) + 1;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cx = c * tileSize;
            const cy = r * tileSize;
            const radius = tileSize * 0.38;

            ctx.beginPath();
            // Draw 8-point Islamic star rosette
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const outerX = cx + Math.cos(angle) * radius;
                const outerY = cy + Math.sin(angle) * radius;
                const innerAngle = angle + Math.PI / 8;
                const innerX = cx + Math.cos(innerAngle) * (radius * 0.55);
                const innerY = cy + Math.sin(innerAngle) * (radius * 0.55);

                if (i === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.stroke();

            // Inner connecting circle
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    ctx.restore();
}

/**
 * Measures line count for text with word wrapping
 */
function measureWrappedTextLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): number {
    if (!text.trim()) return 0;
    const words = text.split(" ");
    let line = "";
    let count = 0;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            count++;
            line = words[n] + " ";
        } else {
            line = testLine;
        }
    }
    count++;
    return count;
}

/**
 * Renders text with word wrapping and returns drawn total height
 */
function drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: "left" | "center" | "right" = "center"
): number {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + " ";
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());

    ctx.textAlign = align;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, currentY);
        currentY += lineHeight;
    }

    return lines.length * lineHeight;
}

/**
 * Pure Canvas 9:16 High-Performance Exporter
 */
export async function renderStoryCardToCanvas(
    data: ShareableCardData,
    options: StoryRenderOptions
): Promise<HTMLCanvasElement> {
    const W = 1080;
    const H = 1920;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");

    const isDark = options.theme === "dark";
    const showArabic = options.showArabic !== false; // Default true

    // 1. Background Fill with Nawaetu Primary Emerald Green Blend for Dark Mode
    if (isDark) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, "#042017"); // Deep Nawaetu Emerald Dark
        bgGrad.addColorStop(0.5, "#083324"); // Midnight Emerald
        bgGrad.addColorStop(1, "#02120d"); // Deepest Emerald Shadow
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Nawaetu Signature Pattern (Emerald Gold pendar)
        drawIslamicPattern(ctx, W, H, "#34d399");
    } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, "#f8fafc"); // Off-white ceramic
        bgGrad.addColorStop(0.5, "#f1f5f9");
        bgGrad.addColorStop(1, "#e2e8f0");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Nawaetu Signature Pattern (Emerald Green accent)
        drawIslamicPattern(ctx, W, H, "#10b981");
    }

    // 2. Subtle Inner Frame Border
    const padding = 60;
    ctx.strokeStyle = isDark ? "rgba(52, 211, 153, 0.25)" : "rgba(16, 185, 129, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, W - padding * 2, H - padding * 2);

    // 3. Source Pill Badge at Top
    const badgeY = 160;
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    const badgeText = data.sourceText.toUpperCase();
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = textWidth + 60;
    const badgeH = 56;
    const badgeX = (W - badgeW) / 2;

    // Pill background
    ctx.fillStyle = isDark ? "rgba(6, 40, 28, 0.95)" : "rgba(241, 245, 249, 0.95)";
    ctx.strokeStyle = isDark ? "#34d399" : "#10b981";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY - 38, badgeW, badgeH, 28);
    ctx.fill();
    ctx.stroke();

    // Pill text
    ctx.fillStyle = isDark ? "#6ee7b7" : "#047857";
    ctx.fillText(badgeText, W / 2, badgeY);

    // 4. Content Analysis & Dynamic Adaptive Sizing (Enlarged for Maximum Readability)
    const arabicLength = data.arabic.length;
    const transLength = data.translation.length;
    const isShort = (!showArabic || arabicLength < 100) && transLength < 180;

    // Font size scaling multiplier (Enlarged per user preference)
    const scaleMultiplier = options.fontSizeScale === "xlarge" ? 1.58 : options.fontSizeScale === "large" ? 1.38 : 1.15;

    let baseArabicSize = isShort ? 50 : arabicLength > 250 ? 34 : 42;
    let arabicFontSize = Math.round(baseArabicSize * scaleMultiplier);
    let arabicLineHeight = Math.round(arabicFontSize * 2.0);

    let baseTransSize = isShort ? (showArabic ? 32 : 38) : transLength > 300 ? 23 : 28;
    let transFontSize = Math.round(baseTransSize * scaleMultiplier);
    let transLineHeight = Math.round(transFontSize * 1.6);

    let baseLatinSize = isShort ? 26 : 22;
    let latinFontSize = Math.round(baseLatinSize * scaleMultiplier);
    let latinLineHeight = Math.round(latinFontSize * 1.5);

    const contentWidth = W - 200;

    // Consistency: Clean translation string wrapped in uniform quotes ("...")
    const cleanTranslation = data.translation.trim().replace(/^["“'\s]+|["”'\s]+$/g, "");
    const transTextFormatted = `"${cleanTranslation}"`;

    // 5. Pre-Calculation Measurement Pass for Perfect Mathematical Vertical Centering
    let arabicBlockHeight = 0;
    if (showArabic) {
        ctx.font = `${arabicFontSize}px "Amiri", "Traditional Arabic", "Scheherazade New", serif`;
        const arabicLinesCount = measureWrappedTextLines(ctx, data.arabic, contentWidth);
        arabicBlockHeight = arabicLinesCount * arabicLineHeight + (isShort ? 50 : 35);
    }

    let latinBlockHeight = 0;
    if (options.showLatin && data.latin) {
        ctx.font = `italic ${latinFontSize}px Georgia, serif`;
        const latinLines = measureWrappedTextLines(ctx, data.latin, contentWidth);
        latinBlockHeight = latinLines * latinLineHeight + 35;
    }

    ctx.font = `500 ${transFontSize}px sans-serif`;
    const transLinesCount = measureWrappedTextLines(ctx, transTextFormatted, contentWidth);
    const transBlockHeight = transLinesCount * transLineHeight;

    let expBlockHeight = 0;
    if (options.showExplanation && data.explanation) {
        ctx.font = "20px sans-serif";
        const expLines = measureWrappedTextLines(ctx, `💡 ${data.explanation}`, contentWidth - 40);
        expBlockHeight = expLines * 32 + 50;
    }

    const totalContentHeight =
        arabicBlockHeight +
        latinBlockHeight +
        transBlockHeight +
        (expBlockHeight ? expBlockHeight + 40 : 0);

    // Mathematical Centering between Badge (Y=250) and Footer (Y=1770)
    const topBoundary = 250;
    const bottomBoundary = H - 150;
    const availableArea = bottomBoundary - topBoundary;

    let startY = topBoundary + (availableArea - totalContentHeight) / 2;
    if (startY < topBoundary) startY = topBoundary; // Safety limit for long content

    // 6. Optional Quote Accent Icon for Short Content
    if (isShort && options.fontSizeScale !== "xlarge" && startY > 440) {
        ctx.fillStyle = isDark ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.15)";
        ctx.beginPath();
        ctx.arc(W / 2, startY - 80, 44, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 48px serif";
        ctx.fillStyle = isDark ? "#34d399" : "#10b981";
        ctx.textAlign = "center";
        ctx.fillText("“", W / 2, startY - 65);
    }

    let currentY = startY;

    // 7. Render Arabic Calligraphy Text (Optional & Center Alignment)
    if (showArabic) {
        ctx.font = `${arabicFontSize}px "Amiri", "Traditional Arabic", "Scheherazade New", serif`;
        ctx.fillStyle = isDark ? "#6ee7b7" : "#065f46";
        ctx.direction = "rtl";
        const drawnArabicH = drawWrappedText(
            ctx,
            data.arabic,
            W / 2,
            currentY,
            contentWidth,
            arabicLineHeight,
            "center"
        );
        ctx.direction = "ltr";
        currentY += drawnArabicH + (isShort ? 50 : 35);
    }

    // 8. Render Transliteration Text (Center Alignment)
    if (options.showLatin && data.latin) {
        ctx.font = `italic ${latinFontSize}px Georgia, serif`;
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.7)" : "#64748b";
        const drawnLatinH = drawWrappedText(
            ctx,
            data.latin,
            W / 2,
            currentY,
            contentWidth,
            latinLineHeight,
            "center"
        );
        currentY += drawnLatinH + 35;
    }

    // 9. Render Translation Text (Center Alignment with Uniform Quote Marks "")
    ctx.font = `500 ${transFontSize}px sans-serif`;
    ctx.fillStyle = isDark ? "#f8fafc" : "#1e293b";
    const drawnTransH = drawWrappedText(
        ctx,
        transTextFormatted,
        W / 2,
        currentY,
        contentWidth,
        transLineHeight,
        "center"
    );
    currentY += drawnTransH + 40;

    // 10. Render Explanation / Tadabbur Box (Center Alignment)
    if (options.showExplanation && data.explanation && currentY < H - 250) {
        ctx.font = "20px sans-serif";
        const expW = contentWidth;
        const expX = (W - expW) / 2;
        const expY = currentY;

        const expLinesCount = measureWrappedTextLines(ctx, `💡 ${data.explanation}`, expW - 40);
        const expBoxH = expLinesCount * 32 + 40;

        ctx.fillStyle = isDark ? "rgba(6, 40, 28, 0.6)" : "rgba(16, 185, 129, 0.08)";
        ctx.strokeStyle = isDark ? "rgba(52, 211, 153, 0.4)" : "rgba(16, 185, 129, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(expX, expY, expW, expBoxH, 16);
        ctx.fill();
        ctx.stroke();

        // Render Tadabbur text centered inside box
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "#334155";
        drawWrappedText(
            ctx,
            `💡 ${data.explanation}`,
            W / 2,
            expY + 36,
            expW - 40,
            32,
            "center"
        );
    }

    // 11. OBLIGATORY Branding Watermark Footer (nawaetu.com text is ALWAYS rendered in Center Alignment)
    ctx.font = "600 24px monospace";
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(15, 23, 42, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("nawaetu.com", W / 2, H - 100);

    return canvas;
}

/**
 * Converts Canvas to Compressed WebP Blob (~150KB - 250KB) with PNG Fallback
 */
export async function exportStoryCardBlob(
    data: ShareableCardData,
    options: StoryRenderOptions
): Promise<{ blob: Blob; mimeType: string; fileName: string }> {
    const canvas = await renderStoryCardToCanvas(data, options);

    return new Promise((resolve, reject) => {
        // Try WebP compression first for 70-80% smaller size
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve({
                        blob,
                        mimeType: "image/webp",
                        fileName: `nawaetu-story-${data.id}.webp`,
                    });
                } else {
                    // Fallback to PNG if WebP is not supported by browser environment
                    canvas.toBlob(
                        (pngBlob) => {
                            if (pngBlob) {
                                resolve({
                                    blob: pngBlob,
                                    mimeType: "image/png",
                                    fileName: `nawaetu-story-${data.id}.png`,
                                });
                            } else {
                                reject(new Error("Failed to export story card image blob"));
                            }
                        },
                        "image/png"
                    );
                }
            },
            "image/webp",
            0.82 // Compression quality ratio
        );
    });
}

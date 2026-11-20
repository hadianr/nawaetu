// Renders the 1200x630 social card to public/og-image.png with next/og.
// Run with `npm run og-image` after changing the copy or the mark, then commit the PNG.
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import sharp from "sharp";
import { ImageResponse } from "next/og.js";

const WIDTH = 1200;
const HEIGHT = 630;
const C = { paper: "#FAF8F3", ink: "#17211C", text: "#34403A", muted: "#5A665F", emerald: "#158057", gold: "#D6AC56", line: "#E4DFD3" };

// Static TTFs from Google Fonts (OFL); without a browser user agent the CSS API returns truetype URLs.
async function googleFont(family, weight) {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
    if (!url) throw new Error(`No TTF for ${family} ${weight}`);
    return { name: family, weight, style: "normal", data: await (await fetch(url)).arrayBuffer() };
}

const fonts = await Promise.all([googleFont("Lora", 600), googleFont("Plus Jakarta Sans", 400), googleFont("Plus Jakarta Sans", 600)]);
// Crop the master's viewBox to the mark itself (the traced art sits inside a large empty canvas).
const master = await readFile("public/brand/mark.svg", "utf8");
const { info: box } = await sharp(Buffer.from(master)).trim().toBuffer({ resolveWithObject: true });
const cropped = master.replace(/viewBox="[^"]+"/, `viewBox="${-box.trimOffsetLeft} ${-box.trimOffsetTop} ${box.width} ${box.height}"`);
const mark = `data:image/svg+xml;base64,${Buffer.from(cropped).toString("base64")}`;
const MARK_HEIGHT = 330;

const FEATURES = [
    ["Al-Qur’an", "Hadits", "Sirah", "Doa", "Dzikir"],
    ["Jadwal Sholat", "Kiblat", "Kalender Hijriah", "Mentor AI"],
];

const text = (style, children) => h("div", { style: { display: "flex", ...style } }, children);

const card = h(
    "div",
    { style: { width: "100%", height: "100%", display: "flex", background: C.paper, fontFamily: "Plus Jakarta Sans" } },
    h(
        "div",
        { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px 0 88px" } },
        text({ fontFamily: "Lora", fontWeight: 600, fontSize: 96, color: C.ink, letterSpacing: -1.5, lineHeight: 1 }, "Nawaetu"),
        text({ fontWeight: 600, fontSize: 34, color: C.text, marginTop: 24, lineHeight: 1.25 }, "Aplikasi Muslim untuk Ibadah Harian"),
        h("div", { style: { width: 64, height: 3, background: C.gold, marginTop: 40, marginBottom: 32 } }),
        text({ fontSize: 28, color: C.muted, lineHeight: 1.4 }, [
            "Mulai Langkah Baikmu Hari Ini",
            h("span", { key: "sep", style: { margin: "0 14px", color: C.gold } }, "•"),
            h("span", { key: "tag", style: { color: C.emerald, fontWeight: 600 } }, "#NiatAjaDulu"),
        ]),
        h(
            "div",
            { style: { display: "flex", flexDirection: "column", marginTop: 48, fontSize: 23, color: C.muted, lineHeight: 1.6 } },
            FEATURES.map((line) => text({}, line.join("  ·  "))),
        ),
    ),
    h(
        "div",
        { style: { width: 420, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.emerald } },
        h("img", { src: mark, height: MARK_HEIGHT, width: Math.round((MARK_HEIGHT * box.width) / box.height) }),
    ),
);

const png = Buffer.from(await new ImageResponse(card, { width: WIDTH, height: HEIGHT, fonts }).arrayBuffer());
await writeFile("public/og-image.png", await sharp(png).png({ compressionLevel: 9, palette: false }).toBuffer());

const { width, height } = await sharp("public/og-image.png").metadata();
if (width !== WIDTH || height !== HEIGHT) throw new Error(`og-image.png is ${width}x${height}`);
console.log(`Wrote public/og-image.png (${WIDTH}x${HEIGHT})`);

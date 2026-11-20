// Generates every app icon from the one vector master, public/brand/mark.svg.
// Run with `npm run icons` after changing the mark, then commit the outputs.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

const EMERALD = "#158057";
const WHITE = "#FFFFFF";
const RES = "android/app/src/main/res";
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

const master = await readFile("public/brand/mark.svg", "utf8");
const path = master.match(/ d="([^"]+)"/)[1];
const gold = master.match(/fill="(#[0-9A-Fa-f]{6})"/)[1];

// The traced mark sits wherever it was in the source image, so find its real bounds to centre it.
// Rendered at viewBox size, so pixels are viewBox units (sharp trims before any resize in the same pipeline).
const { info } = await sharp(Buffer.from(master)).trim().toBuffer({ resolveWithObject: true });
const box = { x: -info.trimOffsetLeft, y: -info.trimOffsetTop, w: info.width, h: info.height };

/**
 * @param {"tile" | "square" | "none"} background tile = rounded emerald square, square = full bleed (OS applies its own mask)
 * @param {number} markHeight mark height as a share of the canvas
 */
function svg({ background, markHeight, fill = gold }) {
    const k = (markHeight * 1000) / box.h;
    const tx = 500 - (box.x + box.w / 2) * k;
    const ty = 500 - (box.y + box.h / 2) * k;
    const bg = {
        tile: `<rect width="1000" height="1000" rx="225" fill="${EMERALD}"/>`,
        square: `<rect width="1000" height="1000" fill="${EMERALD}"/>`,
        none: "",
    }[background];
    const t = (n) => Number(n.toFixed(3));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${bg}<path transform="translate(${t(tx)} ${t(ty)}) scale(${t(k)})" fill="${fill}" fill-rule="evenodd" d="${path}"/></svg>\n`;
}

const STYLES = {
    tile: { background: "tile", markHeight: 0.6 },
    // Maskable and Android adaptive icons: the mark stays inside the central 80% safe circle.
    safe: { background: "square", markHeight: 0.5 },
    // iOS rounds the corners itself and shows transparency as black.
    apple: { background: "square", markHeight: 0.58 },
    // Notification icons and badges: Android only uses the alpha channel.
    silhouette: { background: "none", markHeight: 0.83, fill: WHITE },
};

const png = (style, size) =>
    sharp(Buffer.from(svg(STYLES[style])), { density: Math.max(72, (72 * size) / 1000) })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer();

// An ICO is a small directory header followed by embedded PNGs; every current browser reads this form.
async function ico(sizes) {
    const images = await Promise.all(sizes.map((size) => png("tile", size)));
    const header = Buffer.alloc(6 + 16 * sizes.length);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(sizes.length, 4);
    let offset = header.length;
    sizes.forEach((size, i) => {
        const entry = 6 + 16 * i;
        header.writeUInt8(size % 256, entry);
        header.writeUInt8(size % 256, entry + 1);
        header.writeUInt16LE(1, entry + 4);
        header.writeUInt16LE(32, entry + 6);
        header.writeUInt32LE(images[i].length, entry + 8);
        header.writeUInt32LE(offset, entry + 12);
        offset += images[i].length;
    });
    return Buffer.concat([header, ...images]);
}

const rasters = [
    ["public/apple-touch-icon.png", "apple", 180],
    ["public/icon-192x192.png", "tile", 192],
    ["public/icon-512x512.png", "tile", 512],
    ["public/icon-maskable-192.png", "safe", 192],
    ["public/icon-maskable-512.png", "safe", 512],
    ["public/badge-96x96.png", "silhouette", 96],
    ...[16, 48, 128, 192, 512].map((size) => [`extension/icons/icon-${size}.png`, "tile", size]),
    ...Object.entries(DENSITIES).flatMap(([density, f]) => [
        [`${RES}/mipmap-${density}/ic_launcher.png`, "tile", 48 * f],
        [`${RES}/mipmap-${density}/ic_maskable.png`, "safe", 82 * f],
        [`${RES}/drawable-${density}/ic_notification_icon.png`, "silhouette", 24 * f],
        [`${RES}/drawable-${density}/splash.png`, "tile", 300 * f],
        ...[0, 1, 2].map((n) => [`${RES}/drawable-${density}/shortcut_${n}.png`, "tile", 48 * f]),
    ]),
];

async function write(file, data) {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, data);
}

await write("public/icon.svg", svg(STYLES.tile));
await write("public/favicon.ico", await ico([16, 32, 48]));
for (const [file, style, size] of rasters) await write(file, await png(style, size));

// Self-check: every raster came out at the size its platform expects.
for (const [file, , size] of rasters) {
    const { width, height } = await sharp(file).metadata();
    if (width !== size || height !== size) throw new Error(`${file} is ${width}x${height}, expected ${size}`);
}
const icoBytes = await readFile("public/favicon.ico");
if (icoBytes.readUInt16LE(4) !== 3) throw new Error("favicon.ico should hold 3 sizes");

console.log(`Generated ${rasters.length + 2} icons from public/brand/mark.svg`);

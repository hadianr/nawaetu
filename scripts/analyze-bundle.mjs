import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const htmlPath = resolve(".next/server/app/index.html");
const html = readFileSync(htmlPath, "utf8");

function assetsFor(extension) {
  return [...new Set([...html.matchAll(new RegExp(`(?:src|href)=\"([^\"]+\\.${extension})\"`, "g"))]
    .map(([, asset]) => asset)
    .filter((asset) => asset.startsWith("/_next/static/")))]
    .map((asset) => {
      const file = resolve(".next", asset.replace("/_next/", ""));
      return { asset, bytes: statSync(file).size };
    })
    .sort((a, b) => b.bytes - a.bytes);
}

for (const [label, assets] of [["Initial JS", assetsFor("js")], ["Initial CSS", assetsFor("css")]]) {
  const total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
  console.log(`\n${label}: ${assets.length} files, ${total} bytes raw`);
  for (const asset of assets) {
    console.log(`${String(asset.bytes).padStart(8)} ${asset.asset}`);
  }
}

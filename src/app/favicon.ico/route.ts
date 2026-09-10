import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const icon = await readFile(path.join(process.cwd(), "public/icon.png"));

  return new Response(icon, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}

// Standalone audit script: `node anti-slop/theme-contrast.mts`
// Built path keeps tsc from resolving a .ts import while Node can still load it.
type Theme = { id: string; mode: string; tokens: Record<string, string> };
const { THEMES } = (await import(new URL("../src/context/themes" + ".ts", import.meta.url).href)) as { THEMES: Record<string, Theme> };
const p = (s: string) => s.split(/\s+/).map(Number);
const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: number[], b: number[]) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const mix = (fg: number[], bg: number[], a: number) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const rows: string[] = [];
for (const t of Object.values(THEMES)) {
  const k = t.tokens as Record<string, string>; const c = (n: string) => p(k[n]);
  const light = t.mode === "light";
  const btnBg = light ? c("primary") : c("primaryStrong");
  const borderA = light ? 1 : 0.16;
  const checks: [string, number[], number[], number][] = [
    ["textStrong/canvas", c("textStrong"), c("canvas"), 4.5],
    ["text/surface", c("text"), c("surface"), 4.5],
    ["textMuted/surface", c("textMuted"), c("surface"), 4.5],
    ["textMuted/surfaceSubtle", c("textMuted"), c("surfaceSubtle"), 4.5],
    ["textMuted/canvas", c("textMuted"), c("canvas"), 4.5],
    ["primaryStrong(text)/surface", c("primaryStrong"), c("surface"), 4.5],
    ["accent(text)/surface", c("accent"), c("surface"), 4.5],
    ["accentStrong(text)/surface", c("accentStrong"), c("surface"), 4.5],
    ["btn fg/bg", c("primaryForeground"), btnBg, 4.5],
    ["accentFg/accent", c("accentForeground"), c("accent"), 4.5],
    ["dangerFg/danger", c("dangerForeground"), c("danger"), 4.5],
    ["danger(text)/surface", c("danger"), c("surface"), 4.5],
    ["warning(text)/surface", c("warning"), c("surface"), 4.5],
    ["success(text)/surface", c("success"), c("surface"), 4.5],
    ["info(text)/surface", c("info"), c("surface"), 4.5],
    ["border/surface (non-text)", mix(c("border"), c("surface"), borderA), c("surface"), 3],
    ["input border/surface (non-text)", mix(c("textMuted"), c("surface"), 0.85), c("surface"), 3],
    ["input border/subtle (non-text)", mix(c("textMuted"), c("surfaceSubtle"), 0.85), c("surfaceSubtle"), 3],
    ["ring/canvas (non-text)", c("ring"), c("canvas"), 3],
  ];
  for (const [n, a, b, min] of checks) { const r = ratio(a, b); rows.push(`${t.id}\t${n}\t${r.toFixed(2)}\t${r >= min ? "PASS" : "FAIL"}(${min})`); }
}
console.log(rows.join("\n"));

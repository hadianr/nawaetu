// Builds public/lottie/hilal.json: a crescent that grows from its outer edge, then a small star.
// Designed in LottieFiles Creator, written here as plain Lottie so it can be rebuilt without a workspace.
// Fills are slots ("primary", "accent") that LottiePlayer recolours from the theme at runtime.
// Run: node scripts/lottie/hilal.mjs
import { writeFileSync } from "node:fs";

const out = new URL("../../public/lottie/hilal.json", import.meta.url);
const FR = 30, OP = 36; // 1.2 s
const primary = [21 / 255, 128 / 255, 87 / 255, 1];
const accent = [184 / 255, 137 / 255, 46 / 255, 1];

// Crescent = circle R minus circle r, as cubic arcs (same geometry as the Creator preview).
const R = 30, C1 = [13, -9], r = 25;
const d = Math.hypot(...C1), ux = C1[0] / d, uy = C1[1] / d;
const a = (R * R - r * r + d * d) / (2 * d), h = Math.sqrt(R * R - a * a);
const P1 = [a * ux - h * uy, a * uy + h * ux], P2 = [a * ux + h * uy, a * uy - h * ux];
const ang = (c, p) => Math.atan2(p[1] - c[1], p[0] - c[0]);
const norm = x => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
const away = Math.atan2(-uy, -ux);

const v = [], ii = [], oo = [];
function arc(c, rad, a0, a1) {
    const n = Math.ceil(Math.abs(a1 - a0) / (Math.PI / 2)), step = (a1 - a0) / n;
    for (let s = 0; s < n; s++) {
        const t0 = a0 + s * step, t1 = t0 + step, k = (4 / 3) * Math.tan(step / 4);
        const p0 = [c[0] + rad * Math.cos(t0), c[1] + rad * Math.sin(t0)];
        const p3 = [c[0] + rad * Math.cos(t1), c[1] + rad * Math.sin(t1)];
        // out-tangent of p0, in-tangent of p3, both relative to their vertex
        if (v.length === 0) { v.push(p0); ii.push([0, 0]); oo.push([0, 0]); }
        oo[oo.length - 1] = [-k * rad * Math.sin(t0), k * rad * Math.cos(t0)];
        v.push(p3); ii.push([k * rad * Math.sin(t1), -k * rad * Math.cos(t1)]); oo.push([0, 0]);
    }
}
const spanThrough = (s, e, through) => {
    let span = norm(e - s);
    return norm(through - s) <= span ? span : span - 2 * Math.PI;
};
const o0 = ang([0, 0], P1);
arc([0, 0], R, o0, o0 + spanThrough(o0, ang([0, 0], P2), away));
const i0 = ang(C1, P2);
arc(C1, r, i0, i0 + spanThrough(i0, ang(C1, P1), away));
// The last vertex equals the first (P1): fold its in-tangent into vertex 0 and drop it.
ii[0] = ii.pop(); v.pop(); oo.pop();
const round = p => p.map(x => Math.round(x * 1000) / 1000);

const ease = { o: { x: [0.33], y: [0] }, i: { x: [0.2], y: [1] } };
const ease3 = { o: { x: [0.33, 0.33, 0.33], y: [0, 0, 0] }, i: { x: [0.2, 0.2, 0.2], y: [1, 1, 1] } };
const still = (k) => ({ a: 0, k });
const tr = { ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100) };
const edge = [Math.cos(away) * R, Math.sin(away) * R].map(x => Math.round(x * 1000) / 1000);
const cx = 44, cy = 50;

const moon = {
    ddd: 0, ind: 2, ty: 4, nm: "primary", sr: 1, ao: 0, ip: 0, op: OP, st: 0, bm: 0,
    ks: {
        o: still(100),
        r: { a: 1, k: [{ t: 0, s: [-28.6], ...ease }, { t: 21, s: [0] }] },
        p: still([cx + edge[0], cy + edge[1], 0]),
        a: still([edge[0], edge[1], 0]),
        s: { a: 1, k: [{ t: 0, s: [0, 0, 100], ...ease3 }, { t: 21, s: [100, 100, 100] }] },
    },
    shapes: [{
        ty: "gr", nm: "crescent", it: [
            { ty: "sh", nm: "path", ks: still({ c: true, v: v.map(round), i: ii.map(round), o: oo.map(round) }) },
            { ty: "fl", nm: "fill", c: { a: 0, k: primary, sid: "primary" }, o: still(100), r: 1 },
            tr,
        ],
    }],
};

const star = {
    ddd: 0, ind: 1, ty: 4, nm: "accent", sr: 1, ao: 0, ip: 0, op: OP, st: 0, bm: 0,
    ks: {
        o: { a: 1, k: [{ t: 0, s: [0], ...ease }, { t: 18, s: [0], ...ease }, { t: 30, s: [100] }] },
        r: still(0),
        p: still([72, 30, 0]),
        a: still([0, 0, 0]),
        s: { a: 1, k: [{ t: 0, s: [40, 40, 100], ...ease3 }, { t: 18, s: [40, 40, 100], ...ease3 }, { t: 33, s: [100, 100, 100] }] },
    },
    shapes: [{
        ty: "gr", nm: "star", it: [
            { ty: "sr", nm: "shape", sy: 1, d: 1, pt: still(5), p: still([0, 0]), r: still(0), ir: still(3.4), is: still(0), or: still(8), os: still(0) },
            { ty: "fl", nm: "fill", c: { a: 0, k: accent, sid: "accent" }, o: still(100), r: 1 },
            tr,
        ],
    }],
};

const json = {
    v: "5.7.0", fr: FR, ip: 0, op: OP, w: 96, h: 96, nm: "hilal", ddd: 0, assets: [],
    layers: [star, moon],
    slots: { primary: { p: still(primary) }, accent: { p: still(accent) } },
};
writeFileSync(out, JSON.stringify(json));
console.log(`hilal.json: ${JSON.stringify(json).length} bytes`);

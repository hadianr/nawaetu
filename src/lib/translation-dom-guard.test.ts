/**
 * @vitest-environment jsdom
 */
import { beforeAll, describe, expect, it } from "vitest";
import { installTranslationDomGuard } from "./translation-dom-guard";

describe("translation DOM guard", () => {
    beforeAll(() => installTranslationDomGuard());

    it("ignores removing a node a translator has already moved", () => {
        const parent = document.createElement("div");
        const text = document.createTextNode("Assalamu'alaikum");
        parent.appendChild(text);
        // What Chrome Translate does: move the text into its own <font> wrapper.
        const font = document.createElement("font");
        parent.replaceChild(font, text);
        font.appendChild(text);

        expect(() => parent.removeChild(text)).not.toThrow();
        expect(font.firstChild).toBe(text);
    });

    it("ignores inserting before a node that is no longer a child", () => {
        const parent = document.createElement("div");
        const moved = document.createElement("span");
        document.createElement("font").appendChild(moved);
        const node = document.createElement("b");

        expect(() => parent.insertBefore(node, moved)).not.toThrow();
        expect(node.parentNode).toBeNull();
    });

    it("keeps normal DOM operations working", () => {
        const parent = document.createElement("div");
        const a = document.createElement("a");
        const b = document.createElement("b");
        parent.appendChild(a);
        expect(parent.insertBefore(b, a)).toBe(b);
        expect(parent.insertBefore(document.createElement("i"), null).parentNode).toBe(parent);
        expect(Array.from(parent.childNodes)).toHaveLength(3);
        expect(parent.removeChild(a)).toBe(a);
        expect(a.parentNode).toBeNull();
    });

    it("installs once", () => {
        const patched = Node.prototype.removeChild;
        installTranslationDomGuard();
        expect(Node.prototype.removeChild).toBe(patched);
    });
});

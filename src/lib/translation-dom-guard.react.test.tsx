/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { installTranslationDomGuard } from "./translation-dom-guard";

// What Chrome Translate does: swap each text node for <font> with translated text.
function translate(root: HTMLElement) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
        const font = document.createElement("font");
        font.textContent = node.nodeValue!.toUpperCase();
        node.parentNode!.replaceChild(font, node);
    }
}

function Greeting({ show, extra }: { show: boolean; extra: boolean }) {
    return <p>{extra && <i>baru</i>}{"Assalamu'alaikum"}{show && " sahabat"}</p>;
}

async function renderTranslatedThenUpdate(): Promise<unknown[]> {
    const errors: unknown[] = [];
    const container = document.createElement("div");
    const root = createRoot(container, { onUncaughtError: (error) => errors.push(error) });
    await act(async () => root.render(<Greeting show extra={false} />));
    translate(container);
    // Removing " sahabat" and inserting <i> before the translated greeting both touch moved text nodes.
    try {
        await act(async () => root.render(<Greeting show={false} extra />));
        await act(async () => root.unmount());
    } catch (error) {
        errors.push(error);
    }
    return errors;
}

describe("translation DOM guard with React", () => {
    it("without the guard, updating a translated page crashes React", async () => {
        const errors = await renderTranslatedThenUpdate();
        const messages = errors
            .flatMap((error) => (error instanceof AggregateError ? error.errors : [error]))
            .map((error) => String(error));
        expect(messages.some((message) => /not a child|can not be found in the parent/i.test(message))).toBe(true);
    });

    it("with the guard, the same update succeeds", async () => {
        installTranslationDomGuard();
        expect(await renderTranslatedThenUpdate()).toEqual([]);
    });
});

/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ locale: "en", pathname: "/sirah" }));
vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ locale: mocks.locale }) }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));

import { SIRAH_CONTENT_LANG_KEY, sirahCounterpartHref, sirahRouteLang, useSirahContentLang } from "./useSirahContentLang";

describe("useSirahContentLang", () => {
    beforeEach(() => {
        localStorage.clear();
        mocks.locale = "en";
        mocks.pathname = "/sirah";
    });

    it("follows the app language until the reader picks one", () => {
        expect(renderHook(() => useSirahContentLang()).result.current[0]).toBe("en");
        mocks.locale = "id";
        expect(renderHook(() => useSirahContentLang()).result.current[0]).toBe("id");
    });

    it("keeps the reader's choice even when the app language differs", () => {
        const { result } = renderHook(() => useSirahContentLang());
        act(() => result.current[1]("id"));
        expect(result.current[0]).toBe("id");
        expect(localStorage.getItem(SIRAH_CONTENT_LANG_KEY)).toBe("id");
        // A second reader on the same page sees the change too.
        expect(renderHook(() => useSirahContentLang()).result.current[0]).toBe("id");
    });

    it("ignores an unknown stored value", () => {
        localStorage.setItem(SIRAH_CONTENT_LANG_KEY, "fr");
        expect(renderHook(() => useSirahContentLang()).result.current[0]).toBe("en");
    });
});

describe("bilingual sirah URLs", () => {
    beforeEach(() => {
        localStorage.clear();
        mocks.locale = "id";
    });

    it("lets the URL decide the language on pages that exist in both", () => {
        localStorage.setItem(SIRAH_CONTENT_LANG_KEY, "id");
        mocks.pathname = "/en/sirah/concise/s03/2";
        expect(renderHook(() => useSirahContentLang()).result.current[0]).toBe("en");
        localStorage.setItem(SIRAH_CONTENT_LANG_KEY, "en");
        mocks.pathname = "/sirah/history/hijrah";
        expect(renderHook(() => useSirahContentLang()).result.current[0]).toBe("id");
    });

    it("knows which pages have a language pair", () => {
        expect(sirahRouteLang("/en/sirah/history")).toBe("en");
        expect(sirahRouteLang("/sirah/concise/s03/1")).toBe("id");
        expect(sirahRouteLang("/sirah")).toBeNull();
        expect(sirahRouteLang("/sirah/full")).toBeNull();
        expect(sirahRouteLang("/en/sirah/conciseX")).toBeNull();
    });

    it("maps a page to the same page in the other language", () => {
        expect(sirahCounterpartHref("/sirah/concise/s03/2", "en")).toBe("/en/sirah/concise/s03/2");
        expect(sirahCounterpartHref("/en/sirah/history/hijrah", "id")).toBe("/sirah/history/hijrah");
        expect(sirahCounterpartHref("/en/sirah/history", "en")).toBe("/en/sirah/history");
        expect(sirahCounterpartHref("/sirah", "en")).toBeNull();
    });
});


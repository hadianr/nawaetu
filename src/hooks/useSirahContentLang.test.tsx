/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ locale: "en" }));
vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ locale: mocks.locale }) }));

import { SIRAH_CONTENT_LANG_KEY, useSirahContentLang } from "./useSirahContentLang";

describe("useSirahContentLang", () => {
    beforeEach(() => {
        localStorage.clear();
        mocks.locale = "en";
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

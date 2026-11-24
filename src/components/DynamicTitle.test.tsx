/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import DynamicTitle from "./DynamicTitle";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/context/LocaleContext", () => ({ useTranslations: () => ({ intention_journal_title: "Jurnal Niat", aboutTagline: "Tagline" }) }));

describe("DynamicTitle", () => {
    afterEach(cleanup);

    it("keeps the server title on pages it does not map", () => {
        document.title = "Misi Harian | Nawaetu";
        pathname = "/missions";
        render(<DynamicTitle />);
        expect(document.title).toBe("Misi Harian | Nawaetu");
    });

    it("sets a title on client pages without their own metadata", () => {
        pathname = "/journal";
        render(<DynamicTitle />);
        expect(document.title).toBe("Jurnal Niat - Nawaetu");
    });
});

// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoryShareModal } from "./StoryShareModal";
import { BASE_SETTINGS_EN } from "@/data/translations/base";

const { mockRender, mockGetOptional } = vi.hoisted(() => ({ mockRender: vi.fn(), mockGetOptional: vi.fn() }));

vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/core/infrastructure/storage", () => ({ getStorageService: () => ({ getOptional: mockGetOptional }) }));
vi.mock("@/lib/share/story-card-renderer", () => ({
    renderStoryCardToCanvas: mockRender.mockImplementation(async () => document.createElement("canvas")),
    exportStoryCardBlob: vi.fn(),
}));

const item = { id: "x", title: "Bukhari No. 6465", arabic: "أَحَبُّ", translation: "The most beloved deeds", sourceText: "Bukhari No. 6465" };
const lastOptions = () => mockRender.mock.calls.at(-1)![1];

describe("StoryShareModal theme swatches", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetOptional.mockReturnValue(null);
    });

    it("offers every app theme and starts on the active one", async () => {
        mockGetOptional.mockReturnValue("ocean");
        render(<StoryShareModal item={item} onClose={vi.fn()} />);
        const group = screen.getByRole("radiogroup", { name: "Card theme" });
        expect(group.querySelectorAll("[role=radio]")).toHaveLength(8);
        expect(screen.getByRole("radio", { name: "Ocean" }).getAttribute("aria-checked")).toBe("true");
        await waitFor(() => expect(mockRender).toHaveBeenCalled());
        expect(lastOptions().palette.mode).toBe("dark");
    });

    it("falls back to the default theme when none is saved or the saved one is unknown", () => {
        mockGetOptional.mockReturnValue("not-a-theme");
        render(<StoryShareModal item={item} onClose={vi.fn()} />);
        expect(screen.getByRole("radio", { name: "Default" }).getAttribute("aria-checked")).toBe("true");
    });

    it("redraws the card in the chosen theme", async () => {
        render(<StoryShareModal item={item} onClose={vi.fn()} />);
        fireEvent.click(screen.getByRole("radio", { name: "Daylight" }));
        expect(screen.getByRole("radio", { name: "Daylight" }).getAttribute("aria-checked")).toBe("true");
        expect(screen.getByRole("radio", { name: "Default" }).getAttribute("aria-checked")).toBe("false");
        await waitFor(() => expect(lastOptions().palette.mode).toBe("light"));
        expect(lastOptions().theme).toBe("light");
    });
});

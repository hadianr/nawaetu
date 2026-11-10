// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DalilBadge from "./DalilBadge";
import { BASE_SETTINGS_EN } from "@/data/translations/base";
import type { EvidenceData } from "@/data/ramadhan";

const { toastSuccess, toastError } = vi.hoisted(() => ({ toastSuccess: vi.fn(), toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));
vi.mock("@/components/StoryShareModal", () => ({
    StoryShareModal: ({ item, onClose }: { item: { title: string; arabic: string; sourceText: string }; onClose: () => void }) => (
        <div data-testid="story">
            <span>{item.title}|{item.arabic}|{item.sourceText}</span>
            <button type="button" onClick={onClose}>close story</button>
        </div>
    ),
}));
vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));

const hadith: EvidenceData = {
    id: "h1",
    shortRef: "HR. Bukhari No. 6465",
    shortRef_en: "Bukhari No. 6465",
    arabic: "أَحَبُّ الأَعْمَالِ",
    latin: "Ahabbul-a'maali",
    translation: "Terjemahan",
    translation_en: "The most beloved deeds are the consistent ones.",
    source: "HR. Bukhari No. 6465 — Aisyah RA",
    source_en: "Bukhari No. 6465 — Aisha RA",
};
const verse: EvidenceData = { ...hadith, id: "q1", shortRef: "QS. Al-Baqarah: 183", shortRef_en: "Quran 2:183" };

const open = (dalil: EvidenceData) => {
    render(<DalilBadge dalil={dalil} variant="link" />);
    fireEvent.click(screen.getByRole("button", { name: /Bukhari No\. 6465|Quran 2:183/ }));
};

describe("DalilBadge dialog", () => {
    beforeEach(() => vi.clearAllMocks());

    it("shows the reference, kind, Arabic, latin, translation and source in one compact card", () => {
        open(hadith);
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Bukhari No. 6465" })).toBeTruthy();
        expect(screen.getByText("Hadith")).toBeTruthy();
        expect(screen.getByText("أَحَبُّ الأَعْمَالِ").getAttribute("dir")).toBe("rtl");
        expect(screen.getByText(/Ahabbul-a'maali/)).toBeTruthy();
        expect(screen.getByText(/The most beloved deeds are the consistent ones/)).toBeTruthy();
        expect(screen.getByText("Bukhari No. 6465 — Aisha RA")).toBeTruthy();
    });

    it("labels a Quran reference as Quran", () => {
        open(verse);
        expect(screen.getByText("Quran", { selector: "p" })).toBeTruthy();
    });

    it("uses theme tokens only: no fixed text shadows", () => {
        open(hadith);
        expect(screen.getByRole("dialog").innerHTML).not.toContain("text-shadow");
    });

    it("copies the text and says so", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        open(hadith);
        fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Copied"));
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining("The most beloved deeds"));
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Bukhari No. 6465 — Aisha RA"));
    });

    it("says so when copying is blocked", async () => {
        Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("no")) } });
        open(hadith);
        fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        await waitFor(() => expect(toastError).toHaveBeenCalledWith("Couldn't copy"));
    });

    it("shares as a story: closes the dalil dialog, opens the story card with this dalil, and returns after", async () => {
        open(hadith);
        fireEvent.click(screen.getByRole("button", { name: "Share as story" }));
        const story = await screen.findByTestId("story");
        expect(story.textContent).toContain("Bukhari No. 6465|أَحَبُّ الأَعْمَالِ|Bukhari No. 6465 — Aisha RA");
        expect(screen.queryByRole("dialog")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "close story" }));
        expect(screen.queryByTestId("story")).toBeNull();
        expect(screen.getByRole("dialog")).toBeTruthy();
    });

    it("does not offer story sharing for a dalil without Arabic text", () => {
        open({ ...hadith, arabic: undefined });
        expect(screen.queryByRole("button", { name: "Share as story" })).toBeNull();
        expect(screen.getByRole("button", { name: "Copy" })).toBeTruthy();
    });

    it("has a labelled close button", () => {
        open(hadith);
        expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    });
});

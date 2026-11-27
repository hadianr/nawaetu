// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StageCard } from "./StageCard";
import { BASE_SETTINGS_EN } from "@/data/translations/base";
import type { TranslationTree } from "@/context/LocaleContext";

// The test only needs the stats keys, which the base English set has.
const t = BASE_SETTINGS_EN as unknown as TranslationTree;
const j = t.stats.journey;

describe("StageCard", () => {
    it("shows the stage, the focus as a suggestion, and the next stage", () => {
        render(<StageCard t={t} stats={{ level: 7, hasanah: 2287, nextLevelHasanah: 2800, progress: 26 }} />);
        expect(screen.getByRole("heading", { name: t.stats.stages.onTime.name })).toBeTruthy();
        expect(screen.getByText("Stage 3 of 7")).toBeTruthy();
        expect(screen.getByText(t.stats.stages.onTime.focus)).toBeTruthy();
        expect(screen.getByText("513 Hasanah to Level 8")).toBeTruthy();
        expect(screen.getByText(`Next: ${t.stats.stages.add.name} at Level 10`)).toBeTruthy();
    });

    it("explains levels, marks the current stage, and says Hasanah is not reward", () => {
        render(<StageCard t={t} stats={{ level: 1, hasanah: 40, nextLevelHasanah: 100, progress: 40 }} />);
        fireEvent.click(screen.getByRole("button", { name: j.howItWorks }));
        const current = screen.getByText(j.youAreHere).closest("li");
        expect(current?.getAttribute("aria-current")).toBe("step");
        expect(current?.textContent).toContain(t.stats.stages.start.name);
        expect(screen.getByText(j.disclaimer)).toBeTruthy();
    });

    it("says the last stage has no next one", () => {
        render(<StageCard t={t} stats={{ level: 45, hasanah: 50000, nextLevelHasanah: 50500, progress: 0 }} />);
        expect(screen.getByText(j.lastStage)).toBeTruthy();
    });
});

import { describe, expect, it } from "vitest";
import { seoTitle } from "./seo";

describe("seoTitle", () => {
    it("names the Prophet in full instead of a pronoun with the ligature", () => {
        expect(seoTitle("Nama-Namanya ﷺ")).toBe("Nama-Nama Nabi Muhammad SAW");
        expect(seoTitle("Tuntunannya ﷺ Dalam Berjalan")).toBe("Tuntunan Nabi Muhammad SAW Dalam Berjalan");
        expect(seoTitle("Karakter dan Kepribadian Rasulullah ﷺ")).toBe("Karakter dan Kepribadian Rasulullah");
        expect(seoTitle("Gangguan Kaum Musyrikin Kepada Nabi ﷺ Dan Para Sahabatnya")).toBe("Gangguan Kaum Musyrikin Kepada Nabi Muhammad SAW Dan Para Sahabatnya");
    });

    it("writes Companions' honorifics as RA and drops other Arabic script", () => {
        expect(seoTitle("Khadijah رضي الله عنها")).toBe("Khadijah RA");
        expect(seoTitle("Nama-Nama Istrinya ﷺ Terkumpul Pada Kalimat: (حَجَزَ صَخْرٌ سَمْعَهُ)")).toBe("Nama-Nama Istri Nabi Muhammad SAW Terkumpul Pada Kalimat");
        expect(seoTitle("Sakit Dan Wafatnya ﷺ · Penutup:")).toBe("Sakit Dan Wafat Nabi Muhammad SAW · Penutup");
    });
});

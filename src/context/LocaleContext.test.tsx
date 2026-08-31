/**
 * @vitest-environment jsdom
 */
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { LocaleProvider } from "@/context/LocaleContext";

describe("LocaleProvider document language", () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.lang = "id";
    });

    it("synchronizes html lang with the saved locale", async () => {
        window.localStorage.setItem("settings_locale", "en");

        render(<LocaleProvider><main>Home</main></LocaleProvider>);

        await waitFor(() => expect(document.documentElement.lang).toBe("en"));
    });
});

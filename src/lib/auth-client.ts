"use client";

import { signIn } from "next-auth/react";
import { toast } from "sonner";

export async function signInWithGoogle(): Promise<void> {
    try {
        await signIn("google");
    } catch {
        // Not a component, so no locale hook: LocaleContext keeps <html lang> in step with the app language.
        toast.error(document.documentElement.lang === "id"
            ? "Tidak bisa memulai login Google. Periksa koneksi lalu coba lagi."
            : "Unable to start Google sign-in. Check your connection and try again.");
    }
}

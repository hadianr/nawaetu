"use client";

import { signIn } from "next-auth/react";
import { toast } from "sonner";

export async function signInWithGoogle(): Promise<void> {
    try {
        await signIn("google");
    } catch {
        toast.error("Unable to start Google sign-in. Check your connection and try again.");
    }
}

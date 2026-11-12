"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Flame } from "lucide-react";
import { getTranslationText, useLocale, type TranslationTree } from "@/context/LocaleContext";
import { useStreak } from "@/hooks/useStreak";
import { sendGAEvent } from "@/lib/analytics/analytics";
import { signInWithGoogle } from "@/lib/auth-client";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { afterDismissed, afterShown, pickNudge, readNudgeState, writeNudgeState, type NudgeId } from "@/lib/login-nudge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LottieMoment from "@/components/ui/LottieMoment";

/** Wait this long after the screen settles, so the invitation never competes with what the user came to do. */
const SHOW_DELAY_MS = 4000;
/** If something else is in the way, look again after this long, a few times, then leave it for the next visit. */
const RETRY_DELAY_MS = 5000;
const MAX_ATTEMPTS = 5;

const COPY: Record<NudgeId, { title: string; desc: string }> = {
    streak7: { title: "loginNudgeStreak7Title", desc: "loginNudgeStreak7Desc" },
    streak14: { title: "loginNudgeStreak14Title", desc: "loginNudgeStreak14Desc" },
    streak30: { title: "loginNudgeStreak30Title", desc: "loginNudgeStreak30Desc" },
};

/**
 * Invites a guest to sign in when they have something worth protecting. The rules (what, when, how often) are in
 * `lib/login-nudge.ts`; this only decides that the moment is calm enough and shows it.
 */
export default function LoginNudge() {
    const { t } = useLocale();
    const translations = t as TranslationTree;
    const { status } = useSession();
    const { streak } = useStreak();
    const [shownId, setShownId] = useState<NudgeId | null>(null);
    const streakDays = streak.currentStreak;

    useEffect(() => {
        if (status !== "unauthenticated" || shownId) return;
        let timer: number | undefined;
        let attempts = 0;

        const attempt = () => {
            attempts++;
            // Not while the app is in the background or another dialog is open. Try again shortly instead of waiting
            // for the next visit: a dialog that is closing, or one the user dismisses a moment later, should not cost
            // the invitation. It still never stacks on top of anything.
            if (document.visibilityState !== "visible" || document.querySelector('[role="dialog"]')) {
                if (attempts < MAX_ATTEMPTS) timer = window.setTimeout(attempt, RETRY_DELAY_MS);
                return;
            }
            // Not during onboarding: the next visit is the right time.
            if (localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === null) return;
            const now = Date.now();
            const state = readNudgeState();
            const pick = pickNudge({ streakDays }, state, now);
            if (!pick) return;
            writeNudgeState(afterShown(state, pick, now));
            sendGAEvent("login_prompt_shown", { trigger: pick });
            setShownId(pick);
        };

        timer = window.setTimeout(attempt, SHOW_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [status, streakDays, shownId]);

    if (!shownId) return null;
    const copy = COPY[shownId];

    const dismiss = () => {
        writeNudgeState(afterDismissed(readNudgeState(), Date.now()));
        sendGAEvent("login_prompt_dismissed", { trigger: shownId });
        setShownId(null);
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) dismiss(); }}>
            <DialogContent className="max-w-sm text-center">
                <LottieMoment
                    src="/lottie/flame.lottie"
                    loop
                    quietLoad
                    className="mx-auto h-28 w-28"
                    fallback={<Flame className="h-12 w-12 text-orange-400" />}
                />
                <DialogHeader className="items-center text-center sm:text-center">
                    <DialogTitle>{getTranslationText(translations, copy.title)}</DialogTitle>
                    <DialogDescription>{getTranslationText(translations, copy.desc)}</DialogDescription>
                </DialogHeader>
                <Button
                    className="w-full"
                    onClick={() => {
                        sendGAEvent("login_prompt_clicked", { trigger: shownId });
                        void signInWithGoogle();
                    }}
                >
                    {getTranslationText(translations, "loginNudgeCta")}
                </Button>
                <Button variant="ghost" className="w-full" onClick={dismiss}>
                    {getTranslationText(translations, "loginNudgeLater")}
                </Button>
                <p className="text-xs text-[rgb(var(--color-text-muted))]">{getTranslationText(translations, "loginNudgeNote")}</p>
            </DialogContent>
        </Dialog>
    );
}

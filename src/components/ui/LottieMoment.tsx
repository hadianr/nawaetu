"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";

// The player and its WASM only download when a moment is actually shown.
const LottiePlayer = dynamic(() => import("@/components/ui/LottiePlayer"), { ssr: false });

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

interface LottieMomentProps {
    /** Path under /public, e.g. "/lottie/lights.lottie". */
    src: string;
    /** Size/shape classes for the box the animation fills. */
    className?: string;
    loop?: boolean;
    /** Remove the animation once it has played, instead of holding its last frame. */
    hideOnComplete?: boolean;
    /** Shown instead of the animation when the user prefers reduced motion. */
    fallback?: ReactNode;
}

/** Decorative animation: hidden from assistive tech, so pair it with real text. */
export default function LottieMoment({ src, className, loop = false, hideOnComplete = false, fallback = null }: LottieMomentProps) {
    const [finished, setFinished] = useState(false);
    const reduced = useSyncExternalStore(
        subscribe,
        () => window.matchMedia(REDUCED_MOTION).matches,
        () => true,
    );

    return (
        <div className={className} aria-hidden="true">
            {reduced
                ? fallback
                : !finished && <LottiePlayer src={src} loop={loop} onComplete={hideOnComplete ? () => setFinished(true) : undefined} />}
        </div>
    );
}

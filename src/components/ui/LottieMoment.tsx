"use client";

import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// The player and its WASM only download when a moment is actually shown.
const LottiePlayer = dynamic(() => import("@/components/ui/LottiePlayer"), { ssr: false });

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

/** The player is decoration: if its chunk or WASM fails to load, keep the static fallback instead of crashing the screen. */
class PlayerBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch() {
        this.props.onError();
    }
    render() {
        return this.state.failed ? null : this.props.children;
    }
}

interface LottieMomentProps {
    /** Path under /public, e.g. "/lottie/lights.lottie". */
    src: string;
    /** Size/shape classes for the box the animation fills. Give it a fixed size so nothing shifts when the player arrives. */
    className?: string;
    loop?: boolean;
    /** Remove the animation once it has played, instead of holding its last frame. */
    hideOnComplete?: boolean;
    /** Stand-in shown while the player loads, if it fails, or when the user prefers reduced motion. */
    fallback?: ReactNode;
    /** Called once, when the animation actually starts moving. */
    onPlay?: () => void;
    /** Keep the box empty until the animation is ready, then fade it in. The fallback only shows if the animation cannot play. */
    quietLoad?: boolean;
    /** Recolour the file's colour slots from theme variables, e.g. { primary: "--color-primary" }. */
    colorSlots?: Record<string, string>;
}

/** Decorative animation: hidden from assistive tech, so pair it with real text. */
export default function LottieMoment({ src, className, loop = false, hideOnComplete = false, fallback = null, onPlay, quietLoad = false, colorSlots }: LottieMomentProps) {
    const [armed, setArmed] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [failed, setFailed] = useState(false);
    const [finished, setFinished] = useState(false);
    const reduced = useSyncExternalStore(
        subscribe,
        () => window.matchMedia(REDUCED_MOTION).matches,
        () => true,
    );

    // Start the player download after first paint so its WASM never delays the screen itself (#299).
    useEffect(() => {
        let idle = 0;
        // The next animation frame runs once this screen has been painted; then wait for the browser to be idle.
        const frame = window.requestAnimationFrame(() => {
            idle = typeof window.requestIdleCallback === "function"
                ? window.requestIdleCallback(() => setArmed(true), { timeout: 2000 })
                : window.setTimeout(() => setArmed(true), 0);
        });
        return () => {
            window.cancelAnimationFrame(frame);
            if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
            else window.clearTimeout(idle);
        };
    }, []);

    const handlePlay = () => {
        if (playing) return;
        setPlaying(true);
        onPlay?.();
    };

    // No motion wanted or possible: the fallback is the design, laid out in normal flow.
    if (reduced || failed) return <div className={className} aria-hidden="true">{fallback}</div>;

    return (
        <div className={className} aria-hidden="true">
            <div className="relative h-full w-full">
                {fallback && !quietLoad && (
                    <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300", playing && "opacity-0")}>
                        {fallback}
                    </div>
                )}
                {armed && !finished && (
                    <div className={cn("h-full w-full", quietLoad && "transition-opacity duration-300", quietLoad && !playing && "opacity-0")}>
                        <PlayerBoundary onError={() => setFailed(true)}>
                            <LottiePlayer
                                src={src}
                                loop={loop}
                                colorSlots={colorSlots}
                                onPlay={handlePlay}
                                onError={() => setFailed(true)}
                                onComplete={hideOnComplete ? () => setFinished(true) : undefined}
                            />
                        </PlayerBoundary>
                    </div>
                )}
            </div>
        </div>
    );
}

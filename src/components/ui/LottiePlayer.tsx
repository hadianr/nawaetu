"use client";

import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

// Bundle the player's WASM ourselves: the default public CDN is blocked by our CSP and fails offline.
setWasmUrl(new URL("../../../node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm", import.meta.url).toString());
// Fetch and compile the WASM now, not when the first player mounts. A failure here surfaces again on that player, which falls back.
DotLottie.preload().catch(() => {});

interface LottiePlayerProps {
    src: string;
    loop: boolean;
    onPlay?: () => void;
    onComplete?: () => void;
    onError?: () => void;
    /** Slot id -> theme CSS variable holding "r g b", e.g. { primary: "--color-primary" }. The file must define those slots. */
    colorSlots?: Record<string, string>;
}

function applyColorSlots(player: { setColorSlot: (id: string, value: [number, number, number, number]) => unknown }, slots: Record<string, string>) {
    const style = getComputedStyle(document.documentElement);
    for (const [slot, variable] of Object.entries(slots)) {
        const rgb = style.getPropertyValue(variable).trim().split(/\s+/).map(Number);
        if (rgb.length === 3 && rgb.every(Number.isFinite)) player.setColorSlot(slot, [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1]);
    }
}

// The player already freezes itself while its canvas is off-screen (freezeOnOffscreen defaults to true).
export default function LottiePlayer({ src, loop, onPlay, onComplete, onError, colorSlots }: LottiePlayerProps) {
    return (
        <DotLottieReact
            src={src}
            loop={loop}
            autoplay
            dotLottieRefCallback={player => {
                if (!player) return;
                if (colorSlots) player.addEventListener("load", () => applyColorSlots(player, colorSlots));
                if (onPlay) player.addEventListener("play", onPlay);
                if (onComplete) player.addEventListener("complete", onComplete);
                if (onError) {
                    player.addEventListener("loadError", onError);
                    player.addEventListener("renderError", onError);
                }
            }}
        />
    );
}

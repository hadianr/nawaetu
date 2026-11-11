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
}

// The player already freezes itself while its canvas is off-screen (freezeOnOffscreen defaults to true).
export default function LottiePlayer({ src, loop, onPlay, onComplete, onError }: LottiePlayerProps) {
    return (
        <DotLottieReact
            src={src}
            loop={loop}
            autoplay
            dotLottieRefCallback={player => {
                if (!player) return;
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

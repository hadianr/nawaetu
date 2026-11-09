"use client";

import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";

// Bundle the player's WASM ourselves: the default public CDN is blocked by our CSP and fails offline.
setWasmUrl(new URL("../../../node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm", import.meta.url).toString());

interface LottiePlayerProps {
    src: string;
    loop: boolean;
    onComplete?: () => void;
}

export default function LottiePlayer({ src, loop, onComplete }: LottiePlayerProps) {
    return (
        <DotLottieReact
            src={src}
            loop={loop}
            autoplay
            dotLottieRefCallback={onComplete ? player => player?.addEventListener("complete", onComplete) : undefined}
        />
    );
}

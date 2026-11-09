"use client";

import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";

// Bundle the player's WASM ourselves: the default public CDN is blocked by our CSP and fails offline.
setWasmUrl(new URL("../../../node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm", import.meta.url).toString());

export default function LottiePlayer({ src, loop }: { src: string; loop: boolean }) {
    return <DotLottieReact src={src} loop={loop} autoplay />;
}

"use client";

import { useEffect } from "react";

/**
 * iOS WebKit can keep the pre-rotation layout (content off-centre, fixed layers short) until
 * something forces a reflow. Toggling display on <html> does that, right away and again once
 * iOS has settled on the new size.
 */
export function reflow() {
    const root = document.documentElement;
    root.style.display = "none";
    void root.offsetHeight;
    root.style.display = "";
}

export default function OrientationReflow() {
    useEffect(() => {
        const timers: number[] = [];
        const onRotate = () => {
            reflow();
            timers.push(window.setTimeout(reflow, 350));
        };
        const query = window.matchMedia("(orientation: portrait)");
        query.addEventListener("change", onRotate);
        window.addEventListener("orientationchange", onRotate);
        return () => {
            query.removeEventListener("change", onRotate);
            window.removeEventListener("orientationchange", onRotate);
            timers.forEach(window.clearTimeout);
        };
    }, []);

    return null;
}

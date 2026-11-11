/** Light touch feedback. Android only (iOS Safari has no vibrate), so it must never be the only signal. */
export function haptic(pattern: number | number[] = 10): void {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(pattern);
}

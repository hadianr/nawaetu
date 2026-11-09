"use client";

import { motion, useReducedMotion } from "framer-motion";

/** A check mark that draws itself once; static when the user prefers reduced motion. */
export default function AnimatedCheck({ className }: { className?: string }) {
    const reduced = useReducedMotion();
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
            />
        </svg>
    );
}

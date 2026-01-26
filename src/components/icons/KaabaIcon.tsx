import React from "react";

export function KaabaIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="2" y="5" width="20" height="16" rx="2" fill="currentColor" />
            <path d="M2 9H22" stroke="#FBBF24" strokeWidth="2" />
            <path d="M8 5V21" stroke="#FBBF24" strokeWidth="0.5" strokeOpacity="0.3" />
            <path d="M16 5V21" stroke="#FBBF24" strokeWidth="0.5" strokeOpacity="0.3" />
            <rect x="14" y="11" width="4" height="6" rx="1" fill="#FBBF24" fillOpacity="0.8" />
        </svg>
    );
}

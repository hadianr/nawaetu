"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Reads ?id / ?highlight in its own Suspense island, so the rest of the page
 * can render on the server instead of bailing out to client-only rendering.
 */
export default function TargetIdReader({ onChange }: { onChange: (id: string) => void }) {
    const searchParams = useSearchParams();
    const id = searchParams?.get("id") || searchParams?.get("highlight") || "";

    useEffect(() => {
        onChange(id);
    }, [id, onChange]);

    return null;
}

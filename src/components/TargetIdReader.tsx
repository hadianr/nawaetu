"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Reads ?id / ?highlight (or the named parameter) in its own Suspense island, so the rest of the page
 * can render on the server instead of bailing out to client-only rendering.
 */
export default function TargetIdReader({ onChange, param }: { onChange: (id: string) => void; param?: string }) {
    const searchParams = useSearchParams();
    const id = (param ? searchParams?.get(param) : searchParams?.get("id") || searchParams?.get("highlight")) || "";

    useEffect(() => {
        onChange(id);
    }, [id, onChange]);

    return null;
}

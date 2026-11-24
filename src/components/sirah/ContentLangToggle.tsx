"use client";

/**
 * Nawaetu - picks the reading language for sirah/history text
 * Copyright (C) 2026 Hadian Rahmat
 */

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { sirahCounterpartHref, useSirahContentLang, type SirahContentLang } from "@/hooks/useSirahContentLang";

const OPTIONS: { value: SirahContentLang; short: string; name: string }[] = [
    { value: "id", short: "ID", name: "Bahasa Indonesia" },
    { value: "en", short: "EN", name: "English" },
];

export function ContentLangToggle({ className, hideLabel }: { className?: string; hideLabel?: boolean }) {
    const { t } = useLocale();
    const [lang, setLang] = useSirahContentLang();
    const pathname = usePathname();
    const router = useRouter();
    const choose = (next: SirahContentLang) => {
        setLang(next);
        // On a page that exists in both languages, open its URL in the chosen language.
        const href = sirahCounterpartHref(pathname, next);
        if (href && href !== pathname) router.push(href);
    };

    return (
        <div role="group" aria-label={t.sirahContentLangLabel} className={cn("inline-flex items-center gap-2", className)}>
            {!hideLabel && <span className="text-xs font-semibold text-[rgb(var(--color-text-muted))]" aria-hidden>{t.sirahContentLangLabel}</span>}
            <span className="inline-flex rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] p-0.5 shadow-[var(--shadow-card)]">
                {OPTIONS.map((o) => {
                    const active = lang === o.value;
                    return (
                        <button
                            key={o.value}
                            type="button"
                            aria-pressed={active}
                            title={o.name}
                            onClick={() => choose(o.value)}
                            className={cn(
                                "min-h-9 min-w-11 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                active
                                    ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]"
                                    : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"
                            )}
                        >
                            {o.short}
                            {/* Visible code first so voice users can say what they see. */}
                            <span className="sr-only"> {o.name}</span>
                        </button>
                    );
                })}
            </span>
        </div>
    );
}

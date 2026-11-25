"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "@/components/ui/icons";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

/** 17 Ramadan: shown as a commemoration, separating what is certain from what scholars dispute (plan §3.4). */
export default function NuzululQuranNote({ className }: { className?: string }) {
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const parts = [
        [t.hijriNuzululCertainLabel, t.hijriNuzululCertain],
        [t.hijriNuzululDisputedLabel, t.hijriNuzululDisputed],
        [t.hijriNuzululPracticeLabel, t.hijriNuzululPractice],
    ];

    return (
        <div className={cn("rounded-2xl bg-[rgb(var(--color-surface-subtle))] p-3", className)}>
            <p className="text-xs font-bold text-[rgb(var(--color-primary-strong))]">17 Ramadan · {t.hijriNuzululLabel}</p>
            <p className="mt-0.5 text-sm font-semibold">{t.hijriNuzululTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">{t.hijriNuzululShort}</p>
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(value => !value)}
                className="mt-2 flex min-h-11 items-center gap-1 text-xs font-semibold text-[rgb(var(--color-primary-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
            >
                {t.hijriNuzululWhy}
                <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
                <div id={panelId} className="space-y-2 text-xs leading-relaxed">
                    {parts.map(([label, body]) => (
                        <p key={String(label)}>
                            <strong className="font-semibold">{label}: </strong>
                            <span className="text-[rgb(var(--color-text-muted))]">{body}</span>
                        </p>
                    ))}
                    <Link href="/quran" className="inline-block font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-2 hover:underline">
                        {t.hijriNuzululOpenQuran}
                    </Link>
                </div>
            )}
        </div>
    );
}

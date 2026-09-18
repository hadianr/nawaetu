"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function RewardsSupportCard() {
    const { t } = useLocale();
    return (
        <Link href="/rewards" className="group rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-[rgb(var(--color-primary))]/50">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-[rgb(var(--color-primary))]/20 rounded-lg"><Gift className="w-6 h-6 text-[rgb(var(--color-primary))]" /></div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[rgb(var(--color-primary))] transition-colors">{t.rewards.aboutTitle}</h3>
                    <p className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">{t.rewards.aboutBody}</p>
                </div>
            </div>
        </Link>
    );
}

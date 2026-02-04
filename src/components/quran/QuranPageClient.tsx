"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

export default function QuranPageClient() {
    const { t } = useLocale();
    
    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                <Link href="/">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-[rgb(var(--color-primary-light))]">{t.quranTitle}</h1>
                <p className="text-xs text-white/60">{t.quranSubtitle}</p>
            </div>
        </div>
    );
}

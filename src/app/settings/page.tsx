"use client";

import { Suspense } from "react";
import { RefreshCcw } from "lucide-react";
import SettingsPageContent from "./SettingsPageContent";

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#0F172A] text-white">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-sm animate-pulse">Memuat Pengaturan...</p>
                </div>
            </div>
        }>
            <SettingsPageContent />
        </Suspense>
    );
}

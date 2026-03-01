/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFeaturePreset } from "@/hooks/useFeaturePreset";
import type { FeatureVisibility } from "@/data/feature-presets";

interface PresetGuardProps {
    /** Key from FeatureVisibility yang harus true agar halaman bisa diakses */
    requiredFeature: keyof FeatureVisibility;
    /** Path tujuan redirect jika fitur tidak aktif. Default: "/" */
    redirectTo?: string;
    children: React.ReactNode;
}

/**
 * Komponen guard yang me-redirect user jika preset mereka tidak
 * mengaktifkan fitur yang dibutuhkan halaman ini.
 *
 * Contoh penggunaan di page.tsx:
 * ```tsx
 * <PresetGuard requiredFeature="showStats">
 *   <StatsPage />
 * </PresetGuard>
 * ```
 *
 * Tidak merender apapun saat isLoaded masih false (proses baca localStorage)
 * untuk menghindari flash konten sebelum redirect.
 */
export function PresetGuard({ requiredFeature, redirectTo = "/", children }: PresetGuardProps) {
    const router = useRouter();
    const preset = useFeaturePreset();

    useEffect(() => {
        // Tunggu hingga preset dimuat dari localStorage sebelum memutuskan redirect
        if (!preset.isLoaded) return;

        if (!preset[requiredFeature]) {
            router.replace(redirectTo);
        }
    }, [preset.isLoaded, preset[requiredFeature], redirectTo]);

    // Jangan render konten jika preset belum dimuat atau fitur tidak aktif
    if (!preset.isLoaded || !preset[requiredFeature]) {
        return null;
    }

    return <>{children}</>;
}

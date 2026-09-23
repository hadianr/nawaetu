"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { captureClientException } from "@/instrumentation-client";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
        captureClientException(error, { boundary: "app-error", digest: error.digest });
    }, [error]);

    const isDatabaseError =
        error.message?.toLowerCase().includes("database") ||
        error.message?.toLowerCase().includes("postgres") ||
        error.message?.toLowerCase().includes("connection") ||
        error.message?.toLowerCase().includes("pool");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--color-background))] px-6 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 animate-pulse rounded-full bg-[rgb(var(--color-danger))]/20 blur-3xl" />
                {isDatabaseError ? (
                    <div className="relative rounded-3xl bg-[rgb(var(--color-danger))]/10 p-6 border border-[rgb(var(--color-danger))]/20">
                        <Database className="h-16 w-16 text-[rgb(var(--color-danger))]" />
                    </div>
                ) : (
                    <div className="relative rounded-3xl bg-[rgb(var(--color-warning))]/10 p-6 border border-[rgb(var(--color-warning))]/20">
                        <AlertTriangle className="h-16 w-16 text-[rgb(var(--color-warning))]" />
                    </div>
                )}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-[rgb(var(--color-text-strong))]">
                {isDatabaseError ? "Koneksi Bermasalah" : "Terjadi Kesalahan"}
            </h1>

            <p className="mb-8 max-w-sm text-sm text-[rgb(var(--color-text-muted))] leading-relaxed">
                {isDatabaseError
                    ? "Kami sedang kesulitan menghubungkan ke database. Mohon tunggu sebentar selagi kami memperbaikinya."
                    : "Waduh, ada sesuatu yang tidak beres. Tim kami sedang meninjau masalah ini."}
            </p>

            <div className="flex flex-col w-full max-w-xs gap-3">
                <Button
                    onClick={() => reset()}
                    className="h-12 w-full rounded-2xl bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] font-bold hover:bg-[rgb(var(--color-primary-light))] transition-all active:scale-95"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Coba Lagi
                </Button>

                <Link href="/" className="w-full">
                    <Button
                        variant="ghost"
                        className="h-12 w-full rounded-2xl border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-strong))] hover:bg-[rgb(var(--color-surface-subtle))]"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Kembali ke Home
                    </Button>
                </Link>
            </div>

            {process.env.NODE_ENV === "development" && (
                <div className="mt-12 w-full max-w-md overflow-hidden rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]/60 p-4 text-left">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--color-text-muted))]">Debug Info</p>
                    <pre className="overflow-x-auto text-[10px] text-[rgb(var(--color-danger))] font-mono leading-relaxed">
                        {error.message}
                        {"\n"}
                        {error.digest && `Digest: ${error.digest}`}
                    </pre>
                </div>
            )}
        </div>
    );
}

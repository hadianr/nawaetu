"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

    const isDatabaseError =
        error.message?.toLowerCase().includes("database") ||
        error.message?.toLowerCase().includes("postgres") ||
        error.message?.toLowerCase().includes("connection") ||
        error.message?.toLowerCase().includes("pool");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/20 blur-3xl" />
                {isDatabaseError ? (
                    <div className="relative rounded-3xl bg-red-500/10 p-6 border border-red-500/20">
                        <Database className="h-16 w-16 text-red-500" />
                    </div>
                ) : (
                    <div className="relative rounded-3xl bg-amber-500/10 p-6 border border-amber-500/20">
                        <AlertTriangle className="h-16 w-16 text-amber-500" />
                    </div>
                )}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-white">
                {isDatabaseError ? "Koneksi Bermasalah" : "Terjadi Kesalahan"}
            </h1>

            <p className="mb-8 max-w-sm text-sm text-slate-400 leading-relaxed">
                {isDatabaseError
                    ? "Kami sedang kesulitan menghubungkan ke database. Mohon tunggu sebentar selagi kami memperbaikinya."
                    : "Waduh, ada sesuatu yang tidak beres. Tim kami sedang meninjau masalah ini."}
            </p>

            <div className="flex flex-col w-full max-w-xs gap-3">
                <Button
                    onClick={() => reset()}
                    className="h-12 w-full rounded-2xl bg-white text-black font-bold hover:bg-white/90 transition-all active:scale-95"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Coba Lagi
                </Button>

                <Link href="/" className="w-full">
                    <Button
                        variant="ghost"
                        className="h-12 w-full rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Kembali ke Home
                    </Button>
                </Link>
            </div>

            {process.env.NODE_ENV === "development" && (
                <div className="mt-12 w-full max-w-md overflow-hidden rounded-xl border border-white/5 bg-black/40 p-4 text-left">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Debug Info</p>
                    <pre className="overflow-x-auto text-[10px] text-red-400/80 font-mono leading-relaxed">
                        {error.message}
                        {"\n"}
                        {error.digest && `Digest: ${error.digest}`}
                    </pre>
                </div>
            )}
        </div>
    );
}

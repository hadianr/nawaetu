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

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useSession, signIn } from "next-auth/react";
import { Bug, Lightbulb, Upload, X, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/app-config";

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MAX_IMAGES_COUNT = 3;

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const { status } = useSession();
    const isDaylight = currentTheme === "daylight";
    const isAuthenticated = status === "authenticated";

    // Form state
    const [type, setType] = useState<"bug" | "feature">("bug");
    const [message, setMessage] = useState("");
    const [screenshots, setScreenshots] = useState<File[]>([]);
    const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newScreenshots = [...screenshots];

        // Validation: Limit total files to 3
        if (newScreenshots.length + files.length > MAX_IMAGES_COUNT) {
            toast.error(`Maksimal hanya diperbolehkan mengunggah ${MAX_IMAGES_COUNT} gambar.`);
            return;
        }

        let hasError = false;

        for (const file of files) {
            // Validation: Must be image
            if (!file.type.startsWith("image/")) {
                toast.error(`File "${file.name}" bukan format gambar yang valid.`);
                hasError = true;
                continue;
            }

            // Validation: Max 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Ukuran gambar "${file.name}" tidak boleh melebihi 5MB.`);
                hasError = true;
                continue;
            }

            newScreenshots.push(file);
            
            // Read file as Base64 (data:) URL so CSP does not block it
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Url = reader.result as string;
                setScreenshotPreviews(prev => [...prev, base64Url]);
            };
            reader.readAsDataURL(file);
        }

        if (!hasError) {
            setScreenshots(newScreenshots);
        }

        // Reset input value to allow uploading the same file again if removed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeScreenshot = (index: number) => {
        const newScreenshots = screenshots.filter((_, i) => i !== index);
        const newPreviews = screenshotPreviews.filter((_, i) => i !== index);
        
        setScreenshots(newScreenshots);
        setScreenshotPreviews(newPreviews);
    };

    const clearAllScreenshots = () => {
        setScreenshots([]);
        setScreenshotPreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const getDeviceInfo = () => {
        if (typeof window === "undefined") return {};
        const ua = navigator.userAgent;
        let browser = "Unknown Browser";
        if (ua.indexOf("Firefox") > -1) browser = "Firefox";
        else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Browser";
        else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
        else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
        else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) browser = "Edge";
        else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
        else if (ua.indexOf("Safari") > -1) browser = "Safari";

        let os = "Unknown OS";
        if (ua.indexOf("Windows") > -1) os = "Windows";
        else if (ua.indexOf("Mac") > -1) os = "MacOS";
        else if (ua.indexOf("X11") > -1) os = "Linux";
        else if (ua.indexOf("Android") > -1) os = "Android";
        else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS";

        return {
            appVersion: APP_CONFIG.version,
            browser,
            os,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: ua,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error("Deskripsi masukan tidak boleh kosong.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("message", message);
            formData.append("deviceInfo", JSON.stringify(getDeviceInfo()));
            
            // Append multiple files to same FormData field key
            screenshots.forEach((file) => {
                formData.append("screenshots", file);
            });

            const response = await fetch("/api/feedback", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal mengirim masukan.");
            }

            toast.success(t.feedbackSuccessToast || "Masukan berhasil dikirim. Terima kasih!");
            // Reset form
            setMessage("");
            clearAllScreenshots();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Feedback submit error:", error);
            toast.error(error.message || t.feedbackErrorToast || "Terjadi kesalahan saat mengirim masukan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) clearAllScreenshots();
            onOpenChange(val);
        }}>
            <DialogContent className={cn(
                "max-w-md w-[92%] rounded-[2rem] border p-0 overflow-hidden shadow-2xl [&>button]:z-50",
                isDaylight
                    ? "bg-white border-slate-200 text-slate-900"
                    : "bg-[#0F172A] border-white/10 text-white"
            )}>
                {/* Gradient Header decor */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-primary))]/5 to-transparent pointer-events-none" />

                <DialogHeader className="px-6 pt-6 pb-2 relative z-10">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
                        {t.feedbackModalTitle}
                    </DialogTitle>
                    <DialogDescription className={cn(
                        "text-xs leading-relaxed pt-1",
                        isDaylight ? "text-slate-500" : "text-white/60"
                    )}>
                        {t.feedbackDescription}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-6 relative z-10">
                    {!isAuthenticated ? (
                        /* Login Required Guard UI */
                        <div className={cn(
                            "flex flex-col items-center justify-center text-center p-6 border rounded-2xl space-y-4 my-2",
                            isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/[0.02] border-white/5"
                        )}>
                            <div className={cn(
                                "p-3 rounded-full",
                                isDaylight ? "bg-amber-50 text-amber-600" : "bg-amber-500/10 text-amber-400"
                            )}>
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold">{t.feedbackAuthRequired}</h4>
                                <p className={cn("text-[10px] leading-relaxed", isDaylight ? "text-slate-400" : "text-white/40")}>
                                    Masukan tidak anonim untuk mencegah spam dan mempermudah tindak lanjut.
                                </p>
                            </div>
                            <Button
                                onClick={() => signIn("google")}
                                className="w-full font-bold rounded-xl shadow-lg bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white"
                            >
                                {t.feedbackLoginButton}
                            </Button>
                        </div>
                    ) : (
                        /* Feedback Form UI */
                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            {/* Feedback Type Tabs */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-white/60">{t.feedbackTypeLabel}</Label>
                                <div className={cn(
                                    "flex p-1 rounded-xl border",
                                    isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/10"
                                )}>
                                    <button
                                        type="button"
                                        onClick={() => setType("bug")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all active:scale-[0.98]",
                                            type === "bug"
                                                ? isDaylight
                                                    ? "bg-red-50 text-red-600 shadow-sm border border-red-100"
                                                    : "bg-red-500/15 text-red-400 border border-red-500/20 shadow-md shadow-red-950/20"
                                                : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        <Bug className="w-3.5 h-3.5" />
                                        {t.feedbackTypeBug}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType("feature")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all active:scale-[0.98]",
                                            type === "feature"
                                                ? isDaylight
                                                    ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
                                                    : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))]/30 shadow-md shadow-[rgb(var(--color-primary-dark))]/20"
                                                : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        {t.feedbackTypeFeature}
                                    </button>
                                </div>
                            </div>

                            {/* Message / Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="feedback-desc" className="text-xs font-bold text-white/60">
                                    {t.feedbackMessageLabel}
                                </Label>
                                <Textarea
                                    id="feedback-desc"
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t.feedbackMessagePlaceholder}
                                    className={cn(
                                        "min-h-[100px] text-xs leading-relaxed rounded-xl border resize-none focus-visible:ring-1 focus-visible:ring-[rgb(var(--color-primary-light))]",
                                        isDaylight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
                                    )}
                                />
                            </div>

                            {/* Multiple Screenshots Uploader */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-white/60">{t.feedbackScreenshotLabel}</Label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                />

                                {/* Upload Trigger (shown only if uploaded images are less than max limit) */}
                                {screenshots.length < MAX_IMAGES_COUNT && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "w-full flex flex-col items-center justify-center p-4 rounded-xl border border-dashed text-center hover:bg-white/[0.02] cursor-pointer transition-all active:scale-[0.99] mb-3",
                                            isDaylight ? "border-slate-200" : "border-white/15"
                                        )}
                                    >
                                        <Upload className={cn("w-5 h-5 mb-1 text-white/40")} />
                                        <span className="text-[10px] font-bold">
                                            {t.feedbackScreenshotDesc || `Unggah gambar pendukung (maks. 3, maks. 5MB per gambar)`}
                                        </span>
                                    </button>
                                )}

                                {/* Grid of Previews */}
                                {screenshotPreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {screenshotPreviews.map((url, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "relative border rounded-xl overflow-hidden aspect-video bg-black/20 group p-1 flex items-center justify-center",
                                                    isDaylight ? "border-slate-100" : "border-white/5"
                                                )}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Screenshot ${idx + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeScreenshot(idx)}
                                                    className="absolute top-1 right-1 h-5 w-5 rounded-full border border-black/40 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-colors active:scale-95 shadow-md"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full font-bold h-11 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-2",
                                    isDaylight
                                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                                        : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>{t.feedbackSubmitting}</span>
                                    </div>
                                ) : (
                                    <span>{t.feedbackSubmitButton}</span>
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

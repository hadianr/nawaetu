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

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, AlignJustify, BookOpen, Type, Loader2, Headphones } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { QURAN_RECITER_OPTIONS } from "@/data/settings-data";

export interface QuranSettingsModalProps {
    viewMode: 'list' | 'mushaf';
    setViewMode: (mode: 'list' | 'mushaf') => void;
    scriptType: 'tajweed' | 'indopak';
    setScriptType: (type: 'tajweed' | 'indopak') => void;
    showTransliteration: boolean;
    setShowTransliteration: (show: boolean) => void;
    fontSize: 'small' | 'medium' | 'large';
    setFontSize: (size: 'small' | 'medium' | 'large') => void;
    perPage: number;
    handlePerPageChange: (num: number) => void;
    currentReciterId?: number;
    handleReciterChange: (value: string) => void;
    isPending: boolean;
}

export default function QuranSettingsModal({
    viewMode,
    setViewMode,
    scriptType,
    setScriptType,
    showTransliteration,
    setShowTransliteration,
    fontSize,
    setFontSize,
    perPage,
    handlePerPageChange,
    currentReciterId,
    handleReciterChange,
    isPending
}: QuranSettingsModalProps) {
    const { t } = useLocale();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="h-9 w-9 p-0 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all hover:border-[rgb(var(--color-primary))]/50 shrink-0">
                    <Settings className="h-5 w-5" />
                </button>
            </DialogTrigger>
            <DialogContent className="border-none bg-[#0F172A] backdrop-blur-xl max-w-sm max-h-[90vh] p-0 overflow-hidden flex flex-col quran-settings-modal">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>{t.quranSettingsTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                    <div className="space-y-5 py-2">
                        {/* View Mode */}
                        <div className="space-y-3">
                            <Label className="text-[rgb(var(--color-primary-light))] text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 ml-1">{t.quranModeRead}</Label>
                            <div className="grid grid-cols-2 gap-2 bg-[rgb(var(--color-primary))]/5 p-1.5 rounded-2xl border border-[rgb(var(--color-primary))]/10">
                                <button onClick={() => setViewMode('list')} className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg shadow-[rgb(var(--color-primary))]/20 quran-tab-active' : 'opacity-40 hover:opacity-100'}`}>
                                    <AlignJustify className="h-4 w-4" /> {t.quranModeList}
                                </button>
                                <button onClick={() => setViewMode('mushaf')} className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${viewMode === 'mushaf' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg shadow-[rgb(var(--color-primary))]/20 quran-tab-active' : 'opacity-40 hover:opacity-100'}`}>
                                    <BookOpen className="h-4 w-4" /> {t.quranModeMushaf}
                                </button>
                            </div>
                        </div>
                        {/* Script Type Toggle */}
                        <div className="space-y-3">
                            <Label className="text-[rgb(var(--color-primary-light))] text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 ml-1">{t.quranScriptType}</Label>
                            <div className="grid grid-cols-2 gap-2 bg-[rgb(var(--color-primary))]/5 p-1.5 rounded-2xl border border-[rgb(var(--color-primary))]/10">
                                <button
                                    onClick={() => setScriptType('indopak')}
                                    className={`flex flex-col items-center justify-center h-16 rounded-xl text-sm font-bold transition-all ${scriptType === 'indopak' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg shadow-[rgb(var(--color-primary))]/20 quran-tab-active' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <span className="font-bold text-xl mb-0.5 font-amiri">بِسْمِ</span>
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-wider">{t.quranScriptStandard}</span>
                                </button>
                                <button
                                    onClick={() => setScriptType('tajweed')}
                                    className={`flex flex-col items-center justify-center h-16 rounded-xl text-sm font-bold transition-all ${scriptType === 'tajweed' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg shadow-[rgb(var(--color-primary))]/20 quran-tab-active' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <span className="font-bold text-xl mb-0.5 font-amiri text-white quran-tajweed-active"><span style={{ color: scriptType === 'tajweed' ? 'currentColor' : '#fb923c' }}>بِسْ</span><span style={{ color: scriptType === 'tajweed' ? 'currentColor' : '#4ade80' }}>مِ</span></span>
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-wider">{t.quranScriptTajweed}</span>
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3">
                            <Label className="text-[rgb(var(--color-primary-light))] text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 ml-1">{t.quranOtherDisplay}</Label>
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-[rgb(var(--color-primary))]/10 bg-[rgb(var(--color-primary))]/5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
                                        <Type className="h-4 w-4 text-[rgb(var(--color-primary))]" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{t.quranTransliteration}</span>
                                </div>
                                <Switch checked={showTransliteration} onCheckedChange={setShowTransliteration} className="quran-toggle" />
                            </div>
                        </div>
                        {/* Font Size */}
                        <div className="space-y-3">
                            <Label className="text-[rgb(var(--color-primary-light))] text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 ml-1">{t.quranFontSize}</Label>
                            <div className="flex items-center gap-2 bg-[rgb(var(--color-primary))]/5 p-1.5 rounded-2xl border border-[rgb(var(--color-primary))]/10">
                                <button onClick={() => setFontSize('small')} className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${fontSize === 'small' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg quran-tab-active' : 'opacity-40 hover:opacity-100'}`}>A-</button>
                                <button onClick={() => setFontSize('medium')} className={`flex-1 h-10 rounded-xl text-base font-bold transition-all ${fontSize === 'medium' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg quran-tab-active' : 'opacity-40 hover:opacity-100'}`}>A</button>
                                <button onClick={() => setFontSize('large')} className={`flex-1 h-10 rounded-xl text-lg font-bold transition-all ${fontSize === 'large' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg quran-tab-active' : 'opacity-40 hover:opacity-100'}`}>A+</button>
                            </div>
                        </div>

                        {/* Verses Per Page */}
                        <div className="space-y-3">
                            <Label className="text-[rgb(var(--color-primary-light))] text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 ml-1">{t.quranVersesPerPage}</Label>
                            <div className="grid grid-cols-4 gap-2 bg-[rgb(var(--color-primary))]/5 p-1.5 rounded-2xl border border-[rgb(var(--color-primary))]/10">
                                {[10, 20, 30, 50].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handlePerPageChange(num)}
                                        disabled={isPending}
                                        className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${perPage === num ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg quran-tab-active' : 'opacity-40 hover:opacity-100'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isPending && perPage === num ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Qari Selection */}
                        <div className="space-y-3">
                            <Label className="text-[rgb(var(--color-primary-light))] text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 ml-1">{t.quranSelectQari}</Label>
                            <Select value={currentReciterId?.toString()} onValueChange={handleReciterChange} disabled={isPending}>
                                <SelectTrigger className={`w-full bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/10 rounded-2xl h-14 md:h-12 shadow-sm ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--color-primary))]" /> : <Headphones className="h-4 w-4 text-[rgb(var(--color-primary))]" />}
                                        </div>
                                        <SelectValue placeholder={t.quranSelectQari} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {QURAN_RECITER_OPTIONS.map((qari) => (
                                        <SelectItem key={qari.id} value={qari.id.toString()} className="hover:bg-white/10 focus:bg-white/10 focus:text-white text-white cursor-pointer transition-colors">
                                            {qari.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

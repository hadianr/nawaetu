import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlignJustify, BookOpen, Loader2, Settings, Type, Headphones } from 'lucide-react';
import { QURAN_RECITER_OPTIONS } from "@/data/settings-data";
import { ScriptType, ViewMode, FontSize } from "./hooks/useQuranSettings";

interface SettingsDialogProps {
    t: Record<string, string>;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    showTransliteration: boolean;
    setShowTransliteration: (show: boolean) => void;
    scriptType: ScriptType;
    setScriptType: (type: ScriptType) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    perPage: number;
    handlePerPageChange: (num: number) => void;
    currentReciterId?: number;
    handleReciterChange: (val: string) => void;
    isPending: boolean;
}

export default function SettingsDialog({
    t,
    fontSize,
    setFontSize,
    showTransliteration,
    setShowTransliteration,
    scriptType,
    setScriptType,
    viewMode,
    setViewMode,
    perPage,
    handlePerPageChange,
    currentReciterId,
    handleReciterChange,
    isPending
}: SettingsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="h-9 w-9 p-0 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all hover:border-[rgb(var(--color-primary))]/50 shrink-0">
                    <Settings className="h-5 w-5" />
                </button>
            </DialogTrigger>
            <DialogContent className="border-none bg-[#0f172a]/95 backdrop-blur-xl text-white max-w-sm max-h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>{t.quranSettingsTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                    <div className="space-y-5 py-2">
                        {/* View Mode */}
                        <div className="space-y-3">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranModeRead}</Label>
                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
                                <button onClick={() => setViewMode('list')} className={`flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                    <AlignJustify className="h-4 w-4" /> {t.quranModeList}
                                </button>
                                <button onClick={() => setViewMode('mushaf')} className={`flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${viewMode === 'mushaf' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                    <BookOpen className="h-4 w-4" /> {t.quranModeMushaf}
                                </button>
                            </div>
                        </div>
                        {/* Script Type Toggle */}
                        <div className="space-y-4">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranScriptType}</Label>
                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setScriptType('indopak')}
                                    className={`flex flex-col items-center justify-center h-14 rounded-lg text-sm font-medium transition-all ${scriptType === 'indopak' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <span className="font-bold text-lg mb-1 font-amiri">بِسْمِ</span>
                                    <span className="text-[10px] md:text-xs">{t.quranScriptStandard}</span>
                                </button>
                                <button
                                    onClick={() => setScriptType('tajweed')}
                                    className={`flex flex-col items-center justify-center h-14 rounded-lg text-sm font-medium transition-all ${scriptType === 'tajweed' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <span className="font-bold text-lg mb-1 font-amiri"><span style={{ color: '#fb923c' }}>بِسْ</span><span style={{ color: '#4ade80' }}>مِ</span></span>
                                    <span className="text-[10px] md:text-xs">{t.quranScriptTajweed}</span>
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-4">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranOtherDisplay}</Label>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                                <div className="flex items-center gap-3"><Type className="h-5 w-5 text-indigo-400" /><span className="font-medium">{t.quranTransliteration}</span></div>
                                <Switch checked={showTransliteration} onCheckedChange={setShowTransliteration} />
                            </div>
                        </div>
                        {/* Font Size */}
                        <div className="space-y-3">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranFontSize}</Label>
                            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                <button onClick={() => setFontSize('small')} className={`flex-1 h-8 rounded-lg text-sm font-bold ${fontSize === 'small' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A-</button>
                                <button onClick={() => setFontSize('medium')} className={`flex-1 h-8 rounded-lg text-base font-bold ${fontSize === 'medium' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A</button>
                                <button onClick={() => setFontSize('large')} className={`flex-1 h-8 rounded-lg text-lg font-bold ${fontSize === 'large' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A+</button>
                            </div>
                        </div>

                        {/* Verses Per Page */}
                        <div className="space-y-3">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranVersesPerPage}</Label>
                            <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                {[10, 20, 30, 50].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handlePerPageChange(num)}
                                        disabled={isPending}
                                        className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${perPage === num ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-slate-500 hover:text-slate-300'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isPending && perPage === num ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Qari Selection */}
                        <div className="space-y-3">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranSelectQari}</Label>
                            <Select value={currentReciterId?.toString()} onValueChange={handleReciterChange} disabled={isPending}>
                                <SelectTrigger className={`w-full bg-white/5 border-white/10 text-white rounded-xl h-12 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-sky-400" /> : <Headphones className="h-4 w-4 text-sky-400" />}
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

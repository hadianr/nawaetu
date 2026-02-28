import { toArabicNumber } from "@/lib/quran-utils";
import { Play, Pause, ChevronLeft, ChevronRight, Repeat, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoopMode = 'off' | '1' | '3' | 'infinity';

interface AudioPlayerBarProps {
    playingVerseKey: string | null;
    isPlaying: boolean;
    loopMode: LoopMode;
    currentPlayingIndex: number;
    totalVerses: number;
    isDaylight: boolean;
    onLoopModeChange: (mode: LoopMode) => void;
    onPrev: () => void;
    onNext: () => void;
    onPlayPause: () => void;
}

export default function AudioPlayerBar({
    playingVerseKey,
    isPlaying,
    loopMode,
    currentPlayingIndex,
    totalVerses,
    isDaylight,
    onLoopModeChange,
    onPrev,
    onNext,
    onPlayPause
}: AudioPlayerBarProps) {
    if (!playingVerseKey) return null;

    return (
        <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none flex flex-col items-center gap-3 px-4">
            <div className="pointer-events-auto bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 pr-2 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sedang Memutar</span>
                    <span className="text-xs font-bold text-white">Ayat {toArabicNumber(parseInt((playingVerseKey || '1:1').split(':')[1]))}</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-1">
                    <Button
                        onClick={() => {
                            const modes: LoopMode[] = ['off', '1', '3', 'infinity'];
                            const nextIndex = (modes.indexOf(loopMode) + 1) % modes.length;
                            onLoopModeChange(modes[nextIndex]);
                        }}
                        size="icon"
                        variant="ghost"
                        className={`h-8 w-8 rounded-full hover:bg-white/10 ${loopMode !== 'off' ? 'text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10' : 'text-slate-400'}`}
                    >
                        {loopMode === 'infinity' ? <InfinityIcon className="h-4 w-4" /> :
                            loopMode === 'off' ? <Repeat className="h-4 w-4" /> :
                                <span className="text-[10px] font-bold border rounded px-0.5 border-current w-4 h-4 flex items-center justify-center">{loopMode}x</span>
                        }
                    </Button>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onPrev} disabled={currentPlayingIndex <= 0} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPlayPause}
                            className={cn(
                                "h-10 w-10 rounded-full transition-all flex items-center justify-center",
                                isDaylight
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                    : "bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-light))] shadow-lg shadow-[rgb(var(--color-primary))]/30"
                            )}
                        >
                            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onNext} disabled={currentPlayingIndex >= totalVerses - 1} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

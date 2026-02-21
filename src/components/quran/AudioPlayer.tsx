import { Button } from "@/components/ui/button";
import { Play, Pause, Square, ChevronLeft, ChevronRight, Repeat, Infinity as InfinityIcon } from 'lucide-react';
import { toArabicNumber } from "./utils";
import { LoopMode } from "./hooks/useQuranAudio";

interface AudioPlayerProps {
    playingVerseKey: string | null;
    isPlaying: boolean;
    loopMode: LoopMode;
    setLoopMode: (mode: LoopMode) => void;
    handlePrevVerse: () => void;
    handleNextVerse: () => void;
    handleStop: () => void;
    handlePause: () => void;
    handleResume: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export default function AudioPlayer({
    playingVerseKey,
    isPlaying,
    loopMode,
    setLoopMode,
    handlePrevVerse,
    handleNextVerse,
    handleStop,
    handlePause,
    handleResume,
    isFirst,
    isLast
}: AudioPlayerProps) {
    if (!playingVerseKey) return null;

    const toggleLoopMode = () => {
        const modes: LoopMode[] = ['off', '1', '3', 'infinity'];
        const nextIndex = (modes.indexOf(loopMode) + 1) % modes.length;
        setLoopMode(modes[nextIndex]);
    };

    return (
        <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none flex flex-col items-center gap-3 px-4">
            <div className="pointer-events-auto bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 pr-2 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sedang Memutar</span>
                    <span className="text-xs font-bold text-white">Ayat {toArabicNumber(parseInt((playingVerseKey || '1:1').split(':')[1]))}</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevVerse} disabled={isFirst} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {/* Loop Button */}
                    <Button
                        onClick={toggleLoopMode}
                        size="icon"
                        variant="ghost"
                        className={`h-8 w-8 rounded-full hover:bg-white/10 ${loopMode !== 'off' ? 'text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10' : 'text-slate-400'}`}
                    >
                        {loopMode === 'infinity' ? <InfinityIcon className="h-4 w-4" /> :
                            loopMode === 'off' ? <Repeat className="h-4 w-4" /> :
                                <span className="text-[10px] font-bold border rounded px-0.5 border-current w-4 h-4 flex items-center justify-center">{loopMode}x</span>
                        }
                    </Button>

                    {/* Stop Button */}
                    <Button onClick={handleStop} size="icon" variant="ghost" className="h-10 w-10 rounded-full text-red-400 hover:text-red-300 hover:bg-white/10">
                        <Square className="h-4 w-4 fill-current" />
                    </Button>

                    {/* Play/Pause Button */}
                    <Button onClick={isPlaying ? handlePause : handleResume} size="icon" className="h-10 w-10 rounded-full bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))] shadow-lg shadow-[rgb(var(--color-primary))]/20">
                        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={handleNextVerse} disabled={isLast} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

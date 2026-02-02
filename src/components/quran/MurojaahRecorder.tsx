"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, CheckCircle, XCircle, RefreshCw, Volume2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { verifyRecitation, type MurojaahResponse } from "@/app/actions/murojaah";
import { Verse } from "./VerseList";

interface MurojaahRecorderProps {
    verse: Verse;
    chapterName: string;
}

export default function MurojaahRecorder({ verse, chapterName }: MurojaahRecorderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<MurojaahResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isPlayingRef, setIsPlayingRef] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const refAudioRef = useRef<HTMLAudioElement | null>(null);

    // Playback Recorded Audio State
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
    const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

    const toggleRecordedAudio = () => {
        if (!recordedAudioUrl) return;

        if (!recordedAudioRef.current) {
            recordedAudioRef.current = new Audio(recordedAudioUrl);
            recordedAudioRef.current.onended = () => setIsPlayingRecorded(false);
        }

        if (isPlayingRecorded) {
            recordedAudioRef.current.pause();
            setIsPlayingRecorded(false);
        } else {
            recordedAudioRef.current.play();
            setIsPlayingRecorded(true);
        }
    };


    const toggleRefAudio = () => {
        if (!refAudioRef.current) {
            refAudioRef.current = new Audio(verse.audio.url);
            refAudioRef.current.onended = () => setIsPlayingRef(false);
        }

        if (isPlayingRef) {
            refAudioRef.current.pause();
            setIsPlayingRef(false);
        } else {
            refAudioRef.current.play();
            setIsPlayingRef(true);
        }
    };


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Create URL for playback
                const url = URL.createObjectURL(blob);
                setRecordedAudioUrl(url);

                await handleVerification(blob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setResult(null);
            setError(null);
        } catch (err) {
            console.error("Mic Error:", err);
            setError("Gagal mengakses mikrofon. Pastikan izin diberikan.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleVerification = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            // Convert Blob to Base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;

                // Call Server Action
                const response = await verifyRecitation(
                    base64Audio,
                    verse.text_uthmani,
                    verse.verse_key
                );

                setResult(response);
                setIsProcessing(false);
            };
        } catch (err) {
            console.error("Verification Error:", err);
            setError("Gagal memproses audio.");
            setIsProcessing(false);
        }
    };

    const verseNum = verse.verse_key.split(':')[1];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                stopRecording();
                setResult(null);
                if (refAudioRef.current) {
                    refAudioRef.current.pause();
                    setIsPlayingRef(false);
                }
                if (recordedAudioRef.current) {
                    recordedAudioRef.current.pause();
                    setIsPlayingRecorded(false);
                }
                setRecordedAudioUrl(null);
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10">
                    <Mic className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0f172a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-center">Setoran Hafalan</DialogTitle>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        <span>{chapterName} : Ayat {verseNum}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10"
                            onClick={toggleRefAudio}
                        >
                            {isPlayingRef ? <Pause className="h-3 w-3 fill-current" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center gap-6 py-4">
                    {/* Quran Text Display */}
                    <div className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 mb-2">
                        <p dir="rtl" className="text-4xl leading-[2.2] text-center font-lateef text-slate-100 tracking-wide">
                            {verse.text_indopak || verse.text_uthmani}
                        </p>
                    </div>

                    {/* Visualizer / Status */}
                    <div className="relative">
                        <div className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${isRecording ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]' :
                            isProcessing ? 'bg-blue-500/20 animate-pulse' :
                                result?.correct ? 'bg-green-500/20' :
                                    result && !result.correct ? 'bg-amber-500/20' :
                                        'bg-slate-800'
                            }`}>
                            {isProcessing ? (
                                <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                            ) : result ? (
                                result.correct ? <CheckCircle className="h-10 w-10 text-green-400" /> : <XCircle className="h-10 w-10 text-amber-400" />
                            ) : (
                                <Mic className={`h-10 w-10 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                            )}
                        </div>

                        {/* Play Recorded Audio Button (Only if result exists) */}
                        {result && recordedAudioUrl && (
                            <Button
                                size="icon"
                                onClick={toggleRecordedAudio}
                                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg border border-white/10 z-10"
                            >
                                {isPlayingRecorded ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                            </Button>
                        )}
                    </div>

                    {/* Feedback Text */}
                    <div className="text-center space-y-2 min-h-[80px]">
                        {isRecording ? (
                            <p className="text-red-400 font-medium animate-pulse">Sedang Mendengarkan...</p>
                        ) : isProcessing ? (
                            <p className="text-blue-400 font-medium">Ustadz AI sedang menyimak...</p>
                        ) : result ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <p className={`text-lg font-bold mb-1 ${result.correct ? 'text-green-400' : 'text-amber-400'}`}>
                                    {result.correct ? "Mumtaz! (Sempurna)" : "Kurang Tepat"}
                                </p>
                                <p className="text-sm text-slate-300">"{result.feedback}"</p>
                                {result.details && result.details.length > 0 ? (
                                    <div className="mt-4 space-y-3 w-full max-h-[200px] overflow-y-auto pr-2 custom-scrollbar text-left">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detail Koreksi:</div>
                                        {result.details.map((item, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded uppercase">{item.issue}</span>
                                                    {item.rule && <span className="text-[10px] text-blue-300 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">{item.rule}</span>}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {/* Wrong Part (Visualized if needed, or just focus on correct) */}
                                                    <div className="text-right">
                                                        <p dir="rtl" className="text-xl font-lateef text-slate-200">{item.part}</p>
                                                    </div>
                                                    <div className="h-px bg-white/5 w-full"></div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-green-400 block mb-0.5">Seharusnya:</span>
                                                        <p dir="rtl" className="text-xl font-lateef text-green-100">{item.correct}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : result.correction && (
                                    <div className="mt-3 p-4 bg-white/10 rounded-xl text-right border border-white/5">
                                        <span className="font-bold text-slate-400 block mb-2 text-left text-[10px] uppercase tracking-wider">Koreksi:</span>
                                        <p dir="rtl" className="text-2xl font-lateef text-slate-100 leading-relaxed">
                                            {result.correction}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : error ? (
                            <p className="text-red-400 text-sm">{error}</p>
                        ) : (
                            <p className="text-slate-400 text-sm max-w-[200px]">
                                Tekan tombol mic, lalu bacakan ayat ini dengan jelas.
                            </p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        {!isRecording ? (
                            <Button
                                onClick={startRecording}
                                className={`rounded-full px-8 ${result ? 'bg-white/10 hover:bg-white/20' : 'bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))]'}`}
                            >
                                {result ? "Coba Lagi" : "Mulai Rekam"}
                            </Button>
                        ) : (
                            <Button
                                onClick={stopRecording}
                                variant="destructive"
                                className="rounded-full px-8 animate-pulse"
                            >
                                <Square className="h-4 w-4 mr-2 fill-current" />
                                Selesai
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

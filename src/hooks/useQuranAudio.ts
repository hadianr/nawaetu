import { useState, useRef, useCallback, useEffect } from "react";
import { Verse } from "@/components/quran/VerseList";
import { fetchSurahSegments, findActiveWordIndex } from "@/lib/quran/quran-segments-api";

export function useQuranAudio({
    accumulatedVerses,
    activeReciterId,
    scrollToVerse,
    getVerseAudioUrl
}: {
    accumulatedVerses: Verse[];
    activeReciterId: number;
    scrollToVerse: (verseNum: number) => void;
    getVerseAudioUrl: (verse: Verse) => string;
}) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const activeWordRef = useRef<{ verseKey: string; idx: number } | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const segmentsRef = useRef<any | null>(null);
    const segmentsCacheKeyRef = useRef<string | null>(null);

    const [isContinuous, setIsContinuous] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loopMode, setLoopMode] = useState<'off' | '1' | '3' | 'infinity'>('off');
    const [repeatCount, setRepeatCount] = useState(0);
    const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    const [activeWord, setActiveWord] = useState<{ verseKey: string; idx: number } | null>(null);

    const stopWordSync = useCallback(() => {
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        activeWordRef.current = null;
        setActiveWord(null);
    }, []);

    const startWordSync = useCallback((verseKey: string) => {
        if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);

        const tick = () => {
            const audio = audioRef.current;
            if (!audio || !segmentsRef.current) return;

            const currentMs = audio.currentTime * 1000;
            const segs = segmentsRef.current[verseKey];
            if (!segs) {
                rafIdRef.current = requestAnimationFrame(tick);
                return;
            }

            const foundIdx = findActiveWordIndex(segs, currentMs);

            if (
                foundIdx !== activeWordRef.current?.idx ||
                verseKey !== activeWordRef.current?.verseKey
            ) {
                const next = foundIdx >= 0 ? { verseKey, idx: foundIdx } : null;
                activeWordRef.current = next;
                setActiveWord(next);
            }

            rafIdRef.current = requestAnimationFrame(tick);
        };

        rafIdRef.current = requestAnimationFrame(tick);
    }, []);

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        stopWordSync();
        setPlayingVerseKey(null);
        setCurrentAudioUrl(null);
        setIsContinuous(false);
        setIsPlaying(false);
        setRepeatCount(0);
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    };

    const handleResume = () => {
        if (audioRef.current && currentAudioUrl) {
            setIsPlaying(true);
        }
    };

    const handleVersePlay = (verse: Verse, continuous = false) => {
        if (playingVerseKey === verse.verse_key) {
            if (isPlaying) handlePause();
            else handleResume();
        } else {
            setIsContinuous(continuous);
            setPlayingVerseKey(verse.verse_key);
            setCurrentAudioUrl(getVerseAudioUrl(verse));
            setIsPlaying(true);
            setRepeatCount(0);
            scrollToVerse(parseInt(verse.verse_key.split(':')[1]));
        }
    };

    const handleSurahPlay = () => {
        if (playingVerseKey && isContinuous) {
            if (isPlaying) handlePause();
            else handleResume();
        } else if (accumulatedVerses.length > 0) {
            handleVersePlay(accumulatedVerses[0], true);
        }
    };

    const handleNextVerse = () => {
        if (!playingVerseKey) return;
        const currentIndex = accumulatedVerses.findIndex(v => v.verse_key === playingVerseKey);
        if (currentIndex !== -1 && currentIndex < accumulatedVerses.length - 1) {
            handleVersePlay(accumulatedVerses[currentIndex + 1], isContinuous);
        }
    };

    const handlePreviousVerse = () => {
        if (!playingVerseKey) return;
        const currentIndex = accumulatedVerses.findIndex(v => v.verse_key === playingVerseKey);
        if (currentIndex > 0) {
            handleVersePlay(accumulatedVerses[currentIndex - 1], isContinuous);
        }
    };

    const handleAudioEnded = () => {
        if (loopMode === 'infinity') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(console.error);
                if (playingVerseKey) scrollToVerse(parseInt(playingVerseKey.split(':')[1]));
            }
            return;
        }

        const limit = loopMode === '1' ? 1 : loopMode === '3' ? 3 : 0;
        if (limit > 0 && repeatCount < limit) {
            setRepeatCount(prev => prev + 1);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(console.error);
                if (playingVerseKey) scrollToVerse(parseInt(playingVerseKey.split(':')[1]));
            }
            return;
        }

        setRepeatCount(0);
        if (isContinuous) handleNextVerse();
        else handleStop();
    };

    useEffect(() => {
        if (!audioRef.current) return;
        if (currentAudioUrl) {
            if (audioRef.current.src !== currentAudioUrl) audioRef.current.src = currentAudioUrl;
            if (isPlaying) audioRef.current.play().catch(console.error);
            else audioRef.current.pause();
        } else {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    }, [currentAudioUrl, isPlaying]);

    useEffect(() => {
        if (!playingVerseKey || !activeReciterId) {
            stopWordSync();
            return;
        }
        const [surahIdStr] = playingVerseKey.split(':');
        const surahId = parseInt(surahIdStr);
        const cacheKey = `${surahId}-${activeReciterId}`;

        if (segmentsCacheKeyRef.current === cacheKey && segmentsRef.current !== null) {
            startWordSync(playingVerseKey);
            return;
        }

        segmentsCacheKeyRef.current = cacheKey;
        segmentsRef.current = null;
        stopWordSync();

        fetchSurahSegments(surahId, activeReciterId).then(data => {
            segmentsRef.current = data;
            if (data) startWordSync(playingVerseKey);
        });

        return () => {
            stopWordSync();
        };
    }, [playingVerseKey, activeReciterId, stopWordSync, startWordSync]);

    return {
        audioRef,
        activeWord,
        isPlaying,
        isContinuous,
        loopMode,
        repeatCount,
        playingVerseKey,
        setLoopMode,
        handleVersePlay,
        handleSurahPlay,
        handleNextVerse,
        handlePreviousVerse,
        handlePause,
        handleResume,
        handleStop,
        handleAudioEnded
    };
}

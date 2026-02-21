import { useState, useRef, useEffect, useCallback } from 'react';
import { Verse } from '@/types/quran';

export type LoopMode = 'off' | '1' | '3' | 'infinity';

interface UseQuranAudioProps {
    verses: Verse[];
    autoplay?: boolean;
    pathname?: string;
    scrollToVerse?: (verseNum: number) => void;
}

export function useQuranAudio({ verses, autoplay = false, pathname, scrollToVerse }: UseQuranAudioProps) {
    // State
    const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    const [autoplayExecuted, setAutoplayExecuted] = useState(false);

    // Audio State
    const [isContinuous, setIsContinuous] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loopMode, setLoopMode] = useState<LoopMode>('off');
    const [repeatCount, setRepeatCount] = useState(0);

    // Audio Logic
    const handleStop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setPlayingVerseKey(null);
        setCurrentAudioUrl(null);
        setIsContinuous(false);
        setIsPlaying(false);
        setRepeatCount(0);
    }, []);

    const handlePause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    }, []);

    const handleResume = useCallback(() => {
        if (audioRef.current && currentAudioUrl) {
            setIsPlaying(true);
        }
    }, [currentAudioUrl]);

    const handleVersePlay = useCallback((verse: Verse, continuous = false) => {
        if (playingVerseKey === verse.verse_key) {
            if (isPlaying) {
                handlePause();
            } else {
                handleResume();
            }
        } else {
            setIsContinuous(continuous);
            setPlayingVerseKey(verse.verse_key);
            setCurrentAudioUrl(verse.audio.url);
            setIsPlaying(true);
            setRepeatCount(0);
        }
    }, [playingVerseKey, isPlaying, handlePause, handleResume]);

    const handleSurahPlay = useCallback(() => {
        if (playingVerseKey && isContinuous) {
            if (isPlaying) {
                handlePause();
            } else {
                handleResume();
            }
        } else {
            if (verses.length > 0) {
                handleVersePlay(verses[0], true);
                if (scrollToVerse) {
                    scrollToVerse(parseInt(verses[0].verse_key.split(':')[1]));
                }
            }
        }
    }, [playingVerseKey, isContinuous, isPlaying, handlePause, handleResume, verses, handleVersePlay, scrollToVerse]);

    const handleNextVerse = useCallback(() => {
        if (!playingVerseKey) return;
        const currentIndex = verses.findIndex(v => v.verse_key === playingVerseKey);
        if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            const nextVerse = verses[currentIndex + 1];
            setPlayingVerseKey(nextVerse.verse_key);
            setCurrentAudioUrl(nextVerse.audio.url);
            if (scrollToVerse) {
                scrollToVerse(parseInt(nextVerse.verse_key.split(':')[1]));
            }
            setIsPlaying(true);
            setRepeatCount(0);
        } else {
            handleStop();
        }
    }, [playingVerseKey, verses, scrollToVerse, handleStop]);

    const handlePrevVerse = useCallback(() => {
        if (!playingVerseKey) return;
        const currentIndex = verses.findIndex(v => v.verse_key === playingVerseKey);
        if (currentIndex > 0) {
            const prevVerse = verses[currentIndex - 1];
            setPlayingVerseKey(prevVerse.verse_key);
            setCurrentAudioUrl(prevVerse.audio.url);
            if (scrollToVerse) {
                scrollToVerse(parseInt(prevVerse.verse_key.split(':')[1]));
            }
            setIsPlaying(true);
            setRepeatCount(0);
        }
    }, [playingVerseKey, verses, scrollToVerse]);

    const handleAudioEnded = useCallback(() => {
        if (loopMode === 'infinity') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }

        const limit = loopMode === '1' ? 1 : loopMode === '3' ? 3 : 0;
        if (limit > 0 && repeatCount < limit) {
            setRepeatCount(prev => prev + 1);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }

        setRepeatCount(0);
        if (isContinuous) {
            handleNextVerse();
        } else {
            setIsPlaying(false);
            handleStop();
        }
    }, [loopMode, repeatCount, isContinuous, handleNextVerse, handleStop]);

    // Effects
    useEffect(() => {
        if (!audioRef.current) return;

        if (currentAudioUrl) {
            if (audioRef.current.src !== currentAudioUrl) {
                audioRef.current.src = currentAudioUrl;
            }

            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error('Playback error:', error);
                        }
                    });
                }
            } else {
                audioRef.current.pause();
            }
        } else {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    }, [currentAudioUrl, isPlaying]);

    useEffect(() => {
        const audioInstance = audioRef.current;
        return () => {
            if (audioInstance) {
                audioInstance.pause();
                audioInstance.src = "";
                audioInstance.load();
            }
        };
    }, [pathname]);

    useEffect(() => {
        if (autoplay && verses.length > 0 && !playingVerseKey && !autoplayExecuted) {
            const timer = setTimeout(() => {
                handleSurahPlay();
                setAutoplayExecuted(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoplay, verses, playingVerseKey, autoplayExecuted, handleSurahPlay]);

    return {
        audioRef,
        playingVerseKey,
        currentAudioUrl,
        isPlaying,
        isContinuous,
        loopMode,
        repeatCount,
        setLoopMode,
        handleStop,
        handlePause,
        handleResume,
        handleVersePlay,
        handleSurahPlay,
        handleNextVerse,
        handlePrevVerse,
        handleAudioEnded
    };
}

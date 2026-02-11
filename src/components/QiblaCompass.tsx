"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { calculateQiblaDirection, calculateDistanceToKaaba } from "@/lib/qibla";
import { KaabaIcon } from "@/components/icons/KaabaIcon";
import { Compass } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    webkitCompassHeading?: number;
}

export default function QiblaCompass() {
    // We use "display" states for the smooth CSS transition values
    const [compassRotate, setCompassRotate] = useState<number>(0);
    const [qiblaRelativeRotate, setQiblaRelativeRotate] = useState<number>(0);

    const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [aligned, setAligned] = useState<boolean>(false);
    const [noSensor, setNoSensor] = useState<boolean>(false);

    // Refs
    const lastHeadingRef = useRef<number>(0);
    const sensorCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const gotFirstEventRef = useRef<boolean>(false);
    const compassStartedRef = useRef<boolean>(false); // Prevent duplicate starts
    const orientationHandlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

    const { t } = useLocale();

    const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
        // Mark sensor as active
        gotFirstEventRef.current = true;
        if (sensorCheckTimeoutRef.current) {
            clearTimeout(sensorCheckTimeoutRef.current);
            sensorCheckTimeoutRef.current = null;
        }
        setNoSensor(false);

        let rawHeading: number | null = null;
        // ... (rest of logic remains the same)
        if ((e as DeviceOrientationEventiOS).webkitCompassHeading !== undefined) {
            rawHeading = (e as DeviceOrientationEventiOS).webkitCompassHeading!;
        } else if (e.alpha !== null) {
            rawHeading = 360 - e.alpha;
        }

        if (rawHeading === null) return;

        let delta = rawHeading - (lastHeadingRef.current % 360);
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        lastHeadingRef.current += delta;
        setCompassRotate(-lastHeadingRef.current);
    }, []);

    const getLocation = useCallback(() => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const bearing = calculateQiblaDirection(latitude, longitude);
                    const dist = calculateDistanceToKaaba(latitude, longitude);
                    setQiblaBearing(bearing);
                    setDistance(dist);
                    setLoading(false);
                },
                (err) => {
                    setError(t.qiblaLocationError);
                    setLoading(false);
                }
            );
        } else {
            setError(t.qiblaGeoError);
            setLoading(false);
        }
    }, [t]);

    const startCompass = useCallback(() => {
        // FIX: Prevent duplicate starts (glitching permission issue)
        if (compassStartedRef.current) return;
        compassStartedRef.current = true;

        setPermissionGranted(true);
        // Persist permission
        if (typeof window !== 'undefined') {
            localStorage.setItem('nawaetu_qibla_permission', 'granted');
        }

        // Reset state
        gotFirstEventRef.current = false;
        setNoSensor(false);

        // Start Sensor Listeners
        if ('ondeviceorientationabsolute' in window) {
            (window as any).addEventListener("deviceorientationabsolute", handleOrientation);
        } else {
            (window as any).addEventListener("deviceorientation", handleOrientation);
        }

        // Start Timeout to detect "No Sensor" devices (increased to 6s for slower devices)
        sensorCheckTimeoutRef.current = setTimeout(() => {
            if (!gotFirstEventRef.current) {
                setNoSensor(true);
                // Don't error out, just show alternative UI
            }
        }, 6000);

        getLocation();
    }, [handleOrientation, getLocation]);

    // FIX: Check persistence on mount - only run once, no dependency on startCompass
    useEffect(() => {
        const savedPermission = localStorage.getItem('nawaetu_qibla_permission');
        
        // Always try to init if permission was saved, regardless of compassStartedRef
        // This fixes the issue where app close/reopen didn't reinitialize
        if (savedPermission === 'granted') {
            const initCompass = async () => {
                // Double-check to prevent race conditions
                if (compassStartedRef.current) return;
                
                // iOS requires explicit permission request even if saved
                if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
                    try {
                        const response = await (DeviceOrientationEvent as any).requestPermission();
                        if (response !== "granted") {
                            localStorage.removeItem('nawaetu_qibla_permission');
                            setError(t.qiblaCompassDenied);
                            return;
                        }
                    } catch (e) {
                        // Permission dialog might have been interrupted
                        console.warn('Permission request failed:', e);
                    }
                }

                compassStartedRef.current = true;
                setPermissionGranted(true);
                gotFirstEventRef.current = false;
                setNoSensor(false);

                // Start Sensor Listeners
                const orientationHandler = (e: DeviceOrientationEvent) => {
                    // Mark sensor as active
                    gotFirstEventRef.current = true;
                    if (sensorCheckTimeoutRef.current) {
                        clearTimeout(sensorCheckTimeoutRef.current);
                        sensorCheckTimeoutRef.current = null;
                    }
                    setNoSensor(false);

                    let rawHeading: number | null = null;
                    if ((e as DeviceOrientationEventiOS).webkitCompassHeading !== undefined) {
                        rawHeading = (e as DeviceOrientationEventiOS).webkitCompassHeading!;
                    } else if (e.alpha !== null) {
                        rawHeading = 360 - e.alpha;
                    }

                    if (rawHeading === null) return;

                    let delta = rawHeading - (lastHeadingRef.current % 360);
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;

                    lastHeadingRef.current += delta;
                    setCompassRotate(-lastHeadingRef.current);
                };

                // Save handler reference for cleanup
                orientationHandlerRef.current = orientationHandler;

                if ('ondeviceorientationabsolute' in window) {
                    (window as any).addEventListener("deviceorientationabsolute", orientationHandler);
                } else {
                    (window as any).addEventListener("deviceorientation", orientationHandler);
                }

                // Start Timeout to detect "No Sensor" devices (increased to 6s)
                sensorCheckTimeoutRef.current = setTimeout(() => {
                    if (!gotFirstEventRef.current) {
                        setNoSensor(true);
                    }
                }, 6000);

                // Get location
                if ("geolocation" in navigator) {
                    setLoading(true);
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const bearing = calculateQiblaDirection(latitude, longitude);
                            const dist = calculateDistanceToKaaba(latitude, longitude);
                            setQiblaBearing(bearing);
                            setDistance(dist);
                            setLoading(false);
                        },
                        (err) => {
                            setError(t.qiblaLocationError);
                            setLoading(false);
                        }
                    );
                }
            };
            
            initCompass();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const requestCompassPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === "granted") {
                    startCompass();
                } else {
                    setError(t.qiblaCompassDenied);
                    localStorage.removeItem('nawaetu_qibla_permission'); // Reset if denied
                }
            } catch (e) {
                setError(t.qiblaCompassFailed);
            }
        } else {
            startCompass();
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            // Clear timeout
            if (sensorCheckTimeoutRef.current) {
                clearTimeout(sensorCheckTimeoutRef.current);
                sensorCheckTimeoutRef.current = null;
            }
            
            // Remove event listeners (both possible references)
            if (orientationHandlerRef.current) {
                window.removeEventListener("deviceorientation", orientationHandlerRef.current);
                if ('ondeviceorientationabsolute' in window) {
                    (window as any).removeEventListener("deviceorientationabsolute", orientationHandlerRef.current);
                }
                orientationHandlerRef.current = null;
            }
            
            window.removeEventListener("deviceorientation", handleOrientation);
            if ('ondeviceorientationabsolute' in window) {
                (window as any).removeEventListener("deviceorientationabsolute", handleOrientation);
            }
            
            // IMPORTANT: Reset flags for next mount (app close/reopen)
            // This allows the compass to reinitialize properly
            compassStartedRef.current = false;
            gotFirstEventRef.current = false;
        };
    }, [handleOrientation]);

    // FIX: Calculate Qibla relative rotation and alignment detection
    useEffect(() => {
        if (qiblaBearing === null) return;

        // Since dial is already counter-rotated by compassRotate (which keeps North at top),
        // Kaaba icon simply needs to point to the qibla bearing from North
        setQiblaRelativeRotate(qiblaBearing);

        // For alignment detection: check if device heading matches qibla bearing
        // compassRotate = -deviceHeading, so deviceHeading = -compassRotate
        const deviceHeading = ((-compassRotate % 360) + 360) % 360;
        
        // Calculate difference between device heading and qibla bearing
        let angleDiff = Math.abs(deviceHeading - qiblaBearing);
        // Handle 360°/0° wraparound (e.g., 359° vs 1° should be 2° diff, not 358°)
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        // Aligned if within ±8° threshold
        const isAligned = angleDiff <= 8;
        
        // Haptic feedback on alignment change
        if (isAligned && !aligned) {
            // Vibrate when becoming aligned
            if ('vibrate' in navigator) {
                navigator.vibrate([50, 30, 50]); // Pattern: vibrate-pause-vibrate
            }
        }
        
        setAligned(isAligned);
    }, [compassRotate, qiblaBearing, aligned]);

    if (loading) return <div className="text-white/60 animate-pulse text-center mt-20">{t.qiblaSearching}</div>;

    // No Sensor Fallback UI
    if (noSensor) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto z-50">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                    <Compass className="w-8 h-8 text-red-400 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sensor Tidak Ditemukan</h3>
                <p className="text-white/60 text-sm mb-6">
                    HP Anda sepertinya tidak memiliki sensor kompas (magnetometer). Fitur ini tidak dapat berjalan.
                </p>
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                >
                    Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full relative">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg text-sm text-center max-w-xs mx-auto mb-8 z-50">
                    {error}
                </div>
            )}

            {/* Permission Overlay */}
            {!permissionGranted && !error && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
                    <div className="w-20 h-20 bg-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-[rgb(var(--color-primary))]/20">
                        {/* Animated Compass Icon */}
                        <Compass className="w-10 h-10 text-[rgb(var(--color-primary-light))] animate-[spin_3s_linear_infinite]" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{t.qiblaPermissionTitle}</h3>
                    <p className="text-white/60 max-w-xs mb-10 leading-relaxed">
                        {t.qiblaPermissionDesc}
                    </p>

                    <Button
                        onClick={requestCompassPermission}
                        className="bg-[rgb(var(--color-primary-dark))] hover:bg-[rgb(var(--color-primary))] text-white rounded-full px-10 py-7 text-lg font-medium shadow-[0_0_30px_rgba(var(--color-primary),0.25)] transition-all hover:scale-105 active:scale-95"
                    >
                        {t.qiblaPermissionButton}
                    </Button>
                </div>
            )}

            {qiblaBearing !== null && (
                <>
                    {/* COMPASS CONTAINER */}
                    <div className="relative flex items-center justify-center w-[85vw] h-[85vw] max-w-[320px] max-h-[320px] md:max-w-[360px] md:max-h-[360px]">

                        {/* 1. FIX: Radial Gradient Ambient Glow (No Boxy Edges) */}
                        {/* Scales up significantly when aligned to fill screen with theme vibe */}
                        <div
                            className={`absolute inset-[-50%] rounded-full transition-all duration-700 ease-out z-0 pointer-events-none ${aligned ? 'opacity-100 scale-150 animate-pulse' : 'opacity-0 scale-90'}`}
                            style={{
                                background: aligned
                                    ? 'radial-gradient(circle at center, rgba(var(--color-primary),0.35) 0%, rgba(var(--color-primary),0.15) 40%, rgba(var(--color-primary),0.05) 60%, transparent 75%)'
                                    : 'none'
                            }}
                        />
                        
                        {/* Success Rings Animation */}
                        {aligned && (
                            <>
                                <div className="absolute inset-[-30%] rounded-full border-2 border-[rgb(var(--color-primary))]/30 animate-[ping_2s_ease-out_infinite]" />
                                <div className="absolute inset-[-40%] rounded-full border border-[rgb(var(--color-primary))]/20 animate-[ping_2.5s_ease-out_infinite]" style={{ animationDelay: '0.3s' }} />
                            </>
                        )}

                        {/* MAIN ROTATING DIAL */}
                        <div
                            className="absolute inset-0 will-change-transform z-10 transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                            style={{
                                '--compass-rotate': `${compassRotate}deg`,
                                transform: 'rotate(var(--compass-rotate))'
                            } as React.CSSProperties}
                        >
                            {/* Dial Background */}
                            <div className={`w-full h-full rounded-full border-2 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm transition-all duration-500 ${aligned ? 'border-[rgb(var(--color-primary))] shadow-[0_0_50px_rgba(var(--color-primary),0.5),inset_0_0_30px_rgba(var(--color-primary),0.15)]' : 'border-white/10'}`}>
                                {/* Cardinal Points */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[rgb(var(--color-primary-light))] font-bold text-lg md:text-xl transform -translate-y-1">N</div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 font-medium md:text-lg transform translate-y-1">S</div>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-medium md:text-lg transform -translate-x-1">W</div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium md:text-lg transform translate-x-1">E</div>

                                {/* Ticks */}
                                <div
                                    className="absolute inset-4 rounded-full opacity-30"
                                    style={{
                                        background: `repeating-conic-gradient(from 0deg, rgba(255,255,255,0.5) 0deg 0.5deg, transparent 0.5deg 5deg)`,
                                        maskImage: 'radial-gradient(transparent 65%, black 70%)',
                                        WebkitMaskImage: 'radial-gradient(transparent 65%, black 70%)'
                                    }}
                                />
                            </div>

                            {/* KAABA ICON */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    '--qibla-rotate': `${qiblaRelativeRotate}deg`,
                                    transform: 'rotate(var(--qibla-rotate))'
                                } as React.CSSProperties}
                            >
                                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                                    {/* 2. FIX: Radar Ping Animation */}
                                    <div className={`relative transition-all duration-700 flex items-center justify-center transform ${aligned ? 'scale-150' : 'scale-100'}`}>

                                        {/* Ping Rings */}
                                        {aligned && (
                                            <>
                                                <div className="absolute w-[120%] h-[120%] bg-[rgb(var(--color-primary))]/40 rounded-full animate-ping opacity-75" />
                                                <div className="absolute w-[160%] h-[160%] border-2 border-[rgb(var(--color-primary))]/50 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                                <div className="absolute w-[200%] h-[200%] border border-[rgb(var(--color-primary))]/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.4s' }} />
                                            </>
                                        )}

                                        <KaabaIcon className={`w-12 h-12 md:w-14 md:h-14 drop-shadow-2xl relative z-10 transition-all duration-300 ${aligned ? 'opacity-100 brightness-110 drop-shadow-[0_0_15px_rgba(var(--color-primary),0.8)] text-[rgb(var(--color-primary-light))]' : 'opacity-80 text-zinc-900'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CENTER ORNAMENT */}
                        <div className={`absolute w-5 h-5 rounded-full backdrop-blur-md z-20 border-2 flex items-center justify-center transition-all duration-500 ${aligned ? 'bg-[rgb(var(--color-primary))]/40 border-[rgb(var(--color-primary))] shadow-[0_0_20px_rgba(var(--color-primary),0.8)] scale-125' : 'bg-white/20 border-white/10 shadow-lg scale-100'}`}>
                            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${aligned ? 'bg-[rgb(var(--color-primary-light))] animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-light),0.8)]' : 'bg-white/50'}`} />
                        </div>

                        {/* TOP INDICATOR */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
                            <div className={`w-1.5 rounded-full transition-all duration-500 ${aligned ? 'bg-[rgb(var(--color-primary-light))] h-6 shadow-[0_0_25px_rgb(var(--color-primary-light))] animate-pulse' : 'bg-white/30 h-3'}`} />
                        </div>
                    </div>

                    {/* STATUS DISPLAY */}
                    <div className="mt-16 text-center space-y-4 z-30">
                        {/* 3. FIX: Text Animation (Scale + Glow) */}
                        <div className={`transition-all duration-500 transform ${aligned ? 'scale-110' : 'scale-100'}`}>
                            <h2 className={`text-2xl md:text-3xl font-bold tracking-[0.3em] transition-all duration-300 uppercase ${aligned ? 'text-[rgb(var(--color-primary-light))] drop-shadow-[0_0_30px_rgba(var(--color-primary),0.9)] animate-pulse' : 'text-white/70'}`}>
                                {aligned ? '✓ ' + t.qiblaAligned : t.qiblaFinding}
                            </h2>
                        </div>
                        
                        {/* Alignment Success Badge */}
                        {aligned && (
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[rgb(var(--color-primary))]/20 border-2 border-[rgb(var(--color-primary))]/50 backdrop-blur-sm shadow-[0_0_20px_rgba(var(--color-primary),0.4)] animate-pulse">
                                <div className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-primary-light))] animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-light),0.8)]" />
                                <span className="text-sm font-semibold text-[rgb(var(--color-primary-light))] tracking-wide">
                                    {t.qiblaAligned === 'ALIGNED' ? 'Perfect Direction' : 'Arah Tepat'}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-1">
                            <div className="text-5xl font-mono font-bold text-white tracking-tighter">
                                {Math.round((-compassRotate + 3600) % 360)}°
                            </div>
                            {distance && (
                                <div className="text-sm text-white/70 font-medium bg-white/5 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm mt-2">
                                    {t.qiblaDistance?.replace("{distance}", distance.toLocaleString())}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { calculateQiblaDirection, calculateDistanceToKaaba } from "@/lib/qibla";
import { KaabaIcon } from "@/components/icons/KaabaIcon";
import { Compass } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    webkitCompassHeading?: number;
}

function QiblaCompass() {
    const [isClient, setIsClient] = useState<boolean>(false);

    // We use "display" states for the smooth CSS transition values
    const [compassRotate, setCompassRotate] = useState<number>(0);
    const [qiblaRelativeRotate, setQiblaRelativeRotate] = useState<number>(0);

    const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [aligned, setAligned] = useState<boolean>(false);
    const [noSensor, setNoSensor] = useState<boolean>(false);
    const [showSessionNote, setShowSessionNote] = useState<boolean>(true);

    // Refs
    const lastHeadingRef = useRef<number>(0);
    const sensorCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const gotFirstEventRef = useRef<boolean>(false);
    const compassStartedRef = useRef<boolean>(false); // Prevent duplicate starts
    const orientationHandlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
    const smoothHeadingRef = useRef<number>(0);
    const lastUpdateRef = useRef<number>(0);

    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const applyHeading = useCallback((rawHeading: number) => {
        const now = performance.now();
        if (now - lastUpdateRef.current < 33) return; // ~30fps cap
        lastUpdateRef.current = now;

        let delta = rawHeading - (lastHeadingRef.current % 360);
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        lastHeadingRef.current += delta;

        const diff = lastHeadingRef.current - smoothHeadingRef.current;
        smoothHeadingRef.current += diff * 0.18;

        setCompassRotate(-smoothHeadingRef.current);
    }, []);

    const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
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

        applyHeading(rawHeading);
    }, [applyHeading]);

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


        // Reset heading for fresh start
        lastHeadingRef.current = 0;
        smoothHeadingRef.current = 0;
        lastUpdateRef.current = 0;
        compassStartedRef.current = true;

        setPermissionGranted(true);
        // Persist permission
        if (typeof window !== 'undefined') {
            localStorage.setItem('nawaetu_qibla_permission', 'granted');
            sessionStorage.setItem('nawaetu_qibla_session', 'active'); // Mark session as active
        }

        // Reset state
        gotFirstEventRef.current = false;
        setNoSensor(false);
        setError(null);

        // Start Sensor Listeners
        const eventType = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';

        if (eventType === 'deviceorientationabsolute') {
            (window as any).addEventListener("deviceorientationabsolute", handleOrientation, { passive: true, capture: true });
        } else {
            window.addEventListener("deviceorientation", handleOrientation, { passive: true, capture: true });
        }

        // Start Timeout to detect "No Sensor" devices
        sensorCheckTimeoutRef.current = setTimeout(() => {
            if (!gotFirstEventRef.current) {
                setNoSensor(true);
            } else {
            }
        }, 10000);

        getLocation();
    }, [handleOrientation, getLocation]);

    // FIX: Permission check on mount - auto-init within same session
    useEffect(() => {
        setIsClient(true);
        const savedPermission = localStorage.getItem('nawaetu_qibla_permission');
        const sessionActive = sessionStorage.getItem('nawaetu_qibla_session');
        setShowSessionNote(sessionActive !== 'active');


        // Auto-init if permission granted AND session is active (not app restart)
        // This allows seamless navigation between pages without re-clicking button
        if (savedPermission === 'granted' && sessionActive === 'active') {
            setPermissionGranted(true);
            setLoading(true);

            const initCompass = async () => {
                if (compassStartedRef.current) return;

                lastHeadingRef.current = 0;
                smoothHeadingRef.current = 0;
                lastUpdateRef.current = 0;

                // For iOS, permission API might still need to be called but won't show dialog
                let permissionGrantedFlag = true;
                if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
                    try {
                        const response = await (DeviceOrientationEvent as any).requestPermission();
                        if (response !== "granted") {
                            localStorage.removeItem('nawaetu_qibla_permission');
                            sessionStorage.removeItem('nawaetu_qibla_session');
                            setError(t.qiblaCompassDenied);
                            setPermissionGranted(false); // Revert optimistic state
                            setLoading(false);
                            permissionGrantedFlag = false;
                            return;
                        }
                    } catch (e) {
                        // If error (no user gesture), fallback to showing button
                        sessionStorage.removeItem('nawaetu_qibla_session');
                        setPermissionGranted(false); // Revert optimistic state
                        setLoading(false);
                        return; // Show permission button
                    }
                }

                if (!permissionGrantedFlag) return;

                compassStartedRef.current = true;
                // permissionGranted already set to true in initial state
                gotFirstEventRef.current = false;
                setNoSensor(false);
                setError(null);

                // Start Sensor Listeners
                const orientationHandler = (e: DeviceOrientationEvent) => {
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

                    applyHeading(rawHeading);
                };

                orientationHandlerRef.current = orientationHandler;

                const eventType = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';

                if (eventType === 'deviceorientationabsolute') {
                    (window as any).addEventListener(eventType, orientationHandler, { passive: true, capture: true });
                } else {
                    window.addEventListener(eventType, orientationHandler, { passive: true, capture: true });
                }

                sensorCheckTimeoutRef.current = setTimeout(() => {
                    if (!gotFirstEventRef.current) {
                        setNoSensor(true);
                        setLoading(false);
                    } else {
                    }
                }, 10000);

                // Get location
                if ("geolocation" in navigator) {
                    // Loading already true from initial state
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const bearing = calculateQiblaDirection(latitude, longitude);
                            const dist = calculateDistanceToKaaba(latitude, longitude);
                            setQiblaBearing(bearing);
                            setDistance(dist);
                            setLoading(false); // Stop loading after location received
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
            };

            initCompass();
        } else if (savedPermission === 'granted' && !sessionActive) {
            // Make sure loading is false if we're showing button
            setLoading(false);
        } else {
            setLoading(false);
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
                    localStorage.removeItem('nawaetu_qibla_permission');
                    sessionStorage.removeItem('nawaetu_qibla_session'); // Clear session too
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

            // Reset flags for next mount within same session
            // NOTE: DON'T remove sessionStorage here - that persists across component mounts
            // sessionStorage only gets cleared on app restart (browser/PWA close)
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

    if (!isClient || loading) return <div className={cn(
        "animate-pulse text-center mt-20 transition-colors",
        isDaylight ? "text-slate-400" : "text-white/60"
    )}>{t.qiblaSearching}</div>;

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
                    className={cn(
                        "transition-all",
                        isDaylight ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-white/10 text-white hover:bg-white/10"
                    )}
                >
                    Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full relative pb-16">
            {error && (
                <div className={cn(
                    "border p-4 rounded-lg text-sm text-center max-w-xs mx-auto mb-8 z-50",
                    isDaylight ? "bg-red-50 border-red-100 text-red-600" : "bg-red-500/10 border-red-500/20 text-red-200"
                )}>
                    {error}
                </div>
            )}

            {/* Permission Overlay */}
            {!permissionGranted && !error && (
                <div className={cn(
                    "fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500",
                    isDaylight ? "bg-white" : "bg-[#0a0a0a]"
                )}>
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-6 ring-1 transition-all",
                        isDaylight ? "bg-emerald-50 ring-emerald-100" : "bg-[rgb(var(--color-primary))]/10 ring-[rgb(var(--color-primary))]/20"
                    )}>
                        <Compass className={cn(
                            "w-10 h-10 animate-[spin_3s_linear_infinite]",
                            isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light))]"
                        )} />
                    </div>

                    <h3 className={cn("text-2xl font-bold mb-3 tracking-tight", isDaylight ? "text-slate-900" : "text-white")}>{t.qiblaPermissionTitle}</h3>
                    <p className={cn("max-w-xs mb-4 leading-relaxed", isDaylight ? "text-slate-500" : "text-white/60")}>
                        {t.qiblaPermissionDesc}
                    </p>

                    {/* Important Note - only show if no active session (app restart) */}
                    {showSessionNote && (
                        <div className={cn(
                            "mb-8 px-4 py-3 border rounded-lg max-w-sm",
                            isDaylight ? "bg-amber-50 border-amber-100" : "bg-yellow-500/10 border-yellow-500/20"
                        )}>
                            <p className={cn("text-xs leading-relaxed", isDaylight ? "text-amber-800" : "text-yellow-200/80")}>
                                <strong className={isDaylight ? "text-amber-900" : "text-yellow-200"}>Penting:</strong> Setelah app di-close, klik tombol ini lagi untuk mengaktifkan kompas. Browser perlu izin ulang untuk akses sensor.
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={requestCompassPermission}
                        className={cn(
                            "rounded-full px-10 py-7 text-lg font-medium transition-all hover:scale-105 active:scale-95",
                            isDaylight
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                                : "bg-[rgb(var(--color-primary-dark))] hover:bg-[rgb(var(--color-primary))] text-white shadow-[0_0_30px_rgba(var(--color-primary),0.25)]"
                        )}
                    >
                        {t.qiblaPermissionButton}
                    </Button>
                </div>
            )}

            {qiblaBearing !== null && (
                <CompassDisplay
                    compassRotate={compassRotate}
                    qiblaRelativeRotate={qiblaRelativeRotate}
                    aligned={aligned}
                    distance={distance}
                    isDaylight={isDaylight}
                    t={t}
                />
            )}
        </div>
    );
}

// Memoized compass display component to prevent unnecessary re-renders
const CompassDisplay = memo(({
    compassRotate,
    qiblaRelativeRotate,
    aligned,
    distance,
    isDaylight,
    t
}: {
    compassRotate: number;
    qiblaRelativeRotate: number;
    aligned: boolean;
    distance: number | null;
    isDaylight: boolean;
    t: any;
}) => {
    const displayDegrees = Math.round((-compassRotate + 3600) % 360);

    return (
        <>
            {/* COMPASS CONTAINER */}
            <div className="relative flex items-center justify-center w-[85vw] h-[85vw] max-w-[320px] max-h-[320px] md:max-w-[360px] md:max-h-[360px]">

                {/* 1. FIX: Radial Gradient Ambient Glow (No Boxy Edges) */}
                {/* Scales up significantly when aligned to fill screen with theme vibe */}
                <div
                    className={cn(
                        "absolute inset-[-35%] rounded-full transition-all duration-700 ease-out z-0 pointer-events-none",
                        aligned ? "opacity-100 scale-125 animate-pulse" : "opacity-0 scale-90"
                    )}
                    style={{
                        background: aligned
                            ? isDaylight
                                ? 'radial-gradient(circle at center, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 40%, transparent 75%)'
                                : 'radial-gradient(circle at center, rgba(var(--color-primary),0.35) 0%, rgba(var(--color-primary),0.15) 40%, rgba(var(--color-primary),0.05) 60%, transparent 75%)'
                            : 'none'
                    }}
                />

                {/* Success Rings Animation */}
                {aligned && (
                    <>
                        <div className={cn(
                            "absolute inset-[-20%] rounded-full border-2 animate-[ping_2s_ease-out_infinite]",
                            isDaylight ? "border-emerald-500/20" : "border-[rgb(var(--color-primary))]/30"
                        )} />
                        <div className={cn(
                            "absolute inset-[-30%] rounded-full border animate-[ping_2.5s_ease-out_infinite]",
                            isDaylight ? "border-emerald-500/10" : "border-[rgb(var(--color-primary))]/20"
                        )} style={{ animationDelay: '0.3s' }} />
                    </>
                )}

                {/* MAIN ROTATING DIAL */}
                <div
                    className="absolute inset-0 will-change-transform z-10"
                    style={{
                        transform: `rotate(${compassRotate}deg) translateZ(0)`,
                        transition: 'transform 400ms cubic-bezier(0.25,0.46,0.45,0.94)'
                    }}
                >
                    {/* Dial Background */}
                    <div className={cn(
                        "w-full h-full rounded-full border-2 transition-all duration-500 backdrop-blur-sm",
                        isDaylight
                            ? aligned
                                ? "bg-emerald-50/50 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                                : "bg-white border-slate-200/60 shadow-lg shadow-slate-200/50"
                            : aligned
                                ? "bg-gradient-to-b from-white/10 to-transparent border-[rgb(var(--color-primary))] shadow-[0_0_50px_rgba(var(--color-primary),0.5),inset_0_0_30px_rgba(var(--color-primary),0.15)]"
                                : "bg-gradient-to-b from-white/10 to-transparent border-white/10"
                    )}>
                        {/* Cardinal Points */}
                        <div className={cn(
                            "absolute top-4 left-1/2 -translate-x-1/2 font-bold text-lg md:text-xl transform -translate-y-1 transition-colors",
                            isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                        )}>N</div>
                        <div className={cn(
                            "absolute bottom-4 left-1/2 -translate-x-1/2 font-medium md:text-lg transform translate-y-1",
                            isDaylight ? "text-slate-400" : "text-white/60"
                        )}>S</div>
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 font-medium md:text-lg transform -translate-x-1",
                            isDaylight ? "text-slate-400" : "text-white/60"
                        )}>W</div>
                        <div className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 font-medium md:text-lg transform translate-x-1",
                            isDaylight ? "text-slate-400" : "text-white/60"
                        )}>E</div>

                        {/* Ticks */}
                        <div
                            className={cn(
                                "absolute inset-4 rounded-full transition-opacity",
                                isDaylight ? "opacity-15" : "opacity-30"
                            )}
                            style={{
                                background: isDaylight
                                    ? `repeating-conic-gradient(from 0deg, #1e293b 0deg 0.5deg, transparent 0.5deg 5deg)`
                                    : `repeating-conic-gradient(from 0deg, rgba(255,255,255,0.5) 0deg 0.5deg, transparent 0.5deg 5deg)`,
                                maskImage: 'radial-gradient(transparent 65%, black 70%)',
                                WebkitMaskImage: 'radial-gradient(transparent 65%, black 70%)'
                            }}
                        />
                    </div>

                    {/* KAABA ICON */}
                    <div
                        className="absolute inset-0"
                        style={{
                            transform: `rotate(${qiblaRelativeRotate}deg) translateZ(0)`
                        }}
                    >
                        <div className="absolute top-8 left-1/2 -translate-x-1/2">
                            {/* 2. FIX: Radar Ping Animation */}
                            <div className={`relative transition-all duration-700 flex items-center justify-center transform ${aligned ? 'scale-125' : 'scale-100'}`}>

                                {/* Ping Rings */}
                                {aligned && (
                                    <>
                                        <div className={cn(
                                            "absolute w-[110%] h-[110%] rounded-full animate-ping opacity-75",
                                            isDaylight ? "bg-emerald-400/30" : "bg-[rgb(var(--color-primary))]/40"
                                        )} />
                                        <div className={cn(
                                            "absolute w-[140%] h-[140%] border-2 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]",
                                            isDaylight ? "border-emerald-400/20" : "border-[rgb(var(--color-primary))]/50"
                                        )} />
                                    </>
                                )}

                                <KaabaIcon className={cn(
                                    "w-12 h-12 md:w-14 md:h-14 drop-shadow-2xl relative z-10 transition-all duration-300",
                                    aligned
                                        ? isDaylight
                                            ? "opacity-100 brightness-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] text-emerald-600"
                                            : "opacity-100 brightness-110 drop-shadow-[0_0_15px_rgba(var(--color-primary),0.8)] text-[rgb(var(--color-primary-light))]"
                                        : isDaylight ? "opacity-60 text-slate-400" : "opacity-80 text-zinc-900"
                                )} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER ORNAMENT */}
                <div className={cn(
                    "absolute w-5 h-5 rounded-full z-20 border-2 flex items-center justify-center transition-all duration-500",
                    aligned
                        ? isDaylight
                            ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-125"
                            : "bg-[rgb(var(--color-primary))]/40 border-[rgb(var(--color-primary))] shadow-[0_0_20px_rgba(var(--color-primary),0.8)] scale-125"
                        : isDaylight ? "bg-white border-slate-200 shadow-sm scale-100" : "bg-white/20 border-white/10 shadow-lg scale-100"
                )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full transition-all duration-500",
                        aligned
                            ? isDaylight ? "bg-white animate-pulse" : "bg-[rgb(var(--color-primary-light))] animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-light),0.8)]"
                            : isDaylight ? "bg-slate-300" : "bg-white/50"
                    )} />
                </div>

                {/* TOP INDICATOR */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
                    <div className={cn(
                        "w-1.5 rounded-full transition-all duration-500",
                        aligned
                            ? isDaylight
                                ? "bg-emerald-500 h-6 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                                : "bg-[rgb(var(--color-primary-light))] h-6 shadow-[0_0_25px_rgb(var(--color-primary-light))] animate-pulse"
                            : isDaylight ? "bg-slate-300 h-3" : "bg-white/30 h-3"
                    )} />
                </div>
            </div>

            {/* STATUS DISPLAY */}
            <div className="mt-10 text-center space-y-3 z-30">
                {/* 3. FIX: Text Animation (Scale + Glow) */}
                <div className={`transition-all duration-500 transform ${aligned ? 'scale-105' : 'scale-100'}`}>
                    <h2 className={cn(
                        "text-xl md:text-2xl lg:text-3xl font-bold tracking-[0.22em] transition-all duration-300 uppercase",
                        aligned
                            ? isDaylight
                                ? "text-emerald-600 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                : "text-[rgb(var(--color-primary-light))] drop-shadow-[0_0_24px_rgba(var(--color-primary),0.7)]"
                            : isDaylight ? "text-slate-400" : "text-white/70"
                    )}>
                        {aligned ? '✓ ' + t.qiblaAligned : t.qiblaFinding}
                    </h2>
                </div>

                {/* Alignment Success Badge */}
                {aligned && (
                    <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all shadow-sm",
                        isDaylight
                            ? "bg-emerald-50 border-emerald-100 shadow-emerald-100/50"
                            : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/40 shadow-[0_0_16px_rgba(var(--color-primary),0.35)]"
                    )}>
                        <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]",
                            isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary-light))]"
                        )} />
                        <span className={cn(
                            "text-sm font-semibold tracking-wide",
                            isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                        )}>
                            {t.qiblaAlignedBadge}
                        </span>
                    </div>
                )}

                <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                        "text-5xl font-mono font-bold tracking-tighter transition-colors",
                        isDaylight ? "text-slate-800" : "text-white"
                    )}>
                        {displayDegrees}°
                    </div>
                </div>

                <div className={cn(
                    "mt-3 max-w-xs md:max-w-md text-[9px] md:text-xs leading-relaxed border rounded-lg px-3 py-2 backdrop-blur-sm transition-all",
                    isDaylight ? "bg-white border-slate-100 text-slate-500 shadow-sm" : "bg-white/5 border-white/10 text-white/70"
                )}>
                    <div className="space-y-1">
                        {distance && (
                            <div className={isDaylight ? "text-slate-400" : "text-white/55"}>
                                {t.qiblaDistance?.replace("{distance}", distance.toLocaleString())}
                            </div>
                        )}
                        <div>
                            <span className={isDaylight ? "text-slate-400" : "text-white/70"}>{t.qiblaDalilQuranRef} · </span>
                            <span>{t.qiblaDalilQuranText}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

CompassDisplay.displayName = 'CompassDisplay';

export default memo(QiblaCompass);

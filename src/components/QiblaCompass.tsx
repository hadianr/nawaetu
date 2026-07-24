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

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { calculateQiblaDirection, calculateDistanceToKaaba } from "@/lib/qibla";
import { Compass } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import CompassDisplay from "./QiblaCompassDisplay";
import { QiblaPermissionPrompt } from "./QiblaPermissionPrompt";

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

        // Alignment detection logic

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
            <QiblaPermissionPrompt
                permissionGranted={permissionGranted}
                error={error}
                showSessionNote={showSessionNote}
                isDaylight={isDaylight}
                t={t}
                requestCompassPermission={requestCompassPermission}
            />

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


export default memo(QiblaCompass);

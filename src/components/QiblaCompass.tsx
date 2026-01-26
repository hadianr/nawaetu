"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { calculateQiblaDirection } from "@/lib/qibla";
import { KaabaIcon } from "@/components/icons/KaabaIcon";

export default function QiblaCompass() {
    const [heading, setHeading] = useState<number>(0);
    const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [aligned, setAligned] = useState<boolean>(false);

    useEffect(() => {
        // Get User Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const bearing = calculateQiblaDirection(latitude, longitude);
                    setQiblaBearing(bearing);
                    setLoading(false);
                },
                (err) => {
                    setError("Izin lokasi diperlukan untuk menghitung arah kiblat.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation tidak didukung di browser ini.");
            setLoading(false);
        }
    }, []);

    const requestCompassPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === "granted") {
                    setPermissionGranted(true);
                    window.addEventListener("deviceorientation", handleOrientation);
                } else {
                    setError("Izin kompas ditolak.");
                }
            } catch (e) {
                setError("Gagal meminta izin kompas.");
            }
        } else {
            setPermissionGranted(true);
            window.addEventListener("deviceorientation", handleOrientation);
        }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
        let compass = e.webkitCompassHeading || Math.abs(e.alpha! - 360);
        setHeading(compass);
    };

    useEffect(() => {
        if (qiblaBearing !== null) {
            const diff = Math.abs(heading - qiblaBearing);
            // Adjusted logical check for 360 wrap-around
            const isAligned = diff < 5 || diff > 355;

            if (isAligned && !aligned) {
                // Haptic feedback if supported
                if (navigator.vibrate) navigator.vibrate(50);
                setAligned(true);
            } else if (!isAligned && aligned) {
                setAligned(false);
            }
        }
    }, [heading, qiblaBearing, aligned]);

    useEffect(() => {
        return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
        };
    }, []);

    // Use this to rotate the arrow to point to Qibla relative to North
    const arrowRotation = qiblaBearing ? qiblaBearing - heading : 0;
    // Rotate the compass rose opposite to heading so North stays North
    const compassRotation = -heading;

    if (loading) return <div className="text-white/60 animate-pulse">Mencari lokasi...</div>;

    return (
        <div className="flex flex-col items-center gap-12 relative z-10 w-full max-w-sm mx-auto py-10">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            {!permissionGranted && !error && (
                <div className="text-center space-y-4">
                    <p className="text-white/80">Izinkan akses sensor gerak/kompas untuk akurasi terbaik.</p>
                    <Button
                        onClick={requestCompassPermission}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        Aktifkan Kompas
                    </Button>
                </div>
            )}

            {qiblaBearing !== null && (
                <div className="relative w-72 h-72 flex items-center justify-center">

                    {/* Outer Glow Ring (Green when aligned) */}
                    <div
                        className={`absolute inset-[-20px] rounded-full blur-2xl transition-all duration-500 ${aligned ? 'bg-emerald-500/30' : 'bg-emerald-500/5'}`}
                    />

                    {/* Main Compass Circle (Rose) - Rotates with device */}
                    <div
                        className={`absolute inset-0 rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-transform duration-300 ease-out shadow-2xl ${aligned ? 'border-emerald-500/50' : ''}`}
                        style={{ transform: `rotate(${compassRotation}deg)` }}
                    >
                        {/* Cardinal Points */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-emerald-400 font-bold text-lg">N</div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 font-medium">S</div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-medium">W</div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-medium">E</div>

                        {/* Detailed Ticks */}
                        {Array.from({ length: 72 }).map((_, i) => {
                            const deg = i * 5;
                            const isCardinal = deg % 90 === 0;
                            const isMajor = deg % 30 === 0;
                            return (
                                <div
                                    key={i}
                                    className={`absolute left-1/2 top-0 origin-bottom-center`}
                                    style={{
                                        height: '50%', // Logic to position tick at edge
                                        transform: `translateX(-50%) rotate(${deg}deg)`
                                    }}
                                >
                                    <div className={`w-full ${isCardinal ? 'h-3 bg-emerald-500/50' : isMajor ? 'h-2 bg-white/20' : 'h-1 bg-white/10'}`} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Qibla Indicator (Kaaba) - Stays fixed relative to Qibla bearing */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out z-20"
                        style={{ transform: `rotate(${arrowRotation}deg)` }}
                    >
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            {/* Visual Indicator Line */}
                            <div className={`w-1 h-4 mb-2 rounded-full transition-colors ${aligned ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-white/50'}`} />

                            {/* Kaaba Icon */}
                            <div className="relative">
                                <div className={`absolute inset-0 bg-emerald-400 blur-lg transition-opacity duration-300 ${aligned ? 'opacity-50' : 'opacity-0'}`} />
                                <KaabaIcon className={`w-12 h-12 text-zinc-900 drop-shadow-lg transition-transform ${aligned ? 'scale-110' : 'scale-100'}`} />
                            </div>
                        </div>
                    </div>

                    {/* Center Ornament */}
                    <div className="w-16 h-16 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${aligned ? 'bg-emerald-400' : 'bg-white/30'}`} />
                    </div>
                </div>
            )}

            {qiblaBearing !== null && (
                <div className="text-center space-y-1">
                    <div className="text-sm text-white/50 uppercase tracking-widest font-medium">Arah Kiblat</div>
                    <div className="text-4xl font-bold font-mono text-emerald-400">
                        {qiblaBearing.toFixed(0)}°
                    </div>
                    <p className="text-xs text-white/40">dari Utara</p>
                </div>
            )}
        </div>
    );
}

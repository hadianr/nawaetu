
"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";

export default function NotificationDebugPage() {
    if (process.env.NODE_ENV === "production") {
        notFound();
    }

    const [token, setToken] = useState<string | null>(null);
    const [dbStatus, setDbStatus] = useState<any>(null);
    const [sendResult, setSendResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<string>("default");
    const [errorLog, setErrorLog] = useState<string[]>([]);

    const [lastMessage, setLastMessage] = useState<any>(null);

    // Capture console logs
    useEffect(() => {
        // Intentionally empty after log cleanup.
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            if ("Notification" in window) {
                setPermission(Notification.permission);
            } else {
                setPermission("unsupported");
            }
            const storedToken = localStorage.getItem("fcm_token");
            if (storedToken) setToken(storedToken);

            // Listen for foreground messages
            import("@/lib/notifications/fcm-init").then(({ messaging, onMessage }) => {
                if (messaging) {
                    onMessage(messaging, (payload) => {
                        setLastMessage(payload);
                        // Trigger a local toast/notification for visual confirmation
                        if (payload.notification) {
                            const title = payload.notification.title || "Foreground Msg";
                            const options = { body: payload.notification.body };

                            if (navigator.serviceWorker) {
                                navigator.serviceWorker.ready.then(reg => {
                                    reg.showNotification(title, options);
                                }).catch(() => {
                                    try { new Notification(title, options); } catch (e) { }
                                });
                            } else {
                                try { new Notification(title, options); } catch (e) { }
                            }
                        }
                    });
                }
            });
        }
    }, []);

    const handleGetToken = async () => {
        setLoading(true);
        try {
            // CRITICAL: Request permission FIRST before any async jumps to preserve "User Gesture" context
            if (typeof window !== "undefined" && "Notification" in window) {
                const permission = await Notification.requestPermission();
                setPermission(permission);
                if (permission !== "granted") {
                    alert("Permission denied or dismissed.");
                    setLoading(false);
                    return;
                }
            }

            // Now do the heavy lifting
            const { registerServiceWorkerAndGetToken } = await import("@/lib/notifications/fcm-init");
            const currentToken = await registerServiceWorkerAndGetToken();

            if (currentToken) {
                setToken(currentToken);

                // CRITICAL: Also sync with backend from debug page
                const userLocationKey = "user_location";
                const storage = localStorage.getItem(userLocationKey);
                let userLocation = null;
                if (storage) {
                    try {
                        const parsed = JSON.parse(storage);
                        if (parsed.lat && parsed.lng) {
                            userLocation = { lat: parsed.lat, lng: parsed.lng };
                        }
                    } catch (e) { }
                }

                await fetch("/api/notifications/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token: currentToken,
                        deviceType: "web",
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        userLocation: userLocation
                    }),
                });
            } else {
                alert("Failed to get token. Check console for details. (Messaging might not be initialized or permission denied)");
            }
        } catch (err) {
            alert("Error retrieving token: " + err);
        } finally {
            setLoading(false);
        }
    };

    const checkDbStatus = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications/debug/check?token=${token}`);
            const data = await res.json();
            setDbStatus(data);
        } catch (e: any) {
            setDbStatus({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    const [manualToken, setManualToken] = useState("");

    const sendTestNotification = async () => {
        const targetToken = manualToken || token;
        if (!targetToken) return;

        // Countdown sequence (only if sending to self for dramatic effect, but fine to keep)
        if (!manualToken) {
            for (let i = 5; i > 0; i--) {
                setLoading(true);
                setSendResult({ message: `Sending in ${i}s... QUICKLY CLOSE THE APP NOW!` });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        setLoading(true);
        setSendResult({ message: `Sending to ${manualToken ? 'Manual Token' : 'This Device'}...` });

        try {
            const res = await fetch("/api/notifications/debug/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: targetToken }),
            });
            const data = await res.json();
            setSendResult(data);
        } catch (e: any) {
            setSendResult({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6 pb-24">
            <h1 className="text-2xl font-bold">Notification Debugger</h1>

            {/* Error Log Display */}
            {errorLog.length > 0 && (
                <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-red-300">📋 Console Logs</h3>
                        <button
                            onClick={() => setErrorLog([])}
                            className="text-xs bg-red-800 px-2 py-1 rounded"
                        >
                            Clear
                        </button>
                    </div>
                    <pre className="text-[10px] overflow-auto max-h-60 bg-black/50 p-2 rounded whitespace-pre-wrap">
                        {errorLog.join('\n')}
                    </pre>
                </div>
            )}

            <div className="p-4 bg-gray-900 rounded-lg space-y-2">
                <p>
                    <strong>Permission:</strong>
                    <span className={permission === 'granted' ? 'text-green-500' : permission === 'denied' ? 'text-red-500' : 'text-yellow-500'}>
                        {` ${permission.toUpperCase()}`}
                    </span>
                </p>
                {permission === 'denied' && (
                    <div className="text-[11px] bg-red-900/40 p-2 rounded border border-red-800 text-red-200 mt-2">
                        <strong>Cara Memperbaiki:</strong><br />
                        1. Buka <b>Settings</b> iPhone.<br />
                        2. Pilih <b>Notifications</b>.<br />
                        3. Cari <b>Nawaetu</b> dan aktifkan <b>Allow Notifications</b>.<br />
                        4. Refresh halaman ini.
                    </div>
                )}
                <div className="break-all">
                    <strong>Token:</strong>
                    <p className="font-mono text-xs mt-1 text-gray-400">
                        {token || "No token found"}
                    </p>
                </div>
                <button
                    onClick={handleGetToken}
                    className="bg-blue-600 px-4 py-2 rounded text-sm text-white mt-2 w-full"
                    disabled={loading}
                >
                    Request Permission & Get Token
                </button>

                <button
                    onClick={async () => {
                        if (confirm("Reset will delete token and unregister Service Worker. Continue?")) {
                            setLoading(true);
                            localStorage.removeItem("fcm_token");
                            try {
                                const reg = await navigator.serviceWorker.getRegistration();
                                if (reg) {
                                    await reg.unregister();
                                }
                            } catch (error) {
                                alert("Reset failed: " + error);
                                return;
                            } finally {
                                setLoading(false);
                            }
                            alert("Reset complete. Please refresh the page.");
                            window.location.reload();
                        }
                    }}
                    className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded text-sm mt-2 w-full"
                    disabled={loading}
                >
                    ⚠️ Reset / Delete Token (Fix Stuck State)
                </button>
            </div>

            {/* Last Message Log */}
            {lastMessage && (
                <div className="p-4 bg-indigo-900/50 border border-indigo-500 rounded-lg">
                    <h3 className="font-bold text-indigo-300 mb-2">🔔 Incoming Message Detected!</h3>
                    <pre className="text-[10px] overflow-auto max-h-40 bg-black/50 p-2 rounded">
                        {JSON.stringify(lastMessage, null, 2)}
                    </pre>
                </div>
            )}

            <div className="space-y-4">
                <div className="border p-4 rounded-lg border-gray-700">
                    <h2 className="font-semibold mb-2">1. OS-Level Check (Crucial)</h2>
                    <p className="text-sm text-gray-400 mb-2">
                        Tests if the OS allows ANY notification from this PWA.
                    </p>
                    <button
                        onClick={() => {
                            if (!("Notification" in window)) {
                                alert("Notifications not supported");
                                return;
                            }
                            if (Notification.permission !== "granted") {
                                alert("Permission not granted! Status: " + Notification.permission);
                                return;
                            }
                            try {
                                const title = "Test Lokal OS";
                                const options = {
                                    body: "Jika Anda melihat tab ini, berarti Izin OS OK! 📲",
                                    icon: "/icon.png"
                                };

                                if (navigator.serviceWorker) {
                                    navigator.serviceWorker.ready.then(reg => {
                                        reg.showNotification(title, options);
                                        alert("Service Worker Notification triggered! Check notif center if not visible.");
                                    }).catch((e) => {
                                        const notif = new Notification(title, options);
                                        notif.onclick = () => window.focus();
                                        alert("Fallback Notification triggered! Check notif center if not visible.");
                                    });
                                } else {
                                    const notif = new Notification(title, options);
                                    notif.onclick = () => window.focus();
                                    alert("Standard Notification triggered! Check notif center if not visible.");
                                }
                            } catch (e: any) {
                                alert("Error triggering native notif: " + e.message);
                            }
                        }}
                        className="bg-yellow-600 px-4 py-2 rounded text-sm text-white font-bold w-full"
                    >
                        Force Local Notification (No FCM)
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2">
                        *If this fails, check iOS Settings &rarr; Notifications &rarr; Nawaetu.
                    </p>
                </div>

                <div className="border p-4 rounded-lg border-gray-700">
                    <h2 className="font-semibold mb-2">2. Check DB Status</h2>
                    <button
                        onClick={checkDbStatus}
                        className="bg-green-600 px-4 py-2 rounded text-sm text-white disabled:opacity-50"
                        disabled={!token || loading}
                    >
                        Check Token in DB
                    </button>
                    {dbStatus && (
                        <pre className="mt-2 text-xs bg-black p-2 rounded overflow-auto">
                            {JSON.stringify(dbStatus, null, 2)}
                        </pre>
                    )}
                </div>

                <div className="border p-4 rounded-lg border-gray-700">
                    <h2 className="font-semibold mb-2">2. Update Location Data</h2>
                    <p className="text-sm text-gray-400 mb-2">
                        Forcing GPS detection to fix "userLocation: null".
                    </p>
                    <button
                        onClick={async () => {
                            setLoading(true);
                            if (!navigator.geolocation) {
                                alert("Geolocation not supported");
                                setLoading(false);
                                return;
                            }
                            navigator.geolocation.getCurrentPosition(
                                async (pos) => {
                                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                    localStorage.setItem("user_location", JSON.stringify(loc));

                                    // If token exists, sync to DB
                                    if (token) {
                                        await fetch("/api/notifications/subscribe", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                token: token,
                                                deviceType: "web",
                                                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                userLocation: loc
                                            }),
                                        });
                                    }
                                    alert("Location updated successfully!");
                                    setLoading(false);
                                },
                                (err) => {
                                    alert("Error: " + err.message);
                                    setLoading(false);
                                }
                            );
                        }}
                        className="bg-purple-600 px-4 py-2 rounded text-sm text-white disabled:opacity-50"
                        disabled={loading}
                    >
                        Detect & Sync My Location
                    </button>
                </div>

                <div className="border p-4 rounded-lg border-gray-700">
                    <h2 className="font-semibold mb-2">3. Force Test Notification</h2>
                    <p className="text-sm text-gray-400 mb-2">
                        Sends an immediate high-priority notification to a specific token.
                    </p>

                    <div className="mb-2">
                        <label className="text-xs text-gray-400 block mb-1">Target Token (Optional - Paste from Phone):</label>
                        <input
                            type="text"
                            className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-xs font-mono text-white mb-2"
                            placeholder="Paste FCM token here to test another device..."
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={sendTestNotification}
                        className="bg-red-600 px-4 py-2 rounded text-sm text-white disabled:opacity-50 w-full"
                        disabled={(!token && !manualToken) || loading}
                    >
                        {manualToken ? "Send to Manual Token" : "Send to This Device"}
                    </button>
                    {sendResult && (
                        <pre className="mt-2 text-xs bg-black p-2 rounded overflow-auto">
                            {JSON.stringify(sendResult, null, 2)}
                        </pre>
                    )}
                </div>
            </div>

            <div className="text-sm text-gray-500">
                <p>Note for iOS: Ensure you have added the app to Home Screen and opened it from there.</p>
            </div>
        </div>
    );
}

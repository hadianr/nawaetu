"use client";

import { useEffect, useState } from "react";
import { registerServiceWorkerAndGetToken, subscribeForegroundMessages } from "@/lib/notifications/fcm-init";
import { notFound } from "next/navigation";

export default function NotificationDebugPage() {
    // Disable this page in production
    // Check at render time, not in useEffect
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
        notFound();
    }

    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [swStatus, setSwStatus] = useState<string>("Checking...");
    const [token, setToken] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");

    useEffect(() => {
        checkStatus();

        // Subscribe to foreground messages
        subscribeForegroundMessages((payload) => {
            console.log("Foreground message received:", payload);
            setLastMessage(JSON.stringify(payload, null, 2));

            // Show notification manually for foreground messages
            if (payload.notification) {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/icon.png',
                });
            }
        });
    }, []);

    async function checkStatus() {
        // Check permission
        if (typeof window !== "undefined") {
            setPermission(Notification.permission);
        }

        // Check service worker
        if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                setSwStatus(`✅ Registered at: ${registration.scope}`);
            } else {
                setSwStatus("❌ Not registered");
            }
        }

        // Check FCM token
        const storedToken = localStorage.getItem("fcm_token");
        if (storedToken) {
            setToken(storedToken);
        }
    }

    async function clearAndReregister() {
        setIsLoading(true);
        try {
            // Unregister all service workers
            if ("serviceWorker" in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    console.log("Unregistered service worker:", registration.scope);
                }
            }

            // Clear localStorage
            localStorage.removeItem("fcm_token");

            // Clear state
            setToken("");
            setSwStatus("❌ Not registered");

            alert("✅ Cleared! Now click 'Register Service Worker' to get a fresh token.");
            checkStatus();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    async function requestPermissionAndRegister() {
        setIsLoading(true);
        try {
            const fcmToken = await registerServiceWorkerAndGetToken();
            if (fcmToken) {
                alert(`✅ Success! Token obtained (${fcmToken.length} chars)`);

                // Subscribe to backend
                const response = await fetch("/api/notifications/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: fcmToken }),
                });

                const data = await response.json();
                console.log("Subscribe response:", data);

                checkStatus();
            } else {
                alert("❌ Failed to get FCM token. Check console for details.");
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    async function sendTestNotification() {
        if (!token) {
            alert("No FCM token found. Please register first.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/notifications/test-push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token,
                    title: "🎉 Test Nawaetu",
                    body: "Alhamdulillah, notifikasi berhasil diterima!",
                }),
            });
            const data = await response.json();

            if (data.success) {
                alert(`✅ Notification sent!\n\nMessage ID: ${data.messageId}\n\nCheck your browser for the notification!`);
            } else {
                alert(`❌ Failed: ${JSON.stringify(data)}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-emerald-900 mb-6">
                    🔔 Push Notification Debug
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <h2 className="font-semibold mb-2">Permission Status:</h2>
                        <p
                            className={
                                permission === "granted"
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                            }
                        >
                            {permission}
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <h2 className="font-semibold mb-2">Service Worker Status:</h2>
                        <p
                            className={
                                swStatus.includes("✅") ? "text-green-600" : "text-red-600"
                            }
                        >
                            {swStatus}
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <h2 className="font-semibold mb-2">FCM Token:</h2>
                        <p
                            className={
                                token
                                    ? "text-green-600 break-all text-sm"
                                    : "text-red-600"
                            }
                        >
                            {token || "❌ No token found"}
                        </p>
                    </div>

                    {lastMessage && (
                        <div className="p-4 bg-green-50 rounded border border-green-200">
                            <h2 className="font-semibold mb-2 text-green-900">Last Message Received:</h2>
                            <pre className="text-xs text-green-800 overflow-auto">
                                {lastMessage}
                            </pre>
                        </div>
                    )}

                    <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Got "NotRegistered" Error?</h3>
                        <p className="text-sm text-yellow-800 mb-2">
                            Your old token is invalid. Click the button below to clear everything and start fresh.
                        </p>
                        <button
                            onClick={clearAndReregister}
                            disabled={isLoading}
                            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Clearing..." : "🗑️ Clear & Reset Everything"}
                        </button>
                    </div>

                    <button
                        onClick={requestPermissionAndRegister}
                        disabled={isLoading}
                        className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Processing..." : "🚀 Register Service Worker & Get Token"}
                    </button>

                    <button
                        onClick={sendTestNotification}
                        disabled={isLoading || !token}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Sending..." : "📤 Send Test Notification"}
                    </button>

                    <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">💡 Troubleshooting:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                            <li><strong>Tab must be open</strong> - Keep this tab visible when testing</li>
                            <li><strong>Check browser settings</strong> - Ensure notifications are enabled for localhost</li>
                            <li><strong>macOS users</strong> - Check System Settings → Notifications → Chrome/Safari</li>
                            <li><strong>Console logs</strong> - Open DevTools Console to see message reception</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

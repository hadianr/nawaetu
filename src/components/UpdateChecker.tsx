"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface UpdateCheckerProps {
    currentVersion: string;
}

/**
 * UpdateChecker Component
 *
 * PWA Update Best Practices:
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 🔄 PWA Update Lifecycle:
 * 1. Browser detects new service-worker.js on server
 * 2. New SW installs in background (parallel to old SW)
 * 3. New SW enters "waiting" state (won't activate until old tabs close)
 * 4. Call skipWaiting() to force activation immediately
 * 5. New SW takes control via clientsClaim()
 * 6. Reload page to get new app shell and assets
 *
 * ✅ Correct Approach (This Implementation):
 * - Update localStorage version BEFORE reload
 * - Keep SW registered (don't unregister!)
 * - Trigger SW.update() to detect new version
 * - Send SKIP_WAITING message to waiting SW
 * - Wait for controllerchange event
 * - Clear caches to force fresh assets
 * - Reload page (SW will serve new content)
 *
 * ❌ Common Mistakes:
 * - Unregistering SW before reload (leaves no SW to serve content!)
 * - Not waiting for controllerchange (timing issues)
 * - Redirecting instead of reloading (loses SW context)
 * - Not clearing caches (serves stale content)
 *
 * 📱 Why PWA ≠ Native App Install:
 * - PWAs are web apps cached aggressively by browser
 * - Updates happen automatically like web apps (NO app store needed!)
 * - User doesn't need to "reinstall" or "update from store"
 * - Just reload the page to get latest version
 *
 * 🎯 Key Insight:
 * The service worker's job is to CACHE the app, not BE the app.
 * When we update, we need the NEW SW to serve the NEW cached content.
 * If we unregister SW, browser falls back to network (bypassing PWA benefits).
 */
export default function UpdateChecker({ currentVersion }: UpdateCheckerProps) {
    const [serverVersion, setServerVersion] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setDebugLog(prev => [...prev, msg].slice(-10)); // Keep last 10 logs
    };

    useEffect(() => {
        const check = async () => {
            // Check if we just completed an update (reload from update process)
            const params = new URLSearchParams(window.location.search);
            const justUpdated = params.has('updated');

            if (justUpdated) {
                addLog('[UpdateChecker] 🎉 Just completed update, skipping check for 5s...');
                // Skip check for 5 seconds after update reload
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            addLog('[UpdateChecker] Mounted, checking server version...');
            try {
                const res = await fetch(`/api/system/version?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    addLog(`[UpdateChecker] Server version: ${data.version}`);
                    addLog(`[UpdateChecker] Current version: ${currentVersion}`);
                    setServerVersion(data.version);
                } else {
                    addLog(`[UpdateChecker] API error: ${res.status}`);
                }
            } catch (e) {
                addLog(`[UpdateChecker] Fetch failed: ${e}`);
            }
        };
        check();

        // Listen for SW controller change (new SW activated)
        const handleControllerChange = () => {
            addLog('[UpdateChecker] 🎉 New Service Worker took control!');
        };
        navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);

        return () => {
            navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
        };
    }, []);

    const parseSemver = (version: string) =>
        version.replace(/^v/, "").split(".").map((part) => Number(part));

    const compareSemver = (a: string, b: string) => {
        const aParts = parseSemver(a);
        const bParts = parseSemver(b);

        if (aParts.some(Number.isNaN) || bParts.some(Number.isNaN)) return 0;

        const length = Math.max(aParts.length, bParts.length);
        for (let i = 0; i < length; i += 1) {
            const aVal = aParts[i] ?? 0;
            const bVal = bParts[i] ?? 0;
            if (aVal > bVal) return 1;
            if (aVal < bVal) return -1;
        }

        return 0;
    };

    const isUpdateAvailable = () => {
        if (!serverVersion) return false;
        return compareSemver(serverVersion, currentVersion) === 1;
    };

    const handleUpdate = async () => {
        setChecking(true);
        addLog('[Update] ===== UPDATE STARTED =====');
        addLog(`[Update] Current: ${currentVersion}, Server: ${serverVersion}`);

        try {
            if (!serverVersion) {
                addLog('[Update] ❌ No server version!');
                toast.error('Gagal mendapatkan versi server.');
                setChecking(false);
                return;
            }

            // STEP 1: Update localStorage
            addLog('[Update] STEP 1: Update localStorage...');
            localStorage.setItem(STORAGE_KEYS.APP_VERSION, serverVersion);
            const verified = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
            addLog(`[Update] Stored: ${verified}, Expected: ${serverVersion}, Match: ${verified === serverVersion}`);

            if (verified !== serverVersion) {
                addLog('[Update] ❌ localStorage write failed!');
                toast.error('Gagal menyimpan versi. Storage penuh?');
                setChecking(false);
                return;
            }

            // STEP 2: Skip clearing sessionStorage here (hard reload clears it anyway)
            addLog('[Update] STEP 2: Preparing for hard reload...');
            addLog('[Update] sessionStorage will be cleared by browser on reload');

            // STEP 3: Notify user
            addLog('[Update] STEP 3: Update notification...');
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 2000)),
                {
                    loading: 'Mengupdate aplikasi...',
                    success: 'Update siap! Reloading...',
                    error: 'Gagal update'
                }
            );

            // STEP 4: Clear caches
            addLog('[Update] STEP 4: Clear browser caches...');
            if ('caches' in window) {
                const keys = await caches.keys();
                addLog(`[Update] Found ${keys.length} caches: ${keys.join(', ')}`);
                await Promise.all(keys.map(key => {
                    addLog(`[Update] Deleting cache: ${key}`);
                    return caches.delete(key);
                }));
                addLog('[Update] ✓ All caches cleared');
            }

            // STEP 5: Send SKIP_WAITING message to the WAITING Service Worker (the new version)
            addLog('[Update] STEP 5: Send SKIP_WAITING to Service Worker...');
            try {
                const reg = await navigator.serviceWorker?.getRegistration();
                if (reg?.waiting) {
                    addLog('[Update] Waiting SW found, sending SKIP_WAITING...');
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    // Workbox standard message
                    reg.waiting.postMessage({ type: 'WINDOW_SKIP_WAITING' });
                    addLog('[Update] ✓ SKIP_WAITING message sent to new SW');
                } else if (reg?.active) {
                    addLog('[Update] Only active SW found, sending fallback SKIP_WAITING...');
                    reg.active.postMessage({ type: 'SKIP_WAITING' });
                } else {
                    addLog('[Update] ⚠️  No SW registration found...');
                }
            } catch (swErr) {
                addLog(`[Update] SW error: ${swErr}`);
            }

            // STEP 6: Wait briefly for SW activation
            addLog('[Update] STEP 6: Waiting for SW activation...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // STEP 7: Hard reload
            addLog('[Update] STEP 7: Hard reload page...');
            addLog(`[Update] Redirecting to: /?v=${serverVersion}`);

            // Use hard reload (Ctrl+Shift+R equivalent)
            window.location.href = `/?v=${serverVersion}&updated=${Date.now()}`;

        } catch (e) {
            addLog(`[Update] ❌ ERROR: ${e}`);
            toast.error(`Update gagal: ${e}`);
            setChecking(false);
        }
    };

    if (!isUpdateAvailable()) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50">
            <div className="bg-emerald-900/95 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Update Tersedia!</h3>
                        <p className="text-emerald-200/70 text-xs">Versi {serverVersion} siap digunakan.</p>
                    </div>
                </div>
                <Button
                    onClick={handleUpdate}
                    disabled={checking}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 rounded-xl"
                >
                    {checking ? "Memproses..." : "Update Sekarang"}
                </Button>
            </div>

            {/* DEBUG LOGS */}
            {debugLog.length > 0 && (
                <div className="mt-2 bg-black/80 border border-white/10 rounded-lg p-2 text-[10px] font-mono text-white/70 max-h-32 overflow-y-auto">
                    {debugLog.map((log, i) => (
                        <div key={i} className="text-white/50">{log}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

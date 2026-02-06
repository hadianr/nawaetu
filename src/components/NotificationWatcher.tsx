"use client";

import { useAdhanNotifications } from "@/hooks/useAdhanNotifications";
import { useFCM } from "@/hooks/useFCM";

/**
 * This component has no UI. It simply activates the Adhan Notification hook
 * when mounted in the layout.
 */
export default function NotificationWatcher() {
    useAdhanNotifications();
    useFCM();
    return null;
}

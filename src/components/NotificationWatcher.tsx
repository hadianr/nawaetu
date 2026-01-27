"use client";

import { useAdhanNotifications } from "@/hooks/useAdhanNotifications";

/**
 * This component has no UI. It simply activates the Adhan Notification hook
 * when mounted in the layout.
 */
export default function NotificationWatcher() {
    useAdhanNotifications();
    return null;
}

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

import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();

export function useProfile() {
    const { data: session, update: updateSession } = useSession();
    const [isUpdating, setIsUpdating] = useState(false);

    const updateProfile = async (data: {
        name?: string;
        image?: string;
        gender?: "male" | "female";
        archetype?: "beginner" | "striver" | "dedicated";
    }) => {
        setIsUpdating(true);
        const toastId = toast.loading("Menyimpan profil...");

        try {
            // 1. Update Server
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Gagal update profil server");

            // 2. Update Session (Client Side)
            await updateSession({
                ...session,
                user: {
                    ...session?.user,
                    ...data
                }
            });

            // 3. Update Local Storage Fallback
            if (data.name) storage.set(STORAGE_KEYS.USER_NAME, data.name);
            if (data.image) storage.set(STORAGE_KEYS.USER_AVATAR, data.image);
            if (data.gender) storage.set(STORAGE_KEYS.USER_GENDER, data.gender);
            if (data.archetype) storage.set(STORAGE_KEYS.USER_ARCHETYPE, data.archetype);

            toast.success("Profil berhasil diperbarui!", { id: toastId });
            return true;

        } catch (e) {
            toast.error("Gagal memperbarui profil", { id: toastId });
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateProfile,
        isUpdating
    };
}

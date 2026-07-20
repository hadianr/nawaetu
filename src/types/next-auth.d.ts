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

import type { DefaultSession } from "next-auth"
import type { JWT as DefaultJWT } from "@auth/core/jwt"

type UserGender = "male" | "female"
type UserArchetype = "esensial" | "seimbang" | "lengkap"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            id: string
            isMuhsinin: boolean
            gender?: UserGender | null
            archetype?: UserArchetype | null
        } & DefaultSession["user"]
    }

    interface User {
        isMuhsinin?: boolean | null
        gender?: UserGender | null
        archetype?: UserArchetype | null
    }
}

declare module "@auth/core/jwt" {
    /** JWT token shape — embedded in the encrypted cookie, read by session() callback */
    interface JWT extends DefaultJWT {
        id?: string
        isMuhsinin?: boolean
        gender?: UserGender | null
        archetype?: UserArchetype | null
        picture?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id?: string
        isMuhsinin?: boolean
        gender?: UserGender | null
        archetype?: UserArchetype | null
        picture?: string | null
    }
}

declare global {
    interface Window {
        gtag?: (
            command: 'event',
            eventName: string,
            params?: Record<string, string | number | boolean>
        ) => void
    }
}

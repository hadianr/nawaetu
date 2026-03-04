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

import { NextAuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

/**
 * PERFORMANCE OPTIMIZATION: JWT session strategy
 *
 * Previous: strategy: "database"
 *   → Every `getServerSession()` call did a DB round-trip to look up the session row.
 *   → With 16 API routes calling this per-request, high-traffic periods meant
 *     dozens of unnecessary DB queries per second.
 *
 * Now: strategy: "jwt"
 *   → Session data is stored in a signed, encrypted HTTP-only cookie.
 *   → `getServerSession()` = cryptographic JWT decode in memory — ZERO DB queries.
 *   → User fields (id, isMuhsinin, gender, archetype) are embedded in the token
 *     via the `jwt` callback and refreshed on sign-in.
 *   → The sessions table is no longer written to or read from for session validation.
 *     It's kept in the schema for compatibility but unused during normal operation.
 */
export const authOptions: NextAuthOptions = {
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        /**
         * jwt callback — runs when token is created (sign-in) or refreshed.
         * Embeds user fields into the token so session() doesn't need a DB lookup.
         */
        async jwt({ token, user, trigger, session }) {
            // On initial sign-in, `user` object is available from the adapter
            if (user) {
                token.id = user.id;
                token.isMuhsinin = (user as any).isMuhsinin ?? false;
                token.gender = (user as any).gender ?? null;
                token.archetype = (user as any).archetype ?? null;
                token.picture = (user as any).image ?? null;
            }

            // On explicit `update()` call from client (e.g. after settings change),
            // merge in the new session data so client sees fresh values without re-login.
            if (trigger === "update" && session) {
                if (session.isMuhsinin !== undefined) token.isMuhsinin = session.isMuhsinin;
                if (session.gender !== undefined) token.gender = session.gender;
                if (session.archetype !== undefined) token.archetype = session.archetype;
            }

            return token;
        },

        /**
         * session callback — shape the session object from the JWT token.
         * This runs on every `getServerSession()` call — it's purely in-memory
         * (no DB query) because the data comes from the validated JWT token.
         */
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                (session.user as any).isMuhsinin = token.isMuhsinin as boolean;
                (session.user as any).gender = token.gender as string | null;
                (session.user as any).archetype = token.archetype as string | null;
                session.user.image = token.picture as string ?? null;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        // 30 days — affects how long the JWT cookie lives before forced re-login
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Helper to get user session in Server Components and API Routes.
 * With JWT strategy, this is now O(1) — cryptographic decode only, no DB query.
 */
export const getServerSession = () => nextAuthGetServerSession(authOptions);

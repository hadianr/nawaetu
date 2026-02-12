import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db"; // Assuming this is where db is exported
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

export const authOptions: NextAuthOptions = {
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }) as any, // Type assertion due to version mismatch sometimes
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
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // Add custom fields to session
                (session.user as any).isMuhsinin = (user as any).isMuhsinin;
                (session.user as any).gender = (user as any).gender;
                (session.user as any).archetype = (user as any).archetype;
            }
            return session;
        },
    },
    // pages: {
    //     signIn: '/auth/signin', // Optional: Custom sign-in page later
    //     error: '/auth/error', 
    // },
    session: {
        strategy: "database",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

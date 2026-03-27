/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { Metadata } from "next";

export const revalidate = 604800; // Cache for 7 days

export const metadata: Metadata = {
    title: "Privacy Policy - Nawaetu",
    description: "Privacy Policy for Nawaetu, the Islamic Habit Tracker app.",
    alternates: {
        canonical: "https://nawaetu.com/privacy",
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-nav text-white font-sans sm:px-6">
            <div className="w-full max-w-4xl space-y-8 mb-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent pb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-white/80">
                        Effective Date: March 27, 2026
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-white/80 leading-relaxed font-light">
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">1. Introduction</h2>
                        <p>
                            Welcome to <strong>Nawaetu</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our web application located at nawaetu.com and any related services.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Personal Information:</strong> When you register an account via third-party providers (like Google), we receive basic profile information such as your name, email address, and profile picture.</li>
                            <li><strong>Usage Data:</strong> We may collect data regarding your interaction with the app, such as habit tracking progress, reading logs (Tilawah), and intentions set within the app to provide a personalized experience.</li>
                            <li><strong>Device Information:</strong> We may collect non-identifiable information about your device, browser type, and operating system to improve app stability and performance.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">3. How We Use Your Information</h2>
                        <p>We use the collected information for various purposes, including:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To provide, operate, and maintain Nawaetu's features.</li>
                            <li>To manage your account and synchronize your data across devices.</li>
                            <li>To personalize user experience and provide AI-driven spiritual mentorship.</li>
                            <li>To send you important notifications related to prayer times and updates.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">4. Third-Party Services & APIs</h2>
                        <p>
                            Nawaetu integrates with trusted third-party services to provide certain features (e.g., Quran Foundation API for Quranic texts, Aladhan API for prayer times, and AI providers for the mentor feature). These services may have their own privacy policies governing their use of data. We do not sell your personal data to any third party.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">6. Contact Us</h2>
                        <p>
                            If you have any questions or concerns about this Privacy Policy, please contact us at <strong>hadian.rahmat@gmail.com</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

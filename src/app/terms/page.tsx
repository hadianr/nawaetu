/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { Metadata } from "next";

export const revalidate = 604800; // Cache for 7 days

export const metadata: Metadata = {
    title: "Terms of Service - Nawaetu",
    description: "Terms of Service for Nawaetu, the Islamic Habit Tracker app.",
    alternates: {
        canonical: "https://nawaetu.com/terms",
    },
};

export default function TermsOfServicePage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-nav text-white font-sans sm:px-6">
            <div className="w-full max-w-4xl space-y-8 mb-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent pb-2">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-white/80">
                        Effective Date: March 27, 2026
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-white/80 leading-relaxed font-light">
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using <strong>Nawaetu</strong> ("the App"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">2. Description of Service</h2>
                        <p>
                            Nawaetu is an intention-first Islamic habit tracker that provides features such as prayer times, a digital Quran, a Qibla compass, habit gamification, and AI-assisted spiritual guidance. The service is provided "AS IS" and we reserve the right to modify or discontinue features at any time.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">3. User Accounts</h2>
                        <p>
                            To use certain features, you must create an account. You represent and warrant that the information you provide is accurate and complete. You are responsible for safeguarding the password or credentials that you use to access the service and for any activities or actions under your account.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">4. Appropriate Use and Content</h2>
                        <p>
                            You agree not to use Nawaetu for any unlawful purpose or in any way that violates Islamic principles of ethics and respect. The AI mentorship ("Tanya Nawaetu") is designed to provide reference information based on Quran and Hadith, but it does not replace the counsel of qualified Islamic scholars (Ulama) for formal religious rulings (Fatwa).
                        </p>
                    </section>
                    
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">5. Open Source and Commercial License</h2>
                        <p>
                            Nawaetu operates under a Dual Licensing model. The public application and its community source code are subject to the AGPLv3 License. Any proprietary, commercial, or white-label use of the software requires a separate Commercial License agreed upon with the author.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">6. Limitation of Liability</h2>
                        <p>
                            In no event shall Nawaetu, nor its developers, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white mb-2">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at <strong>hadian.rahmat@gmail.com</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Heart, Mail, Send, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { signIn, useSession } from "next-auth/react";

const SUPPORT_EMAIL = "hadian.rahmat@gmail.com";

export default function RewardsPage() {
    const { t } = useLocale();
    const copy = t.rewards;
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";
    const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "fallback">("idle");

    const submitSupportOffer = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitState("sending");
        const form = event.currentTarget;
        const data = new FormData(form);
        const supportType = String(data.get("supportType") || "other");
        const supportTypeLabels: Record<string, string> = {
            "physical-product": copy.supportTypes.physical,
            "digital-reward": copy.supportTypes.digital,
            discount: copy.supportTypes.discount,
            charity: copy.supportTypes.charity,
            operations: copy.supportTypes.operations,
            other: copy.supportTypes.other,
        };
        const fulfillment = String(data.get("fulfillment") || "yes");
        const fulfillmentLabels: Record<string, string> = {
            yes: copy.fulfillment.yes,
            no: copy.fulfillment.no,
            discuss: copy.fulfillment.discuss,
        };
        const subject = `${copy.emailSubject}: ${supportTypeLabels[supportType] || supportTypeLabels.other}`;
        const body = [
            `${copy.emailFields.name}: ${data.get("name") || ""}`,
            `${copy.emailFields.email}: ${data.get("email") || ""}`,
            `${copy.emailFields.type}: ${supportTypeLabels[supportType] || supportType}`,
            `${copy.emailFields.location}: ${data.get("location") || ""}`,
            `${copy.emailFields.fulfillment}: ${fulfillmentLabels[fulfillment] || fulfillment}`,
            "",
            `${copy.emailFields.description}:`,
            data.get("description") || "",
        ].join("\n");

        let response: Response | null = null;
        try {
            response = await fetch("/api/rewards/support", { method: "POST", body: data });
        } catch {
            response = null;
        }
        if (response?.ok) {
            setSubmitState("success");
            form.reset();
            return;
        }

        setSubmitState("fallback");
        window.setTimeout(() => {
            window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }, 100);
    };

    return (
        <main className="min-h-screen px-4 py-8 pb-nav font-sans bg-[rgb(var(--color-canvas))] text-[rgb(var(--color-text))]">
            <div className="mx-auto w-full max-w-none space-y-6 xl:max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-primary-light))]">
                    <ArrowLeft className="h-4 w-4" /> {copy.back}
                </Link>

                <header className="space-y-3 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-light))]">
                        <Gift className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black sm:text-4xl">{copy.title}</h1>
                    <p className="text-[rgb(var(--color-text-muted))]">
                        {copy.subtitle}
                    </p>
                </header>

                <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6">
                    <div className="flex items-start gap-3">
                        <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[rgb(var(--color-warning))]" />
                        <div className="space-y-2 text-sm leading-relaxed">
                            <h2 className="text-lg font-bold">{copy.emptyTitle}</h2>
                            <p className="text-[rgb(var(--color-text-muted))]">
                                {copy.emptyBody}
                            </p>
                            <p className="text-[rgb(var(--color-text-muted))]">
                                {copy.hasanahNote}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6">
                    <div className="mb-5 flex items-start gap-3">
                        <Heart className="mt-1 h-5 w-5 shrink-0 text-[rgb(var(--color-accent))]" />
                        <div>
                            <h2 className="text-xl font-bold">{copy.supportTitle}</h2>
                            <p className="mt-1 text-sm text-[rgb(var(--color-text-muted))]">
                                {copy.supportBody}
                            </p>
                        </div>
                    </div>

                    {!isAuthenticated && <div className="mb-4 rounded-xl border border-[rgb(var(--color-warning))]/25 bg-[rgb(var(--color-warning))]/10 p-4 text-sm text-[rgb(var(--color-warning))]">
                        <p>{copy.loginRequired}</p>
                        <button type="button" onClick={() => signIn("google")} className="mt-3 rounded-lg bg-[rgb(var(--color-primary))] px-4 py-2 font-bold text-[rgb(var(--color-primary-foreground))]">{copy.loginButton}</button>
                    </div>}
                    <fieldset disabled={!isAuthenticated}>
                    <form onSubmit={submitSupportOffer} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-medium">{copy.nameLabel}<input required name="name" className="mt-1 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2.5" /></label>
                            <label className="text-sm font-medium">{copy.emailLabel}<input required name="email" type="email" className="mt-1 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2.5" /></label>
                            <label className="text-sm font-medium">{copy.supportTypeLabel}<select required name="supportType" defaultValue="" className="mt-1 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2.5"><option value="" disabled>{copy.supportTypePlaceholder}</option><option value="physical-product">{copy.supportTypes.physical}</option><option value="digital-reward">{copy.supportTypes.digital}</option><option value="discount">{copy.supportTypes.discount}</option><option value="charity">{copy.supportTypes.charity}</option><option value="operations">{copy.supportTypes.operations}</option><option value="other">{copy.supportTypes.other}</option></select></label>
                            <label className="text-sm font-medium">{copy.locationLabel}<input name="location" placeholder={copy.locationPlaceholder} className="mt-1 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2.5" /></label>
                        </div>
                        <label className="block text-sm font-medium">{copy.fulfillmentLabel}<select name="fulfillment" defaultValue="yes" className="mt-1 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2.5"><option value="yes">{copy.fulfillment.yes}</option><option value="no">{copy.fulfillment.no}</option><option value="discuss">{copy.fulfillment.discuss}</option></select></label>
                        <label className="block text-sm font-medium">{copy.descriptionLabel}<textarea required name="description" rows={5} className="mt-1 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2.5" placeholder={copy.descriptionPlaceholder} /></label>
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">{copy.privacyNote}</p>
                        <button type="submit" disabled={submitState === "sending"} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] px-4 py-3 font-bold text-[rgb(var(--color-primary-foreground))] transition hover:bg-[rgb(var(--color-primary-strong))] disabled:cursor-wait disabled:opacity-60"><Send className="h-4 w-4" /> {submitState === "sending" ? copy.sending : copy.submit}</button>
                        {submitState === "success" && <p role="status" className="rounded-lg bg-[rgb(var(--color-success))]/10 px-3 py-2 text-center text-sm text-[rgb(var(--color-success))]">{copy.success}</p>}
                        {submitState === "fallback" && <p role="alert" className="rounded-lg bg-[rgb(var(--color-warning))]/10 px-3 py-2 text-center text-sm text-[rgb(var(--color-warning))]">{copy.fallback}</p>}
                    </form>
                    </fieldset>
                </section>

                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center justify-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-3 text-sm font-semibold text-[rgb(var(--color-text))]">
                    <Mail className="h-4 w-4" /> {copy.directContact}
                </a>
            </div>
        </main>
    );
}

"use client";

import { useState } from "react";

import { THEMES, useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import BrandIcon from "@/components/BrandIcon";

const RGB_TOKEN = /^\d+ \d+ \d+$/;

/** Each pair is a fill and the token meant for text on it; the contrast test in ThemeContext.test.tsx checks them. */
const TEXT_ON_FILL = [
  { label: "Primary action", fill: "--color-primary", text: "--color-primary-foreground" },
  { label: "Accent fill", fill: "--color-accent", text: "--color-accent-foreground" },
  { label: "Danger", fill: "--color-danger", text: "--color-danger-foreground" },
] as const;

const TEXT_TOKENS = ["--color-text-strong", "--color-text", "--color-text-muted", "--color-primary-strong", "--color-accent-strong", "--color-info", "--color-success", "--color-warning", "--color-danger"] as const;

export default function DesignSystemFixture() {
  const { currentTheme, setTheme, theme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header>
          <BrandIcon size={48} className="mb-3" />
          <p className="text-sm font-medium text-[rgb(var(--color-primary-strong))]">Nawaetu design system</p>
          <h1 className="mt-2 text-3xl font-bold">Foundation fixture</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Development-only preview for every theme, semantic token, and shared primitive.
          </p>
        </header>

        <section aria-labelledby="themes-heading" className="space-y-3">
          <h2 id="themes-heading" className="text-xl font-semibold">Themes</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(THEMES).map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                aria-pressed={currentTheme === candidate.id}
                onClick={() => setTheme(candidate.id)}
                className="rounded-[var(--radius-card)] border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="size-4 rounded-full" style={{ backgroundColor: `rgb(${candidate.colors.primary})` }} aria-hidden="true" />
                  {candidate.name}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{candidate.description}</span>
                <span className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">
                  {candidate.mode} - {candidate.id === currentTheme ? "selected" : "select"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="tokens-heading" className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-surface">
            <CardHeader>
              <CardTitle id="tokens-heading">Semantic tokens</CardTitle>
              <CardDescription>Active: {theme.name} ({theme.mode})</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(theme.tokens).map(([name, value]) => (
                <div key={name} className="flex items-center gap-2 rounded-md border border-border p-2">
                  {RGB_TOKEN.test(value) && (
                    <span className="size-6 shrink-0 rounded border border-border" style={{ backgroundColor: `rgb(${value})` }} aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <code className="text-xs break-all text-[rgb(var(--color-primary-strong))]">{name}</code>
                    <div className="truncate text-muted-foreground" title={value}>{value}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Lora for display, Plus Jakarta Sans for everything else, Amiri only for Arabic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-serif text-3xl font-semibold text-[rgb(var(--color-text-strong))]">Mulai dengan niat</p>
              <p className="text-base text-[rgb(var(--color-text))]">Body text in Plus Jakarta Sans, 16px, for reading and controls.</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">Uppercase label · tracking-wider</p>
              <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose text-[rgb(var(--color-text-strong))]">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Text colours</CardTitle>
              <CardDescription>Text on fills uses the fill&apos;s foreground token; text on surfaces uses the strong shades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {TEXT_ON_FILL.map(({ label, fill, text }) => (
                  <span key={label} className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold" style={{ backgroundColor: `rgb(var(${fill}))`, color: `rgb(var(${text}))` }}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {TEXT_TOKENS.map((token) => (
                  <span key={token} className="font-medium" style={{ color: `rgb(var(${token}))` }}>{token.replace("--color-", "")}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Elevation</CardTitle>
              <CardDescription>Two levels only: cards, and floating layers (menus, sheets, dialogs).</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4 text-sm shadow-[var(--shadow-card)]">Card</div>
              <div className="rounded-2xl border border-border bg-card p-4 text-sm shadow-[var(--shadow-floating)]">Floating</div>
            </CardContent>
          </Card>

          <Card className="glass-surface lg:col-span-2">
            <CardHeader>
              <CardTitle>Glass surface</CardTitle>
              <CardDescription>Frosted layers stay transparent so the active theme backdrop remains visible.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {(["glassBlur", "glassSaturation", "glassBackgroundOpacity", "glassBorderOpacity", "glassRadius", "glassTint"] as const).map((token) => (
                <div key={token} className="rounded-md border border-border p-2">
                  <code className="text-xs break-all text-[rgb(var(--color-primary-strong))]">{token}</code>
                  <div className="mt-1 truncate text-muted-foreground" title={theme.tokens[token]}>{theme.tokens[token]}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Primitive states</CardTitle>
              <CardDescription>Keyboard focus, sizing, and semantic aliases.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary action</Button>
                <Button variant="outline">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <Input aria-label="Fixture input" placeholder="Input with focus ring" />
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild><Button variant="secondary">Open dialog</Button></DialogTrigger>
                <DialogContent className="glass-surface">
                  <DialogHeader>
                    <DialogTitle>Dialog fixture</DialogTitle>
                    <DialogDescription>Verify title, description, close label, Escape, and focus return.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

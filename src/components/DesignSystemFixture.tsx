"use client";

import { useState } from "react";

import { THEMES, useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DesignSystemFixture() {
  const { currentTheme, setTheme, theme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header>
          <p className="text-sm font-medium text-primary">Nawaetu design system</p>
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
                <span className="mt-3 block text-xs uppercase tracking-wide text-muted-foreground">
                  {candidate.mode} · {candidate.id === currentTheme ? "selected" : "select"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="tokens-heading" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle id="tokens-heading">Semantic tokens</CardTitle>
              <CardDescription>Active: {theme.name} ({theme.mode})</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(theme.tokens).map(([name, value]) => (
                <div key={name} className="rounded-md border border-border p-2">
                  <code className="text-xs text-primary">{name}</code>
                  <div className="mt-1 truncate text-muted-foreground" title={value}>{value}</div>
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
                <DialogContent>
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

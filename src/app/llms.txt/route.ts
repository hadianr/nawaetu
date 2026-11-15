import { RAMADHAN_PAGE_ENABLED } from "@/lib/features"

export const dynamic = 'force-static'

const body = `# Nawaetu

> Nawaetu is a free Islamic habit tracker (web, Android, iOS) that connects daily intentions (niat) with prayer tracking, Quran reading, dhikr, fasting and an AI mentor. Available in English and Indonesian.

## Features
- [Home](https://nawaetu.com/): daily intention, prayer times and streaks
- [Quran](https://nawaetu.com/quran): all 114 surahs with translation and tajweed
- [Mentor AI](https://nawaetu.com/mentor-ai): AI mentor for Islamic habit guidance
- [Dhikr](https://nawaetu.com/dhikr): dhikr counter with presets
- [Hadith](https://nawaetu.com/hadith) and [Dua](https://nawaetu.com/dua): sourced collections
- [Sirah](https://nawaetu.com/sirah): the life of Prophet Muhammad SAW, three ways
- [Concise Sirah](https://nawaetu.com/sirah/concise): Shaykh Haytham Sarhan's short book in English and Indonesian, unchanged, with the author's permission. Each page ends with a box labelled "Memahami Lebih Dalam" / "Understand More": that context and reflection question are written by Nawaetu and are not part of the book
- [Complete Sirah](https://nawaetu.com/sirah/full): 50 chapters from Ar-Rahiq al-Makhtum (Indonesian)
- [Timeline of events](https://nawaetu.com/sirah/history): the Prophet's life up to his passing in chapters, built from sourced hadiths
- English editions: [Concise Sirah in English](https://nawaetu.com/en/sirah/concise) and [Timeline of events in English](https://nawaetu.com/en/sirah/history); every page also exists in Indonesian at the same path without /en
- [Qibla](https://nawaetu.com/qibla), [Hijri calendar](https://nawaetu.com/hijri-calendar)${RAMADHAN_PAGE_ENABLED ? ", [Ramadhan](https://nawaetu.com/ramadhan)" : ""}

## About
- [About Nawaetu](https://nawaetu.com/about)
- [Privacy](https://nawaetu.com/privacy)
- [Terms](https://nawaetu.com/terms)
- Source: https://github.com/hadianr/nawaetu
`

export function GET() {
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

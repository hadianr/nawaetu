export const dynamic = 'force-static'

const body = `# Nawaetu

> Nawaetu is a free Islamic habit tracker (web, Android, iOS) that connects daily intentions (niat) with prayer tracking, Quran reading, dhikr, fasting and an AI mentor. Available in English and Indonesian.

## Features
- [Home](https://nawaetu.com/): daily intention, prayer times and streaks
- [Quran](https://nawaetu.com/quran): all 114 surahs with translation and tajweed
- [Mentor AI](https://nawaetu.com/mentor-ai): AI mentor for Islamic habit guidance
- [Dhikr](https://nawaetu.com/dhikr): dhikr counter with presets
- [Hadith](https://nawaetu.com/hadith) and [Dua](https://nawaetu.com/dua): sourced collections
- [Sirah](https://nawaetu.com/sirah): the life of the Prophet by chapter
- [Qibla](https://nawaetu.com/qibla), [Hijri calendar](https://nawaetu.com/hijri-calendar), [Ramadhan](https://nawaetu.com/ramadhan)

## About
- [About Nawaetu](https://nawaetu.com/about)
- [Privacy](https://nawaetu.com/privacy)
- [Terms](https://nawaetu.com/terms)
- Source: https://github.com/hadianr/nawaetu
`

export function GET() {
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

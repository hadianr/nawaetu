type Locale = "id" | "en";
type Prayer = "Imsak" | "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

type CopyPair = { title: string; body: string };

const prayerCopy: Record<Locale, Record<Prayer, CopyPair[]>> = {
  id: {
    Imsak: [
      { title: "Imsak masuk 🌙", body: "Wrap up sahur pelan-pelan, lalu siap menyambut Subuh." },
      { title: "Last call sahur", body: "Selesaikan sahur dan niatkan hari ini dengan baik." },
      { title: "Waktunya siap-siap Subuh", body: "Air wudhu dulu, yuk. Semoga harimu dimudahkan." },
    ],
    Fajr: [
      { title: "Subuh time 🌅", body: "Bangun pelan-pelan, ambil wudhu, dan mulai hari bersama Allah." },
      { title: "Panggilan Subuh sudah tiba", body: "Dunia bisa menunggu sebentar. Yuk tunaikan Subuh." },
      { title: "Lock in bareng Subuh", body: "Lima menit untuk menghadap Allah, lalu lanjutkan harimu." },
    ],
    Dhuhr: [
      { title: "Dzuhur time ☀️", body: "Pause sebentar dari ramainya hari. Yuk tunaikan Dzuhur." },
      { title: "Waktunya Dzuhur", body: "Reset sejenak dengan wudhu dan sholat Dzuhur." },
      { title: "Midday check-in", body: "Dzuhur sudah masuk. Tarik napas, lalu menghadap Allah." },
    ],
    Asr: [
      { title: "Ashar time 🌤️", body: "Sebelum lanjut aktivitas, yuk sisihkan waktu untuk Ashar." },
      { title: "Waktunya Ashar", body: "Satu jeda kecil untuk menjaga hati tetap terarah." },
      { title: "Ashar check-in", body: "Ashar sudah masuk. Gas wudhu dan tunaikan sholat." },
    ],
    Maghrib: [
      { title: "Maghrib time 🌇", body: "Hari hampir selesai. Yuk tutup fase ini dengan Maghrib." },
      { title: "Waktunya Maghrib", body: "Ambil jeda dari semuanya dan hadir untuk Maghrib." },
      { title: "Maghrib sudah masuk", body: "Wudhu dulu, lalu tunaikan sholat sebelum lanjut malam." },
    ],
    Isha: [
      { title: "Isya time 🌙", body: "Sebelum benar-benar offline, yuk tunaikan Isya." },
      { title: "Waktunya Isya", body: "Tutup harimu dengan satu jeda tenang bersama Allah." },
      { title: "Night reset: Isya", body: "Isya sudah masuk. Pelan-pelan, wudhu, lalu sholat." },
    ],
  },
  en: {
    Imsak: [
      { title: "Imsak is in 🌙", body: "Wrap up suhoor gently, then get ready for Fajr." },
      { title: "Suhoor last call", body: "Finish suhoor and set your intention for the day." },
      { title: "Get ready for Fajr", body: "Wudu first, then welcome the day with prayer." },
    ],
    Fajr: [
      { title: "Fajr time 🌅", body: "Take it slow, make wudu, and start the day with Allah." },
      { title: "Fajr is calling", body: "The world can wait a moment. Come for Fajr." },
      { title: "Lock in with Fajr", body: "A few minutes to turn to Allah, then carry on with your day." },
    ],
    Dhuhr: [
      { title: "Dhuhr time ☀️", body: "Pause the busy day for a moment. Come pray Dhuhr." },
      { title: "Time for Dhuhr", body: "Reset with wudu and Dhuhr prayer." },
      { title: "Midday check-in", body: "Dhuhr is in. Breathe, then turn to Allah." },
    ],
    Asr: [
      { title: "Asr time 🌤️", body: "Before the next thing, make a little room for Asr." },
      { title: "Time for Asr", body: "One small pause to keep your heart grounded." },
      { title: "Asr check-in", body: "Asr is in. Make wudu and pray." },
    ],
    Maghrib: [
      { title: "Maghrib time 🌇", body: "The day is winding down. Close this chapter with Maghrib." },
      { title: "Time for Maghrib", body: "Step away for a moment and be present for Maghrib." },
      { title: "Maghrib is in", body: "Make wudu, then pray before the night moves on." },
    ],
    Isha: [
      { title: "Isha time 🌙", body: "Before you fully log off, come pray Isha." },
      { title: "Time for Isha", body: "End your day with a quiet pause with Allah." },
      { title: "Night reset: Isha", body: "Isha is in. Take it slow, make wudu, and pray." },
    ],
  },
};

const streakCopy: Record<Locale, CopyPair[]> = {
  id: [
    { title: "Streak kamu masih nyala 🔥", body: "Tinggal satu aktivitas bermakna untuk lanjutkan streak {days} hari." },
    { title: "Jangan biarkan streak lewat", body: "{days} hari sudah kamu bangun. Yuk selesaikan satu hal baik hari ini." },
    { title: "Masih sempat lock in", body: "Hari ini belum selesai. Satu langkah kecil bisa menjaga streak {days} hari." },
    { title: "Your streak called 📲", body: "Cek progresmu dan selesaikan satu aktivitas bermakna sebelum hari berganti." },
  ],
  en: [
    { title: "Your streak is still glowing 🔥", body: "One meaningful activity keeps your {days}-day streak going." },
    { title: "Don’t let the streak slip", body: "You’ve built {days} days. Finish one good thing today." },
    { title: "Still time to lock in", body: "Today isn’t over. One small step can protect your {days}-day streak." },
    { title: "Your streak called 📲", body: "Check your progress and finish one meaningful activity before the day ends." },
  ],
};

function resolveLocale(value: unknown): Locale {
  return value === "en" ? "en" : "id";
}

function choosePair(pairs: CopyPair[]): CopyPair {
  return pairs[Math.floor(Math.random() * pairs.length)];
}

export function getPrayerNotificationCopy(locale: unknown, prayer: string): CopyPair {
  const language = resolveLocale(locale);
  const key = prayer as Prayer;
  return choosePair(prayerCopy[language][key] || prayerCopy[language].Fajr);
}

export function getStreakNotificationCopy(locale: unknown, days: number): CopyPair {
  const pair = choosePair(streakCopy[resolveLocale(locale)]);
  return { title: pair.title, body: pair.body.replace("{days}", String(days)) };
}


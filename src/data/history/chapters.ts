/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Chapters of Islamic history, small enough for client pages (calendar, index).
 * Titles, intros and the connecting lines in content.ts are Nawaetu's own and only restate what the
 * chapter's hadiths and the app's sirah support. A chapter has a date only when the app's sirah text
 * states it (date.sourceSectionId, checked by a test); a day only when that text gives one.
 */

import { getHijriMonthName } from "@/lib/hijri-date";

export interface HistoryChapterDate {
    hijriYear: number;
    hijriMonth: number;
    hijriDay?: number;
    /** Sirah section whose text states the date (the dataset sometimes files it under an unrelated title). */
    sourceSectionId: string;
}

export interface HistoryChapter {
    slug: string;
    order: number;
    titleId: string;
    titleEn: string;
    introId: string;
    introEn: string;
    date?: HistoryChapterDate;
    /** Matching chapter of the app's Indonesian sirah, linked as further reading. */
    sirahChapterSlug?: string;
    hadithCount: number;
}

export const HISTORY_CHAPTERS: HistoryChapter[] = [
    {
        slug: "sebelum-kenabian",
        order: 1,
        titleId: "Sebelum Kenabian",
        titleEn: "Before Prophethood",
        introId: "Jauh sebelum menerima wahyu, Muhammad SAW sudah dipersiapkan Allah: hatinya dibersihkan sejak kecil, dan beliau ditempa dengan pekerjaan sederhana sebagai penggembala.",
        introEn: "Long before revelation, Allah was preparing Muhammad SAW: his heart was purified in childhood, and he was shaped by the humble work of a shepherd.",
        sirahChapterSlug: "kelahiran-dan-empat-puluh-tahun-sebelum-nubuwah",
        hadithCount: 2
    },
    {
        slug: "wahyu-pertama",
        order: 2,
        titleId: "Wahyu Pertama",
        titleEn: "The First Revelation",
        introId: "Beliau diutus sebagai rasul pada usia empat puluh tahun. Wahyu pertama turun di Gua Hira, dan Khadijah menenangkan serta menguatkan beliau.",
        introEn: "He was sent as a messenger at the age of forty. The first revelation came in the Cave of Hira, and Khadijah calmed and reassured him.",
        sirahChapterSlug: "di-bawah-lindungan-nubuwah-dan-risalah",
        hadithCount: 3
    },
    {
        slug: "dakwah-di-makkah",
        order: 3,
        titleId: "Dakwah di Makkah",
        titleEn: "Calling to Islam in Makkah",
        introId: "Di Makkah, dakwah dibalas dengan ejekan, ancaman, dan kekerasan. Para sahabat diuji, dan Nabi SAW mengajarkan kesabaran, bahkan menolak tawaran untuk membinasakan kaum yang menolaknya.",
        introEn: "In Makkah, the call to Islam was met with mockery, threats and violence. The companions were tested, and the Prophet SAW taught patience, even refusing an offer to destroy the people who rejected him.",
        sirahChapterSlug: "tahapan-kedua-dakwah-secara-terang-terangan",
        hadithCount: 5
    },
    {
        slug: "hijrah",
        order: 4,
        titleId: "Hijrah",
        titleEn: "The Hijrah",
        introId: "Setelah bertahun-tahun ditekan di Makkah, Nabi SAW berhijrah ke Madinah bersama Abu Bakar, lalu membangun masyarakat baru di sana.",
        introEn: "After years of pressure in Makkah, the Prophet SAW emigrated to Madinah with Abu Bakr and built a new community there.",
        sirahChapterSlug: "rasulullah-saw-hijrah",
        hadithCount: 2
    },
    {
        slug: "perang-badar",
        order: 5,
        titleId: "Perang Badar",
        titleEn: "The Battle of Badr",
        introId: "Badar adalah pertempuran pertama yang diikuti Nabi SAW. Pasukan Muslim kalah jumlah tiga banding satu, tetapi Nabi SAW menyiapkan strategi lalu bersandar penuh kepada Allah.",
        introEn: "Badr was the first battle the Prophet SAW fought. The Muslims were outnumbered three to one, yet the Prophet SAW prepared a strategy and then relied fully on Allah.",
        date: { hijriYear: 2, hijriMonth: 9, hijriDay: 17, sourceSectionId: "sec-097" },
        sirahChapterSlug: "perang-badr-kubra",
        hadithCount: 2
    },
    {
        slug: "perang-uhud",
        order: 6,
        titleId: "Perang Uhud",
        titleEn: "The Battle of Uhud",
        introId: "Di Uhud, kaum Muslimin menghadapi ujian berat dan banyak sahabat gugur. Kisah-kisahnya menunjukkan keberanian, pengorbanan, dan bagaimana Nabi SAW menilai kesiapan seseorang.",
        introEn: "At Uhud, the Muslims faced a severe trial and many companions were killed. These accounts show courage, sacrifice, and how the Prophet SAW judged a person's readiness.",
        date: { hijriYear: 3, hijriMonth: 10, sourceSectionId: "sec-130" },
        sirahChapterSlug: "perang-uhud",
        hadithCount: 4
    },
    {
        slug: "perang-khandaq",
        order: 7,
        titleId: "Perang Khandaq",
        titleEn: "The Battle of the Trench",
        introId: "Saat pasukan gabungan (Ahzab) datang menyerang Madinah, kaum Muslimin menggali parit untuk bertahan. Nabi SAW ikut bekerja dan menahan lapar bersama para sahabat.",
        introEn: "When the confederate armies (al-Ahzab) came against Madinah, the Muslims dug a trench to defend it. The Prophet SAW worked and went hungry alongside his companions.",
        date: { hijriYear: 5, hijriMonth: 10, sourceSectionId: "sec-166" },
        sirahChapterSlug: "perang-ahzab-atau-khandaq",
        hadithCount: 3
    },
    {
        slug: "surat-raja-dan-khaibar",
        order: 8,
        titleId: "Surat untuk Para Raja dan Khaibar",
        titleEn: "Letters to Rulers and Khaybar",
        introId: "Nabi SAW menulis surat kepada para penguasa, termasuk Kisra, Kaisar, dan Najasyi, untuk mengajak mereka kepada Allah. Bab ini juga memuat kisah Perang Khaibar dan kedatangan Nabi SAW bersama para sahabat ke Makkah untuk umrah.",
        introEn: "The Prophet SAW wrote to rulers, including Khosrow, Caesar and the Negus, inviting them to Allah. This chapter also covers the Battle of Khaybar and the visit of the Prophet SAW to Makkah with his companions for umrah.",
        sirahChapterSlug: "korespondensi-dengan-beberapa-raja-dan-amir",
        hadithCount: 4
    },
    {
        slug: "perang-hunain",
        order: 9,
        titleId: "Perang Hunain",
        titleEn: "The Battle of Hunayn",
        introId: "Di Hunain, pasukan Muslim sempat tercerai-berai, tetapi Nabi SAW tetap teguh. Setelahnya, beliau membagi harta rampasan dan menghadapi kritik dengan sabar.",
        introEn: "At Hunayn, the Muslim army was briefly scattered, but the Prophet SAW stood firm. Afterwards he divided the spoils and met criticism with patience.",
        date: { hijriYear: 8, hijriMonth: 10, sourceSectionId: "sec-301" },
        sirahChapterSlug: "tahapan-ketiga-perang-hunain",
        hadithCount: 2
    },
    {
        slug: "kisah-ekspedisi",
        order: 10,
        titleId: "Kisah dari Berbagai Ekspedisi",
        titleEn: "Stories from the Expeditions",
        introId: "Selain perang besar, Nabi SAW juga mengirim banyak pasukan kecil. Kisah-kisahnya mengajarkan kepemimpinan, kebersamaan dalam kesulitan, dan batas ketaatan kepada pemimpin.",
        introEn: "Besides the major battles, the Prophet SAW sent out many smaller detachments. Their stories teach leadership, sticking together in hardship, and the limits of obedience to a leader.",
        hadithCount: 3
    },
    {
        slug: "perang-tabuk",
        order: 11,
        titleId: "Perjalanan ke Tabuk",
        titleEn: "The Journey to Tabuk",
        introId: "Dalam perjalanan ke Tabuk, pasukan menghadapi kelaparan. Nabi SAW menerima masukan Umar, dan saat kembali beliau disambut hangat penduduk Madinah.",
        introEn: "On the way to Tabuk, the army faced famine. The Prophet SAW accepted Umar's advice, and on his return he was warmly welcomed by the people of Madinah.",
        sirahChapterSlug: "perang-tabuk",
        hadithCount: 2
    },
    {
        slug: "haji-nabi",
        order: 12,
        titleId: "Haji Nabi SAW",
        titleEn: "The Hajj of the Prophet SAW",
        introId: "Nabi SAW menunaikan haji dengan sangat sederhana dan berdoa agar ibadahnya bebas dari pamer dan mencari nama.",
        introEn: "The Prophet SAW performed Hajj very simply and prayed that his worship be free of showing off and seeking reputation.",
        sirahChapterSlug: "haji-wada",
        hadithCount: 1
    },
    {
        slug: "hari-hari-terakhir",
        order: 13,
        titleId: "Hari-Hari Terakhir",
        titleEn: "The Final Days",
        introId: "Saat sakit keras, Nabi SAW meminta Abu Bakar mengimami salat dan terus berpesan tentang salat. Beliau wafat tanpa meninggalkan harta.",
        introEn: "During his final illness, the Prophet SAW asked Abu Bakr to lead the prayer and kept advising people about the prayer. He passed away leaving no wealth behind.",
        sirahChapterSlug: "kembali-ke-haribaan-ilahi",
        hadithCount: 8
    },
    {
        slug: "masa-abu-bakar",
        order: 14,
        titleId: "Sepeninggal Nabi SAW: Masa Abu Bakar",
        titleEn: "After the Prophet SAW: Abu Bakr",
        introId: "Sepeninggal Nabi SAW, Abu Bakar memimpin kaum Muslimin. Ia menunaikan janji-janji Nabi SAW dan memulai pengumpulan Al-Qur'an setelah banyak penghafal gugur di Yamamah.",
        introEn: "After the Prophet SAW, Abu Bakr led the Muslims. He fulfilled the promises of the Prophet SAW and began compiling the Quran after many who had memorised it were killed at Yamamah.",
        hadithCount: 2
    }
];

export function getHistoryChapter(slug: string): HistoryChapter | undefined {
    return HISTORY_CHAPTERS.find((chapter) => chapter.slug === slug);
}

export function getHistoryChaptersForMonth(hijriMonth: number): HistoryChapter[] {
    return HISTORY_CHAPTERS.filter((chapter) => chapter.date?.hijriMonth === hijriMonth);
}

export function hadeethEncUrl(id: number, locale: string): string {
    return `https://hadeethenc.com/${locale === "en" ? "en" : "id"}/browse/hadith/${id}`;
}

export function formatHistoryDate(date: HistoryChapterDate, locale: string): string {
    const day = date.hijriDay ? `${date.hijriDay} ` : "";
    return `${day}${getHijriMonthName(date.hijriMonth, locale)} ${date.hijriYear} ${locale === "en" ? "AH" : "H"}`;
}

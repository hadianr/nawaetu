import type { EvidenceData } from "@/data/ramadhan/types";
import {
    FASTING_EVIDENCE,
    LAILATUL_QADR_EVIDENCE,
    SUHOOR_EVIDENCE,
    TARAWEH_EVIDENCE,
} from "@/data/ramadhan/practices";

/**
 * What each Hijri month is, and the practices specific to it, for the calendar's month card.
 * Rules (docs/HIJRI_CALENDAR_INSIGHTS_PLAN.md §5): nothing the grid already marks weekly or monthly, nothing from the
 * history card, and no practice without a sound source. Name meanings follow the common classical explanation.
 */

export type HijriMonthChip = "sacred" | "ramadan";
/** Opens an existing guide or tool instead of a new page. */
export type HijriPracticeAction = "lailatulQadrGuide" | "zakatCalculator";

export interface Localized {
    id: string;
    en: string;
}

export interface HijriMonthPractice {
    key: string;
    title: Localized;
    body: Localized;
    /** Short reference shown under the body. */
    source: string;
    /** Full dalil from Nawaetu's existing evidence data, shown when the line is expanded. */
    evidence?: EvidenceData;
    href?: string;
    action?: HijriPracticeAction;
}

export interface HijriMonthInfo {
    month: number;
    arabic: string;
    chip?: HijriMonthChip;
    insight: Localized;
    insightSource?: string;
    practices: HijriMonthPractice[];
}

const RAMADAN_PRACTICES: HijriMonthPractice[] = [
    {
        key: "fasting",
        title: { id: "Puasa wajib sebulan penuh", en: "The obligatory fast, all month" },
        body: {
            id: "Wajib bagi Muslim yang baligh, berakal, dan mampu. Yang sakit atau dalam perjalanan boleh berbuka dan menggantinya di hari lain.",
            en: "Obligatory for every adult Muslim of sound mind who is able. The sick and travellers may break it and make it up on other days.",
        },
        source: "QS. Al-Baqarah: 183–185",
        evidence: FASTING_EVIDENCE,
    },
    {
        key: "tarawih",
        title: { id: "Tarawih dan qiyamul lail", en: "Tarawih and night prayer" },
        body: {
            id: "Shalat malam di bulan Ramadan dengan iman dan mengharap pahala menghapus dosa yang telah lalu.",
            en: "Praying at night in Ramadan with faith and hope of reward wipes out past sins.",
        },
        source: "HR. Bukhari 2008, Muslim 759",
        evidence: TARAWEH_EVIDENCE,
    },
    {
        key: "lailatulQadr",
        title: { id: "Carilah Lailatul Qadar", en: "Seek Laylat al-Qadr" },
        body: {
            id: "Lebih baik dari seribu bulan. Carilah di sepuluh malam terakhir, terutama malam-malam ganjil.",
            en: "Better than a thousand months. Seek it in the last ten nights, especially the odd ones.",
        },
        source: "QS. Al-Qadr: 1–3; HR. Bukhari 2017",
        evidence: LAILATUL_QADR_EVIDENCE,
        action: "lailatulQadrGuide",
    },
    {
        key: "suhoor",
        title: { id: "Makan sahur", en: "Eat suhoor" },
        body: {
            id: "Ada keberkahan pada sahur, walau hanya seteguk air.",
            en: "There is blessing in suhoor, even if it is only a sip of water.",
        },
        source: "HR. Bukhari 1923, Muslim 1095",
        evidence: SUHOOR_EVIDENCE,
    },
    {
        key: "iftar",
        title: { id: "Segerakan berbuka", en: "Break the fast promptly" },
        body: {
            id: "Manusia senantiasa dalam kebaikan selama menyegerakan berbuka saat Maghrib tiba.",
            en: "People remain in goodness as long as they break the fast promptly at Maghrib.",
        },
        source: "HR. Bukhari 1957, Muslim 1098",
    },
    {
        key: "quran",
        title: { id: "Tadarus Al-Quran", en: "Recite the Quran" },
        body: {
            id: "Ramadan adalah bulan diturunkannya Al-Quran. Malaikat Jibril AS mengulang bacaan Al-Quran bersama Nabi Muhammad SAW setiap malam Ramadan.",
            en: "Ramadan is the month the Quran was revealed. Jibril AS reviewed the Quran with Prophet Muhammad SAW every night of Ramadan.",
        },
        source: "QS. Al-Baqarah: 185; HR. Bukhari 6",
        href: "/quran",
    },
    {
        key: "charity",
        title: { id: "Perbanyak sedekah", en: "Give more in charity" },
        body: {
            id: "Nabi Muhammad SAW adalah orang yang paling dermawan, dan paling dermawan di bulan Ramadan.",
            en: "Prophet Muhammad SAW was the most generous of people, and most generous of all in Ramadan.",
        },
        source: "HR. Bukhari 6, Muslim 2308",
    },
    {
        key: "itikaf",
        title: { id: "I'tikaf di sepuluh hari terakhir", en: "I'tikaf in the last ten days" },
        body: {
            id: "Nabi Muhammad SAW beri'tikaf di masjid pada sepuluh hari terakhir Ramadan.",
            en: "Prophet Muhammad SAW secluded himself in the mosque for the last ten days of Ramadan.",
        },
        source: "HR. Bukhari 2026, Muslim 1172",
        action: "lailatulQadrGuide",
    },
    {
        key: "zakatFitr",
        title: { id: "Zakat fitrah", en: "Zakat al-Fitr" },
        body: {
            id: "Wajib, ditunaikan paling lambat sebelum shalat Idulfitri.",
            en: "Obligatory, and due before the Eid al-Fitr prayer at the latest.",
        },
        source: "HR. Bukhari 1503, Muslim 984",
        action: "zakatCalculator",
    },
    {
        key: "umrah",
        title: { id: "Umrah di bulan Ramadan", en: "Umrah in Ramadan" },
        body: {
            id: "Pahalanya setara dengan haji, tetapi tidak menggugurkan kewajiban haji.",
            en: "Its reward equals that of Hajj, but it does not replace the obligatory Hajj.",
        },
        source: "HR. Bukhari 1782, Muslim 1256",
    },
];

export const HIJRI_MONTH_INFO: HijriMonthInfo[] = [
    {
        month: 1,
        arabic: "مُحَرَّم",
        chip: "sacred",
        insight: {
            id: "Muharram berarti “yang dimuliakan”. Awal tahun Hijriah dan salah satu dari empat bulan haram; Nabi Muhammad SAW menyebutnya “bulan Allah”.",
            en: "Muharram means “the sanctified”. It opens the Hijri year and is one of the four sacred months; Prophet Muhammad SAW called it “the month of Allah”.",
        },
        insightSource: "QS. At-Taubah: 36; HR. Muslim 1163",
        practices: [
            {
                key: "muharramFasting",
                title: { id: "Perbanyak puasa di bulan ini", en: "Fast often this month" },
                body: {
                    id: "Puasa paling utama setelah Ramadan adalah puasa di bulan Allah, Muharram.",
                    en: "The best fasting after Ramadan is in the month of Allah, Muharram.",
                },
                source: "HR. Muslim 1163",
            },
            {
                key: "ashura",
                title: { id: "Puasa Asyura (10 Muharram)", en: "Fast of Ashura (10 Muharram)" },
                body: {
                    id: "Menghapus dosa setahun yang lalu.",
                    en: "It expiates the sins of the previous year.",
                },
                source: "HR. Muslim 1162",
            },
            {
                key: "tasua",
                title: { id: "Puasa Tasu'a (9 Muharram)", en: "Fast of Tasu'a (9 Muharram)" },
                body: {
                    id: "Nabi Muhammad SAW berniat berpuasa juga pada tanggal 9, mendampingi Asyura.",
                    en: "Prophet Muhammad SAW intended to fast the 9th as well, alongside Ashura.",
                },
                source: "HR. Muslim 1134",
            },
        ],
    },
    {
        month: 2,
        arabic: "صَفَر",
        insight: {
            id: "Tidak ada kesialan di bulan Safar. Nabi Muhammad SAW membantah keyakinan bahwa bulan ini membawa sial.",
            en: "There is no bad luck in Safar. Prophet Muhammad SAW rejected the belief that this month brings misfortune.",
        },
        insightSource: "HR. Bukhari 5757, Muslim 2220",
        practices: [],
    },
    {
        month: 3,
        arabic: "رَبِيع الأَوَّل",
        insight: {
            id: "Rabiul Awal berarti “musim semi pertama”. Menurut mayoritas ulama, Nabi Muhammad SAW lahir di bulan ini; beliau juga tiba di Madinah saat hijrah dan wafat di bulan ini.",
            en: "Rabi al-Awwal means “the first spring”. Most scholars hold that Prophet Muhammad SAW was born in this month; he also reached Madinah on the Hijrah and passed away in it.",
        },
        insightSource: "Sirah Nabawiyah",
        practices: [],
    },
    {
        month: 4,
        arabic: "رَبِيع الآخِر",
        insight: {
            id: "Rabiul Akhir berarti “musim semi kedua”. Tidak ada amalan khusus; jaga amalan sunnah yang rutin.",
            en: "Rabi al-Akhir means “the second spring”. It has no specific practice; keep up your regular sunnah.",
        },
        practices: [],
    },
    {
        month: 5,
        arabic: "جُمَادَى الأُولَى",
        insight: {
            id: "Namanya dikaitkan dengan musim kering saat air membeku atau mengering, menurut penjelasan yang masyhur. Tidak ada amalan khusus; jaga amalan rutin.",
            en: "Its name is commonly linked to the dry season, when water froze or dried up. It has no specific practice; keep up your regular deeds.",
        },
        practices: [],
    },
    {
        month: 6,
        arabic: "جُمَادَى الآخِرَة",
        insight: {
            id: "Bulan terakhir sebelum Rajab, bulan haram berikutnya. Tidak ada amalan khusus; jaga amalan rutin.",
            en: "The last month before Rajab, the next sacred month. It has no specific practice; keep up your regular deeds.",
        },
        practices: [],
    },
    {
        month: 7,
        arabic: "رَجَب",
        chip: "sacred",
        insight: {
            id: "Salah satu dari empat bulan haram: jauhi kezaliman dengan lebih sungguh-sungguh. Tidak ada amalan khusus Rajab yang shahih; amalan sunnah biasa tetap berlaku.",
            en: "One of the four sacred months: guard against wrongdoing all the more. No authentic practice is specific to Rajab; the usual sunnah still applies.",
        },
        insightSource: "QS. At-Taubah: 36; HR. Bukhari 3197",
        practices: [],
    },
    {
        month: 8,
        arabic: "شَعْبَان",
        insight: {
            id: "Nabi Muhammad SAW paling banyak berpuasa sunnah di bulan ini, bulan diangkatnya amal kepada Allah. Waktu terbaik melunasi utang puasa sebelum Ramadan.",
            en: "Prophet Muhammad SAW fasted more in this month than any other outside Ramadan; deeds are raised to Allah in it. The best time to make up missed fasts before Ramadan.",
        },
        insightSource: "HR. Bukhari 1969, Muslim 1156; HR. Nasa'i 2357",
        practices: [
            {
                key: "syabanFasting",
                title: { id: "Perbanyak puasa sunnah", en: "Fast often" },
                body: {
                    id: "Aisyah RA tidak pernah melihat Nabi Muhammad SAW berpuasa sebanyak di bulan Sya'ban, selain Ramadan.",
                    en: "Aisha RA never saw Prophet Muhammad SAW fast as much in any month, other than Ramadan, as in Sha'ban.",
                },
                source: "HR. Bukhari 1969, Muslim 1156",
            },
            {
                key: "qadha",
                title: { id: "Lunasi utang puasa (qadha)", en: "Make up missed fasts (qadha)" },
                body: {
                    id: "Aisyah RA biasa mengqadha puasa Ramadan di bulan Sya'ban.",
                    en: "Aisha RA used to make up her missed Ramadan fasts in Sha'ban.",
                },
                source: "HR. Bukhari 1950",
            },
            {
                key: "prepare",
                title: { id: "Bersiap menyambut Ramadan", en: "Get ready for Ramadan" },
                body: {
                    id: "Ikuti perjalanan menuju Ramadan di beranda untuk membangun kebiasaan sebelum bulan puasa.",
                    en: "Follow the road to Ramadan on the home screen to build habits before the fasting month.",
                },
                source: "Nawaetu",
                href: "/",
            },
        ],
    },
    {
        month: 9,
        arabic: "رَمَضَان",
        chip: "ramadan",
        insight: {
            id: "Bulan diturunkannya Al-Quran. Pintu surga dibuka dan setan dibelenggu.",
            en: "The month the Quran was revealed. The gates of Paradise are opened and the devils are chained.",
        },
        insightSource: "QS. Al-Baqarah: 185; HR. Bukhari 1899",
        practices: RAMADAN_PRACTICES,
    },
    {
        month: 10,
        arabic: "شَوَّال",
        insight: {
            id: "Dibuka dengan Idulfitri. Puasa enam hari di bulan ini setelah Ramadan seperti berpuasa setahun penuh.",
            en: "It opens with Eid al-Fitr. Fasting six days of it after Ramadan is like fasting the whole year.",
        },
        insightSource: "HR. Muslim 1164",
        practices: [
            {
                key: "eidSunnah",
                title: { id: "Sunnah Idulfitri", en: "Eid al-Fitr sunnah" },
                body: {
                    id: "Bertakbir sejak malam Id, dan makan sebelum berangkat shalat Id.",
                    en: "Say the takbir from the night of Eid, and eat before leaving for the Eid prayer.",
                },
                source: "QS. Al-Baqarah: 185; HR. Bukhari 953",
            },
            {
                key: "shawwalSix",
                title: { id: "Puasa enam hari Syawal", en: "Six days of Shawwal" },
                body: {
                    id: "Boleh berurutan atau terpisah. Ulama berbeda pendapat apakah qadha Ramadan harus didahulukan.",
                    en: "They may be consecutive or spread out. Scholars differ on whether missed Ramadan fasts must come first.",
                },
                source: "HR. Muslim 1164",
            },
        ],
    },
    {
        month: 11,
        arabic: "ذُو القَعْدَة",
        chip: "sacred",
        insight: {
            id: "Namanya berarti “duduk”, karena bangsa Arab dahulu menahan diri dari perang. Salah satu bulan haram, dan termasuk bulan-bulan haji.",
            en: "Its name means “sitting”, as the Arabs refrained from war in it. One of the sacred months, and one of the months of Hajj.",
        },
        insightSource: "QS. At-Taubah: 36; QS. Al-Baqarah: 197",
        practices: [],
    },
    {
        month: 12,
        arabic: "ذُو الحِجَّة",
        chip: "sacred",
        insight: {
            id: "Bulan haji dan bulan haram. Sepuluh hari pertamanya adalah hari-hari yang paling dicintai Allah untuk beramal saleh.",
            en: "The month of Hajj and a sacred month. Its first ten days are the days in which good deeds are most beloved to Allah.",
        },
        insightSource: "HR. Bukhari 969",
        practices: [
            {
                key: "firstTen",
                title: { id: "Perbanyak amal di sepuluh hari pertama", en: "Do more in the first ten days" },
                body: {
                    id: "Perbanyak takbir, tahmid, tahlil, dan amal saleh sejak 1 Dzulhijjah.",
                    en: "Say the takbir, tahmid and tahlil often, and do more good deeds from 1 Dhul Hijjah.",
                },
                source: "HR. Bukhari 969",
            },
            {
                key: "arafah",
                title: { id: "Puasa Arafah (9 Dzulhijjah)", en: "Fast of Arafah (9 Dhul Hijjah)" },
                body: {
                    id: "Bagi yang tidak berhaji, menghapus dosa setahun yang lalu dan setahun yang akan datang.",
                    en: "For those not on Hajj, it expiates the sins of the past year and the coming year.",
                },
                source: "HR. Muslim 1162",
            },
            {
                key: "qurban",
                title: { id: "Berkurban", en: "Qurban" },
                body: {
                    id: "Disembelih setelah shalat Iduladha. Batas akhirnya berbeda menurut mazhab (Syafi'i: 13 Dzulhijjah).",
                    en: "Slaughtered after the Eid al-Adha prayer. The last day differs by madhhab (Shafi'i: 13 Dhul Hijjah).",
                },
                source: "QS. Al-Kautsar: 2; QS. Al-Hajj: 28",
            },
        ],
    },
];

export function getHijriMonthInfo(month: number): HijriMonthInfo | undefined {
    return HIJRI_MONTH_INFO.find(info => info.month === month);
}

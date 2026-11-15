/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Nawaetu's own notes beside the concise sirah. They sit outside the book text, which must stay unchanged,
 * and are shown under a "Catatan Nawaetu" label. Related hadiths are copied unchanged from HadeethEnc.com
 * (credit and link required); only the translation is shown, not the Arabic. Quran translations are copied
 * unchanged from QuranEnc.com (indonesian_affairs, english_saheeh), footnotes included, on 2026-11-15.
 */

import type { ConciseSirahSection } from "./index";

/** A collection and hadith number, filled in only once checked against the collection itself. */
export interface ConciseHadithReference {
    collection: string;
    number: string;
}

export interface ConciseNoteHadith {
    hadeethEncId: number;
    translation: string;
    translationEn: string;
    attributionId: string;
    attributionEn: string;
    gradeId: string;
    gradeEn: string;
    // HadeethEnc gives no hadith numbers; until a number is verified the HadeethEnc attribution is shown alone.
    references?: ConciseHadithReference[];
}

export type ConciseOriginSource =
    | { kind: "sirah"; href: string; labelId: string; labelEn: string }
    | { kind: "quran"; labelId: string; labelEn: string; textId: string; textEn: string; footnotesEn?: string[] }
    | { kind: "hadith"; hadith: ConciseNoteHadith };

/** Where a group of the Prophet's names came from, each claim tied to a source readers can check. */
export interface ConciseNameOrigin {
    fromId: string;
    fromEn: string;
    names: string[];
    detailId: string;
    detailEn: string;
    sources: ConciseOriginSource[];
}

export interface ConciseNote {
    contextId: string;
    contextEn: string;
    reflectId: string;
    reflectEn: string;
    hadith?: ConciseNoteHadith;
    origins?: ConciseNameOrigin[];
}

// Keyed "<sectionId>:<first chapter>-<last chapter>" of a reading page ("s03:3" for a one-chapter page), so a page shows one note.
// Only parts that split into the same pages in both editions get notes (pilot: s03); a test keeps keys and pages in step.
export const CONCISE_NOTES: Record<string, ConciseNote> = {
    "s03:1-2": {
        contextId: "Kisah dibuka dengan silsilah beliau. Bagi orang Arab, nasab adalah identitas dan kehormatan, dan silsilah Nabi Muhammad SAW bersambung sampai Nabi Ismail, putra Nabi Ibrahim. Hadits sesudahnya menegaskan bahwa Allah memilih Bani Hasyim, lalu memilih beliau dari mereka: kemuliaan itu pilihan Allah, bukan hasil usaha manusia.",
        contextEn: "The story opens with his lineage. For the Arabs, lineage was identity and honour, and the lineage of Prophet Muhammad SAW reaches back to Prophet Ismail, son of Prophet Ibrahim. The hadith that follows says Allah chose Banu Hashim and then chose him from among them: that honour was Allah's choice, not something a person could earn.",
        reflectId: "Nasab yang mulia adalah pilihan Allah, sedangkan akhlak adalah pilihan kita. Akhlak seperti apa yang ingin kamu jaga agar nama baik keluargamu terjaga?",
        reflectEn: "A noble lineage is Allah's choice, while character is ours. Which manners do you want to keep so that your family's good name is kept too?",
    },
    "s03:3": {
        contextId: "Dari mana nama-nama di atas? Ada yang dipilih keluarga beliau, ada yang disebut Al-Qur'an, ada yang disebut Nabi Muhammad SAW sendiri, dan ada yang diberikan kaumnya. Buka setiap kelompok untuk melihat sumbernya.",
        contextEn: "Where do the names above come from? Some were chosen by his family, some are in the Quran, some he gave himself, and one came from his people. Open each group to see its source.",
        reflectId: "Setiap nama beliau bermakna kebaikan. Sifat baik apa yang ingin kamu tanamkan, sehingga orang mengenalmu karenanya?",
        reflectEn: "Every one of his names means something good. Which good quality do you want to grow, so that people know you by it?",
        origins: [
            {
                fromId: "Dari keluarga beliau",
                fromEn: "From his family",
                names: ["Muhammad"],
                detailId: "Kakek beliau, Abdul Muththalib, memilih nama Muhammad saat beliau lahir. Menurut teks Sirah Lengkap, nama ini belum dikenal di kalangan Arab.",
                detailEn: "His grandfather, Abdul Muttalib, chose the name Muhammad when he was born. The Complete Sirah says the name was not yet known among the Arabs.",
                sources: [{ kind: "sirah", href: "/sirah/kelahiran-dan-empat-puluh-tahun-sebelum-nubuwah/sec-001", labelId: "Sirah Lengkap: Kelahiran", labelEn: "Complete Sirah: Birth (Indonesian)" }],
            },
            {
                fromId: "Dari Al-Qur'an",
                fromEn: "From the Quran",
                names: ["Ahmad", "Al-Basyir", "As-Sirajul Munir"],
                detailId: "Nama Ahmad disebut Nabi Isa AS saat memberi kabar gembira tentang rasul sesudahnya. Allah juga menyebut beliau pembawa kabar gembira dan cahaya yang menerangi.",
                detailEn: "The name Ahmad was announced by Prophet Isa AS as good news of the messenger to come after him. Allah also calls him a bringer of good tidings and an illuminating lamp.",
                sources: [
                    {
                        kind: "quran",
                        labelId: "QS. Ash-Shaff [61]: 6 · Terjemahan Kemenag (QuranEnc)",
                        labelEn: "Quran 61:6 · Saheeh International (QuranEnc)",
                        textId: "Dan (ingatlah) ketika Isa Putra Maryam berkata, \"Wahai Bani Israil! Sesungguhnya aku utusan Allah kepadamu, yang membenarkan kitab (yang turun) sebelumku, yaitu Taurat, dan memberi kabar gembira dengan seorang rasul yang akan datang setelahku, yang namanya Ahmad (Muhammad).\" Namun ketika Rasul itu datang kepada mereka dengan membawa bukti-bukti yang nyata, mereka berkata, \"Ini adalah sihir yang nyata.\"",
                        textEn: "And [mention] when Jesus, the son of Mary, said, \"O Children of Israel, indeed I am the messenger of Allāh to you confirming what came before me of the Torah and bringing good tidings of a messenger to come after me, whose name is Aḥmad.\"[1682] But when he came to them with clear evidences, they said, \"This is obvious magic.\"[1683]",
                        footnotesEn: ["[1682] Another name of Prophet Muḥammad (ﷺ).", "[1683] i.e., fraud or deception."],
                    },
                    {
                        kind: "quran",
                        labelId: "QS. Al-Ahzab [33]: 45–46 · Terjemahan Kemenag (QuranEnc)",
                        labelEn: "Quran 33:45–46 · Saheeh International (QuranEnc)",
                        textId: "Wahai Nabi! Sesungguhnya Kami mengutusmu untuk menjadi saksi, pembawa kabar gembira dan pemberi peringatan, dan untuk menjadi penyeru kepada (agama) Allah dengan izin-Nya dan sebagai cahaya yang menerangi.",
                        textEn: "O Prophet, indeed We have sent you as a witness and a bringer of good tidings and a warner And one who invites to Allāh, by His permission, and an illuminating lamp.",
                    },
                ],
            },
            {
                fromId: "Dari Nabi Muhammad SAW sendiri",
                fromEn: "From Prophet Muhammad SAW himself",
                names: ["Muhammad", "Ahmad", "Al-Mahi", "Al-Hasyir", "Al-'Aqib", "Al-Muqaffi", "Nabiyyur Rahmah", "Nabiyyut Taubah", "Nabiyyul Malhamah"],
                detailId: "Beliau sendiri menyebut nama-nama ini kepada para sahabat, seperti dalam dua hadits sahih di bawah. Gelar Sayyidu Waladi Adam juga dari sabda beliau, yang dikutip buku ini.",
                detailEn: "He named these himself to his Companions, as in the two authentic hadiths below. The title Master of the children of Adam is also from his words, quoted in the book.",
                sources: [
                    {
                        kind: "hadith",
                        hadith: {
                            hadeethEncId: 10860,
                            translation: "Jubair bin Muṭ'im -raḍiyallāhu 'anhu- berkata, Rasulullah-ṣallallāhu 'alaihi wa sallam- bersabda, \"Aku memiliki lima nama. Aku adalah Muhammad dan Ahmad. Aku juga Al-Māḥī (penghapus) yang dengan perantaraku Allah menghapuskan kekafiran. Aku juga Al Ḥāsyir (penghimpun) karena manusia akan dibangkitkan setelahku, dan aku juga Al-'Āqib (penutup).\"",
                            translationEn: "Jubayr ibn Mut‘im (may Allah be pleased with him) reported that the Messenger of Allah (may Allah's peace and blessings be upon him) said: \"I have five names. I am Muhammad. I am Ahmad. I am Al-Māhi (the effacer), by whom Allah effaces disbelief. I am Al-Hāshir (the gatherer), at whose feet people will be gathered. I am Al-‘Vqib (the last).\"",
                            attributionId: "Muttafaq 'alaih",
                            attributionEn: "Narrated by Bukhari & Muslim",
                            gradeId: "Hadis sahih",
                            gradeEn: "Authentic hadith",
                        },
                    },
                    {
                        kind: "hadith",
                        hadith: {
                            hadeethEncId: 10861,
                            translation: "Abu Musa -raḍiyallāhu 'anhu- berkata, Rasulullah -ṣallallāhu 'alaihi wa sallam- telah menyebutkan pada kami nama-nama bagi dirinya, sebagiannya kami hafal. Beliau bersabda, \"Aku adalah Muhammad, Ahmad, Al-Muqaffī, Al-Ḥāsyir, dan Nabi Ar-Raḥmah.\" Yazid berkata, \"Juga Nabi At-Taubah dan Nabi Al-Malḥamah.\"",
                            translationEn: "Abu Mūsa (may Allah be pleased with him) reported: The Messenger of Allah (may Allah's peace and blessings be upon him) called himself with many names, and we memorized some of them. He said: \"I am Muhammad, Ahmad, Al-Muqaffi, Al-Hāshir, and the Prophet of Mercy.\" Yazīd added: \"The Prophet of Repentance and Nabyy al-Malhamah.\"",
                            attributionId: "Diriwayatkan oleh Ahmad - Diriwayatkan oleh Muslim",
                            attributionEn: "Narrated by Ahmad - Narrated by Muslim",
                            gradeId: "Hadis sahih",
                            gradeEn: "Authentic hadith",
                        },
                    },
                ],
            },
            {
                fromId: "Dari kaum Quraisy",
                fromEn: "From the Quraysh",
                names: ["Al-Amin"],
                detailId: "Jauh sebelum beliau diutus menjadi nabi, kaumnya sendiri menjulukinya Al-Amin, orang yang dapat dipercaya, karena kejujuran dan akhlaknya.",
                detailEn: "Long before he was sent as a prophet, his own people called him Al-Amin, the trustworthy, for his honesty and character.",
                sources: [{ kind: "sirah", href: "/sirah/kelahiran-dan-empat-puluh-tahun-sebelum-nubuwah/sec-013", labelId: "Sirah Lengkap: Daya Tarik Kepribadian Sebelum Nubuwah", labelEn: "Complete Sirah: His character before prophethood (Indonesian)" }],
            },
        ],
    },
    "s03:4-5": {
        contextId: "Dua bab ini menggambarkan beliau dari dalam dan dari luar. Pertama gambaran besarnya, dari ucapan beliau sendiri, ayat Al-Qur'an, dan kesaksian Aisyah RA bahwa akhlak beliau adalah Al-Qur'an. Lalu rupa beliau, yang digambarkan para sahabat dengan sangat rinci, dari wajah sampai keringatnya, karena begitulah mereka menjaga ingatan tentang orang yang paling mereka cintai.",
        contextEn: "These two chapters describe him from within and without. First the big picture, from his own words, a verse of the Quran, and the testimony of Aisyah RA that his character was the Quran. Then his appearance, which the Companions described in fine detail, from his face to his sweat, because that is how they kept the memory of the person they loved most.",
        reflectId: "Aisyah RA menggambarkan akhlak beliau sebagai Al-Qur'an. Ayat apa yang ingin kamu amalkan hari ini, bukan hanya dibaca?",
        reflectEn: "Aisyah RA described his character as the Quran. Which verse do you want to act on today, not only read?",
    },
    "s03:6": {
        contextId: "Inilah inti bagian ini: akhlak beliau sehari-hari, kepada Allah, keluarga, pelayan, sahabat, sampai kepada orang yang bersikap kasar. Banyak di antaranya bisa langsung kita praktikkan hari ini.",
        contextEn: "This is the heart of the part: his daily manners towards Allah, his family, those who served him, his Companions, and even people who were rude. Much of it can be practised today.",
        reflectId: "Dari akhlak-akhlak ini, mana yang paling jauh dari kebiasaanmu sekarang?",
        reflectEn: "Of these manners, which one is furthest from your habits right now?",
    },
};

export function conciseNoteKey(sectionId: string, chapterNumbers: number[]): string {
    const first = chapterNumbers[0];
    const last = chapterNumbers[chapterNumbers.length - 1];
    return `${sectionId}:${first === last ? first : `${first}-${last}`}`;
}

/** The single note for a reading page, keyed by the chapters on it. */
export function getConciseNote(page: { section: Pick<ConciseSirahSection, "id">; chapters: { number: number }[] }): ConciseNote | undefined {
    return CONCISE_NOTES[conciseNoteKey(page.section.id, page.chapters.map((c) => c.number))];
}

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export interface ReflectionDalil {
    id: string;
    textId: string;
    textEn: string;
    arabic?: string;
    sourceId: string;
    sourceEn: string;
}

export const reflectionDalils: ReflectionDalil[] = [
    {
        id: "umar-hisab",
        arabic: "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا",
        textId: "Hisablah dirimu sebelum engkau dihisab (oleh Allah).",
        textEn: "Hold yourselves accountable before you are held accountable.",
        sourceId: "Umar bin Khattab",
        sourceEn: "Umar ibn Al-Khattab"
    },
    {
        id: "hasan-days",
        textId: "Wahai anak Adam, sesungguhnya engkau adalah kumpulan hari-hari. Jika satu hari berlalu, maka sebagian dirimu juga pergi.",
        textEn: "O son of Adam, you are but a collection of days. When a day passes, a part of you passes with it.",
        sourceId: "Hasan Al-Basri",
        sourceEn: "Hasan Al-Basri"
    },
    {
        id: "muhasabah-heart",
        textId: "Orang yang berakal harus memiliki waktu khusus untuk menyendiri bermuhasabah menata hatinya.",
        textEn: "A wise person must have a dedicated time alone for self-reflection to mend their heart.",
        sourceId: "Imam Syafi'i",
        sourceEn: "Imam Ash-Shafi'i"
    },
    {
        id: "taubat-daily",
        arabic: "إِنِّي لَأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ مِائَةَ مَرَّةٍ",
        textId: "Sesungguhnya aku memohon ampun kepada Allah dan bertaubat kepada-Nya dalam sehari sebanyak seratus kali.",
        textEn: "Verily, I seek the forgiveness of Allah and turn to Him in repentance a hundred times a day.",
        sourceId: "HR. Muslim",
        sourceEn: "Sahih Muslim"
    },
    // Civic life verses: Arabic and translations copied unchanged from QuranEnc.com
    // (indonesian_affairs v1.0.1, english_saheeh v1.1.2). Update when QuranEnc releases a new version.
    {
        id: "quran-4-58-amanah",
        arabic: "۞ إِنَّ ٱللَّهَ يَأۡمُرُكُمۡ أَن تُؤَدُّواْ ٱلۡأَمَٰنَٰتِ إِلَىٰٓ أَهۡلِهَا وَإِذَا حَكَمۡتُم بَيۡنَ ٱلنَّاسِ أَن تَحۡكُمُواْ بِٱلۡعَدۡلِۚ إِنَّ ٱللَّهَ نِعِمَّا يَعِظُكُم بِهِۦٓۗ إِنَّ ٱللَّهَ كَانَ سَمِيعَۢا بَصِيرٗا",
        textId: "Sungguh, Allah menyuruhmu menyampaikan amanah kepada yang berhak menerimanya, dan apabila kamu menetapkan hukum di antara manusia hendaknya kamu menetapkannya dengan adil. Sungguh, Allah sebaik-baik yang memberi pengajaran kepadamu. Sungguh, Allah Maha Mendengar, Maha Melihat.",
        textEn: "Indeed, Allāh commands you to render trusts to whom they are due and when you judge between people to judge with justice. Excellent is that which Allāh instructs you. Indeed, Allāh is ever Hearing and Seeing.",
        sourceId: "QS. An-Nisa' [4]: 58 · Terjemahan Kemenag (QuranEnc)",
        sourceEn: "Quran 4:58 · Saheeh International (QuranEnc)"
    },
    {
        id: "quran-49-6-tabayyun",
        arabic: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓاْ إِن جَآءَكُمۡ فَاسِقُۢ بِنَبَإٖ فَتَبَيَّنُوٓاْ أَن تُصِيبُواْ قَوۡمَۢا بِجَهَٰلَةٖ فَتُصۡبِحُواْ عَلَىٰ مَا فَعَلۡتُمۡ نَٰدِمِينَ",
        textId: "Wahai orang-orang yang beriman! Jika seorang yang fasik datang kepadamu membawa suatu berita, maka telitilah kebenarannya, agar kamu tidak mencelakakan suatu kaum karena kebodohan (kecerobohan), yang akhirnya kamu menyesali perbuatanmu itu.",
        textEn: "O you who have believed, if there comes to you a disobedient one with information, investigate, lest you harm a people out of ignorance and become, over what you have done, regretful.",
        sourceId: "QS. Al-Hujurat [49]: 6 · Terjemahan Kemenag (QuranEnc)",
        sourceEn: "Quran 49:6 · Saheeh International (QuranEnc)"
    },
    {
        id: "quran-5-8-adil",
        arabic: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ كُونُواْ قَوَّٰمِينَ لِلَّهِ شُهَدَآءَ بِٱلۡقِسۡطِۖ وَلَا يَجۡرِمَنَّكُمۡ شَنَـَٔانُ قَوۡمٍ عَلَىٰٓ أَلَّا تَعۡدِلُواْۚ ٱعۡدِلُواْ هُوَ أَقۡرَبُ لِلتَّقۡوَىٰۖ وَٱتَّقُواْ ٱللَّهَۚ إِنَّ ٱللَّهَ خَبِيرُۢ بِمَا تَعۡمَلُونَ",
        textId: "Wahai orang-orang yang beriman! Jadilah kamu sebagai penegak keadilan karena Allah, (ketika) menjadi saksi dengan adil. Dan janganlah kebencianmu terhadap suatu kaum, mendorong kamu untuk berlaku tidak adil. Berlaku adillah. Karena (adil) itu lebih dekat kepada takwa. Dan bertakwalah kepada Allah, sungguh, Allah Mahateliti atas apa yang kamu kerjakan.",
        textEn: "O you who have believed, be persistently standing firm for Allāh, witnesses in justice, and do not let the hatred of a people prevent you from being just. Be just; that is nearer to righteousness. And fear Allāh; indeed, Allāh is [fully] Aware of what you do.",
        sourceId: "QS. Al-Ma'idah [5]: 8 · Terjemahan Kemenag (QuranEnc)",
        sourceEn: "Quran 5:8 · Saheeh International (QuranEnc)"
    },
    {
        id: "quran-20-44-lemah-lembut",
        arabic: "فَقُولَا لَهُۥ قَوۡلٗا لَّيِّنٗا لَّعَلَّهُۥ يَتَذَكَّرُ أَوۡ يَخۡشَىٰ",
        textId: "maka berbicaralah kamu berdua kepadanya (Fir'aun) dengan kata-kata yang lemah lembut, mudah-mudahan dia sadar atau takut.\"",
        textEn: "And speak to him with gentle speech that perhaps he may be reminded or fear [Allāh].\"",
        sourceId: "QS. Taha [20]: 44 · Terjemahan Kemenag (QuranEnc)",
        sourceEn: "Quran 20:44 · Saheeh International (QuranEnc)"
    }
];

export function getRandomReflectionDalil(): ReflectionDalil {
    const randomIndex = Math.floor(Math.random() * reflectionDalils.length);
    return reflectionDalils[randomIndex];
}

export interface IntentionDalil {
    id: string;
    textId: string;
    textEn: string;
    arabic?: string;
    sourceId: string;
    sourceEn: string;
}

export const intentionDalils: IntentionDalil[] = [
    {
        id: "niat-core",
        arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        textId: "Amal itu tergantung niatnya.",
        textEn: "Actions are but by intentions.",
        sourceId: "HR. Bukhari",
        sourceEn: "Sahih Bukhari"
    },
    {
        id: "ikhlas-focus",
        arabic: "وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        textId: "Seseorang hanya mendapatkan sesuai yang ia niatkan.",
        textEn: "A person only gets what they intended.",
        sourceId: "HR. Bukhari",
        sourceEn: "Sahih Bukhari"
    },
    {
        id: "ibn-mubarak",
        textId: "Banyak amal kecil jadi besar karena niat.",
        textEn: "Many small deeds become great because of intention.",
        sourceId: "Ibn Al-Mubarak",
        sourceEn: "Ibn Al-Mubarak"
    },
    {
        id: "yahya",
        textId: "Pelajarilah niat, ia lebih penting dari amal itu sendiri.",
        textEn: "Learn true intention, for it is more important than the action.",
        sourceId: "Yahya bin Abi Katsir",
        sourceEn: "Yahya b. Abi Kathir"
    },
    {
        id: "umar",
        textId: "Tidak ada amal bagi yang tidak berniat.",
        textEn: "There is no deed for one without an intention.",
        sourceId: "Umar bin Khattab",
        sourceEn: "Umar ibn Al-Khattab"
    },
    {
        id: "heart-matters",
        arabic: "وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
        textId: "Allah melihat ke dalam hatimu, bukan rupamu.",
        textEn: "Allah looks at your hearts, not your appearances.",
        sourceId: "HR. Muslim",
        sourceEn: "Sahih Muslim"
    },
    {
        id: "istiqomah",
        arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ",
        textId: "Amal terbaik adalah yang konsisten, walau sedikit.",
        textEn: "The most beloved deeds to Allah are the consistent ones, even if small.",
        sourceId: "HR. Muslim",
        sourceEn: "Sahih Muslim"
    },
    {
        id: "hasan",
        textId: "Waktumu adalah dirimu. Satu hari berlalu, sebagian dirimu pun pergi.",
        textEn: "You are your days. When a day passes, a part of you is gone.",
        sourceId: "Hasan Al-Basri",
        sourceEn: "Hasan Al-Basri"
    }
];

export function getRandomDalil(): IntentionDalil {
    const randomIndex = Math.floor(Math.random() * intentionDalils.length);
    return intentionDalils[randomIndex];
}

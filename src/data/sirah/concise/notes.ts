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
    /** The Indonesian edition's chapter numbers on this page; a test checks they still match the page. */
    covers: number[];
    contextId: string;
    contextEn: string;
    reflectId: string;
    reflectEn: string;
    hadith?: ConciseNoteHadith;
    origins?: ConciseNameOrigin[];
}

// Keyed "<sectionId>/<page number>": one note per reading page, for every page with text in both editions. Both editions share page breaks (see paginate), and
// `covers` records the chapters each note was written for, so a test fails if the pages ever shift.
export const CONCISE_NOTES: Record<string, ConciseNote> = {
    "s03/1": {
        covers: [1, 2],
        contextId: "Kisah dibuka dengan silsilah beliau. Bagi orang Arab, nasab adalah identitas dan kehormatan, dan silsilah Nabi Muhammad SAW bersambung sampai Nabi Ismail, putra Nabi Ibrahim. Hadits sesudahnya menegaskan bahwa Allah memilih Bani Hasyim, lalu memilih beliau dari mereka: kemuliaan itu pilihan Allah, bukan hasil usaha manusia.",
        contextEn: "The story opens with his lineage. For the Arabs, lineage was identity and honour, and the lineage of Prophet Muhammad SAW reaches back to Prophet Ismail, son of Prophet Ibrahim. The hadith that follows says Allah chose Banu Hashim and then chose him from among them: that honour was Allah's choice, not something a person could earn.",
        reflectId: "Nasab yang mulia adalah pilihan Allah, sedangkan akhlak adalah pilihan kita. Akhlak seperti apa yang ingin kamu jaga agar nama baik keluargamu terjaga?",
        reflectEn: "A noble lineage is Allah's choice, while character is ours. Which manners do you want to keep so that your family's good name is kept too?",
    },
    "s03/2": {
        covers: [3],
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
    "s03/3": {
        covers: [4, 5],
        contextId: "Dua bab ini menggambarkan beliau dari dalam dan dari luar. Pertama gambaran besarnya, dari ucapan beliau sendiri, ayat Al-Qur'an, dan kesaksian Aisyah RA bahwa akhlak beliau adalah Al-Qur'an. Lalu rupa beliau, yang digambarkan para sahabat dengan sangat rinci, dari wajah sampai keringatnya, karena begitulah mereka menjaga ingatan tentang orang yang paling mereka cintai.",
        contextEn: "These two chapters describe him from within and without. First the big picture, from his own words, a verse of the Quran, and the testimony of Aisyah RA that his character was the Quran. Then his appearance, which the Companions described in fine detail, from his face to his sweat, because that is how they kept the memory of the person they loved most.",
        reflectId: "Aisyah RA menggambarkan akhlak beliau sebagai Al-Qur'an. Ayat apa yang ingin kamu amalkan hari ini, bukan hanya dibaca?",
        reflectEn: "Aisyah RA described his character as the Quran. Which verse do you want to act on today, not only read?",
    },
    "s03/4": {
        covers: [6],
        contextId: "Inilah inti bagian ini: akhlak beliau sehari-hari, kepada Allah, keluarga, pelayan, sahabat, sampai kepada orang yang bersikap kasar. Banyak di antaranya bisa langsung kita praktikkan hari ini.",
        contextEn: "This is the heart of the part: his daily manners towards Allah, his family, those who served him, his Companions, and even people who were rude. Much of it can be practised today.",
        reflectId: "Dari akhlak-akhlak ini, mana yang paling jauh dari kebiasaanmu sekarang?",
        reflectEn: "Of these manners, which one is furthest from your habits right now?",
    },
    "s04/1": {
        covers: [1],
        contextId: "Bagian ini masuk ke tuntunan Nabi Muhammad SAW dalam keseharian, dimulai dari hal yang kita lakukan setiap hari: berpakaian, makan, dan minum. Kesederhanaan dan rasa syukur terlihat dari pakaian beliau yang tidak untuk pamer sampai cara beliau menyikapi makanan.",
        contextEn: "This part turns to the daily guidance of Prophet Muhammad SAW, starting with what we do every day: dressing, eating and drinking. Simplicity and gratitude run through it, from clothes that were never for show to the way he treated his food.",
        reflectId: "Beliau tidak pernah mencela makanan. Bagaimana jika saat makan berikutnya kamu hanya mengucapkan yang baik tentang hidangan yang ada?",
        reflectEn: "He never found fault with food. What if, at your next meal, you only said good things about what is served?",
    },
    "s04/2": {
        covers: [2],
        contextId: "Bab ini memperlihatkan Nabi Muhammad SAW di rumahnya: adil kepada para istrinya dalam giliran dan nafkah, sekaligus lembut dan senang bercanda dengan keluarganya.",
        contextEn: "This chapter shows Prophet Muhammad SAW at home: fair to his wives in their turns and provision, and gentle and playful with his family.",
        reflectId: "Beliau menyempatkan diri bercanda dengan keluarganya. Kapan terakhir kali kamu tertawa bersama orang-orang di rumah?",
        reflectEn: "He made time to joke and play with his family. When did you last laugh together with the people at home?",
    },
    "s04/3": {
        covers: [3],
        contextId: "Hari Nabi Muhammad SAW dibuka dan ditutup dengan mengingat Allah: doa dan bacaan sebelum tidur, serta pujian kepada Allah begitu bangun. Tidurnya pun cukup, tidak berlebihan dan tidak kurang.",
        contextEn: "The day of Prophet Muhammad SAW opened and closed with the remembrance of Allah: prayers and recitation before sleep, and praise of Allah on waking. His sleep was enough, neither too much nor too little.",
        reflectId: "Doa sebelum tidur dan sesudah bangun hanya butuh beberapa detik. Doa mana yang ingin kamu hafalkan lebih dulu?",
        reflectEn: "The prayers before sleeping and after waking take only a few seconds. Which one do you want to learn first?",
    },
    "s04/4": {
        covers: [4],
        contextId: "Di tengah masyarakat, Nabi Muhammad SAW hadir untuk orang lain: menjenguk yang sakit, memenuhi undangan, membantu yang lemah, dan tetap mengerjakan keperluannya sendiri tanpa merasa lebih tinggi.",
        contextEn: "Among people, Prophet Muhammad SAW was there for others: visiting the sick, accepting invitations, helping the weak, and still doing his own chores without seeing himself as above them.",
        reflectId: "Beliau menambal sandal dan menjahit bajunya sendiri. Pekerjaan kecil apa di rumah yang bisa kamu kerjakan sendiri minggu ini?",
        reflectEn: "He mended his own sandals and sewed his own clothes. Which small task at home could you do yourself this week?",
    },
    "s04/5": {
        covers: [5,  6,  7],
        contextId: "Tiga bab pendek ini menunjukkan bahwa ibadah beliau menyatu dengan hal-hal kecil: cara berjalan, dzikir yang mengiringi hampir setiap kegiatan, dan sunnah fitrah untuk menjaga kebersihan diri.",
        contextEn: "These three short chapters show how his worship was woven into small things: the way he walked, remembrance of Allah through almost every activity, and the sunnahs of natural disposition that keep the body clean.",
        reflectId: "Dzikir beliau mengiringi hal-hal kecil, seperti keluar rumah atau memakai pakaian. Momen sehari-hari mana yang ingin kamu temani dengan dzikir?",
        reflectEn: "His remembrance of Allah went with small moments, like leaving the house or getting dressed. Which daily moment do you want to accompany with dhikr?",
    },
    "s04/6": {
        covers: [8],
        contextId: "Bab ini menggambarkan beliau saat berbicara, tertawa, menangis, dan berkhutbah. Semuanya penuh ketenangan: ucapan yang pelan dan jelas, tawa berupa senyuman, dan tangis karena kasih sayang atau takut kepada Allah.",
        contextEn: "This chapter describes him speaking, laughing, crying and giving sermons. All of it was calm: speech slow and clear, laughter a smile, and tears out of mercy or fear of Allah.",
        reflectId: "Beliau berbicara pelan dan jelas sampai orang bisa menghafal ucapannya. Dalam percakapan mana kamu ingin lebih tenang dan tidak terburu-buru?",
        reflectEn: "He spoke so slowly and clearly that people could memorise his words. In which conversations do you want to be calmer and less rushed?",
    },
    "s05/1": {
        covers: [1],
        contextId: "Bagian ini mengumpulkan keistimewaan Nabi Muhammad SAW dari ayat dan hadits, dari diutusnya beliau untuk seluruh manusia sampai Al-Qur'an sebagai mukjizat terbesarnya. Benang merahnya: mencintai dan mengikuti beliau adalah bagian dari iman.",
        contextEn: "This part gathers the special traits of Prophet Muhammad SAW from verses and hadiths, from his being sent to all people to the Quran as his greatest miracle. The common thread: loving and following him is part of faith.",
        reflectId: "Ayat Ali Imran 31 mengaitkan cinta kepada Allah dengan mengikuti Nabi Muhammad SAW. Sunnah kecil apa yang ingin kamu coba berikutnya?",
        reflectEn: "Ali Imran 31 links loving Allah with following Prophet Muhammad SAW. Which small sunnah do you want to try next?",
    },
    "s06/1": {
        covers: [1,  2],
        contextId: "Bagian ini mengenalkan keluarga Nabi Muhammad SAW. Hampir semua anak beliau wafat lebih dulu kecuali Fathimah RA, dan dari sebelas pamannya hanya Hamzah RA dan Al-Abbas RA yang masuk Islam.",
        contextEn: "This part introduces the family of Prophet Muhammad SAW. Almost all his children died before him except Fatimah RA, and of his eleven uncles only Hamzah RA and Al-Abbas RA embraced Islam.",
        reflectId: "Beliau kehilangan hampir semua anaknya, dan tidak semua pamannya masuk Islam. Bagaimana kisah ini mengubah caramu memandang ujian dalam keluarga?",
        reflectEn: "He lost almost all his children, and not all his uncles embraced Islam. How does this change the way you see trials within a family?",
    },
    "s06/2": {
        covers: [3,  4,  5],
        contextId: "Setelah enam bibi beliau dan ungkapan untuk menghafal nama para istrinya, kisah dimulai dari Khadijah RA. Ia istri pertama yang mendukung beliau dengan jiwa dan hartanya, dan beliau tidak menikah lagi selama Khadijah RA hidup.",
        contextEn: "After his six aunts and a phrase for remembering his wives' names, the story begins with Khadijah RA. She was his first wife and supported him with her self and her wealth, and he married no one else while she lived.",
        reflectId: "Khadijah RA mendukung Nabi Muhammad SAW dengan apa yang ia miliki. Siapa yang selama ini setia mendukungmu, dan bagaimana kamu ingin berterima kasih kepadanya?",
        reflectEn: "Khadijah RA supported Prophet Muhammad SAW with all she had. Who has stood by you, and how would you like to thank them?",
    },
    "s06/3": {
        covers: [6,  7],
        contextId: "Halaman ini berlanjut ke Saudah RA dan Aisyah RA. Aisyah RA, istri yang paling dicintai beliau, dibersihkan dari fitnah melalui wahyu, dan ilmunya membuat para sahabat senior meminta fatwa kepadanya.",
        contextEn: "This page continues with Saudah RA and Aisyah RA. Aisyah RA, the wife he loved most, was cleared of slander by revelation, and her knowledge led senior Companions to seek her rulings.",
        reflectId: "Saudah RA memberikan gilirannya kepada Aisyah RA. Hal apa yang pernah kamu berikan demi kebahagiaan orang yang kamu sayangi?",
        reflectEn: "Saudah RA gave her turn to Aisyah RA. What have you given up for the happiness of someone you love?",
    },
    "s06/4": {
        covers: [8,  9,  10,  11,  12],
        contextId: "Lima istri berikutnya masing-masing punya kisah: ada yang menjanda karena perang, ada yang dijuluki ibunya orang-orang miskin, dan ada pernikahan yang disebut dalam Al-Qur'an sebagai pelajaran bagi umat.",
        contextEn: "The next five wives each have their own story: one widowed by war, one called the mother of the poor, and one marriage the Quran mentions as a lesson for the community.",
        reflectId: "Zainab binti Khuzaimah RA dikenal karena kepeduliannya kepada orang miskin. Kebaikan apa yang kamu harap diingat orang darimu?",
        reflectEn: "Zainab bint Khuzaimah RA is remembered for her care for the poor. What kindness do you hope people remember you for?",
    },
    "s06/5": {
        covers: [13,  14,  15],
        contextId: "Halaman ini menutup daftar istri Nabi Muhammad SAW, sampai Maimunah RA, istri terakhir yang beliau nikahi. Saat beliau wafat, beliau meninggalkan sembilan istri.",
        contextEn: "This page closes the list of the wives of Prophet Muhammad SAW, ending with Maimunah RA, the last he married. When he passed away, he left nine wives.",
        reflectId: "Kisah setiap istri beliau masih diceritakan sampai hari ini. Kisah baik apa yang ingin kamu tinggalkan untuk keluargamu?",
        reflectEn: "The story of each of his wives is still told today. What good story do you want to leave for your family?",
    },
    "s08/1": {
        covers: [1,  2,  3,  4,  5],
        contextId: "Kisah hidup beliau dimulai: lahir di Mekah dalam keadaan yatim, lalu diasuh kakek dan pamannya, Abu Thalib. Sejak bayi, banyak tangan yang ikut merawat beliau.",
        contextEn: "His life story begins: born in Makkah an orphan, then raised by his grandfather and his uncle, Abu Talib. From infancy, many hands cared for him.",
        reflectId: "Nabi Muhammad SAW tumbuh dalam asuhan banyak orang setelah kehilangan orang tuanya. Siapa yang pernah ikut merawatmu, dan bagaimana kamu ingin membalas kebaikannya?",
        reflectEn: "Prophet Muhammad SAW was raised by many people after losing his parents. Who helped raise you, and how would you like to repay their kindness?",
    },
    "s08/2": {
        covers: [6,  7],
        contextId: "Beliau memuliakan para wanita yang dulu mengasuhnya, seperti saat membentangkan selendang untuk Syaima', saudari sesusuannya. Masa menggembala kambing disebut menumbuhkan kesabaran dan kasih sayang kepada yang lemah.",
        contextEn: "He honoured the women who had cared for him, as when he spread his cloak for Shaima, his foster sister. His years tending sheep are said to have grown patience and care for the weak.",
        reflectId: "Beliau membentangkan selendangnya untuk Syaima' sebagai bentuk penghormatan. Siapa dari masa kecilmu yang ingin kamu hormati dengan cara serupa?",
        reflectEn: "He spread his cloak for Shaima as a mark of honour. Who from your childhood would you like to honour in a similar way?",
    },
    "s08/3": {
        covers: [8,  9,  10,  11],
        contextId: "Masa dewasa beliau sebelum kenabian: berniaga, menikah dengan Khadijah RA, dan menengahi perselisihan Quraisy soal Hajar Aswad dengan adil. Menjelang usia 40, beliau sering menyendiri beribadah di Gua Hira.",
        contextEn: "His adult years before prophethood: trading, marrying Khadijah RA, and settling the Quraysh dispute over the Black Stone fairly. Nearing forty, he often withdrew to worship in the cave of Hira.",
        reflectId: "Dengan selendang, beliau membuat setiap kabilah ikut mengangkat Hajar Aswad. Dalam perselisihan di sekitarmu, adakah cara agar semua pihak merasa dilibatkan?",
        reflectEn: "With a cloak, he let every clan help lift the Black Stone. In a disagreement around you, is there a way to make everyone feel included?",
    },
    "s08/4": {
        covers: [12],
        contextId: "Inilah titik awal kenabian: wahyu pertama di Gua Hira, seperti diceritakan Aisyah RA. Saat beliau pulang dalam keadaan takut, Khadijah RA menenangkannya dengan mengingatkan kebaikan-kebaikan beliau.",
        contextEn: "This is where prophethood begins: the first revelation in the cave of Hira, as Aisyah RA told it. When he came home afraid, Khadijah RA calmed him by reminding him of his good deeds.",
        reflectId: "Khadijah RA menenangkan beliau dengan menyebut kebaikan yang selama ini beliau lakukan. Siapa di dekatmu yang sedang cemas dan butuh diingatkan akan kebaikannya?",
        reflectEn: "Khadijah RA comforted him by naming the good he had done. Who near you is anxious and needs to be reminded of their goodness?",
    },
    "s08/5": {
        covers: [13],
        contextId: "Halaman ini menjelaskan cara-cara wahyu sampai kepada beliau, dari mimpi yang jelas sampai Allah berbicara langsung. Sebagian terasa sangat berat, sampai keringat beliau bercucuran di hari yang dingin.",
        contextEn: "This page explains the ways revelation reached him, from clear dreams to Allah speaking to him directly. Some of it weighed so heavily that he sweated on a cold day.",
        reflectId: "Wahyu kadang terasa sangat berat saat turun kepada beliau. Setelah tahu hal ini, bagaimana kamu ingin menyikapi Al-Qur'an saat membacanya?",
        reflectEn: "Revelation sometimes weighed heavily on him. Knowing this, how do you want to approach the Quran when you read it?",
    },
    "s08/6": {
        covers: [14,  15,  16,  17,  18],
        contextId: "Dakwah beliau meluas setahap demi setahap, dari keluarga dekat sampai seluruh manusia, dari sembunyi-sembunyi sampai terang-terangan. Orang-orang pertama yang beriman datang dari latar yang sangat berbeda.",
        contextEn: "His call spread step by step, from close family to all people, from secret to open. The first believers came from very different backgrounds.",
        reflectId: "Orang-orang pertama yang beriman datang dari latar yang sangat berbeda. Bagaimana kamu bisa menyambut setiap orang yang ingin belajar agama, apa pun latarnya?",
        reflectEn: "The first believers came from very different backgrounds. How can you welcome anyone who wants to learn about the faith, whatever their background?",
    },
    "s09/1": {
        covers: [1],
        contextId: "Saat pengikutnya bertambah, kaum musyrikin mulai mengganggu, dari tuduhan dusta sampai menyiksa orang beriman yang lemah. Tuduhan itu gugur sendiri, karena kaumnya mengenal beliau sebagai orang yang jujur.",
        contextEn: "As his followers grew, the idolaters began to harass them, from false accusations to torturing weak believers. The accusations fell apart, because his people knew him to be truthful.",
        reflectId: "Tuduhan dusta kepada beliau gugur karena kejujuran yang sudah dikenal kaumnya. Kebiasaan jujur apa yang ingin kamu jaga, agar ucapanmu dipercaya?",
        reflectEn: "The false charges against him failed because his people knew his honesty. Which honest habit do you want to keep, so your word is trusted?",
    },
    "s09/2": {
        covers: [2],
        contextId: "Ketika gangguan makin berat, sebagian kaum Muslimin berhijrah ke Habasyah, negeri dengan raja yang tidak berbuat zalim. Di sana, di bawah naungan Raja Najasyi, mereka akhirnya hidup aman.",
        contextEn: "As the harassment grew worse, some Muslims emigrated to Abyssinia, a land whose king did no injustice. There, under King Negus, they finally lived in safety.",
        reflectId: "Kaum Muslimin pernah menemukan rasa aman di negeri yang rajanya adil. Bagaimana kamu bisa menjadi tempat yang aman bagi orang di sekitarmu yang sedang kesulitan?",
        reflectEn: "The Muslims once found safety in a land with a just king. How can you be a safe place for someone around you who is struggling?",
    },
    "s09/3": {
        covers: [3,  4,  5,  6],
        contextId: "Masa naik-turun di Mekah: Islamnya Hamzah RA dan Umar RA menguatkan kaum beriman, lalu datang pemboikotan, wafatnya Abu Thalib dan Khadijah RA, dan penolakan penduduk Thaif.",
        contextEn: "Ups and downs in Makkah: Hamzah RA and Umar RA embracing Islam strengthened the believers, then came the boycott, the deaths of Abu Talib and Khadijah RA, and rejection in Taif.",
        reflectId: "Beliau mengalami kehilangan dan penolakan dalam waktu yang berdekatan. Saat beberapa kesulitan datang bersamaan, apa yang membantumu tetap bertahan?",
        reflectEn: "He faced loss and rejection close together. When several hardships come at once, what helps you hold on?",
    },
    "s09/4": {
        covers: [7,  8,  9,  10],
        contextId: "Setelah penolakan di Thaif, harapan justru datang: Addas dan sekelompok jin beriman, lalu Isra' dan Mi'raj, saat shalat diwajibkan. Beliau terus menawarkan Islam kepada kabilah-kabilah Arab hingga Islam tersebar di Madinah.",
        contextEn: "After the rejection in Taif, hope came: Addas and a group of jinn believed, then the Night Journey and Ascension, when prayer was made obligatory. He kept offering Islam to the Arab tribes until it reached Madinah.",
        reflectId: "Shalat diwajibkan saat Allah berbicara langsung kepada beliau. Shalat mana yang ingin kamu jaga lebih baik pekan ini?",
        reflectEn: "Prayer was made obligatory when Allah spoke to him directly. Which prayer do you want to keep better this week?",
    },
    "s09/5": {
        covers: [11],
        contextId: "Dua bai'at di Aqabah membuka jalan menuju Madinah. Pada bai'at kedua, kaum Anshar berjanji melindungi beliau seperti melindungi keluarga mereka sendiri.",
        contextEn: "The two pledges at Aqabah opened the way to Madinah. At the second, the Ansar promised to protect him as they protected their own families.",
        reflectId: "Kaum Anshar berjanji melindungi beliau seperti melindungi keluarganya sendiri. Janji apa yang pernah kamu ucapkan dan ingin kamu tepati dengan sungguh-sungguh?",
        reflectEn: "The Ansar promised to protect him as they would their own families. Which promise have you made that you want to truly keep?",
    },
    "s10/1": {
        covers: [1,  2,  3],
        contextId: "Periode Madinah dimulai dengan hijrah. Kaum Anshar menyambut para sahabat yang datang lebih dulu, lalu Nabi Muhammad SAW berhijrah bersama Abu Bakar RA, singgah di Quba, dan di sana berdiri masjid pertama dalam Islam.",
        contextEn: "The Madinah period begins with the emigration. The Ansar welcomed the Companions who came first, then Prophet Muhammad SAW emigrated with Abu Bakr RA, stopped at Quba, and there the first masjid in Islam was built.",
        reflectId: "Kaum Anshar membuka rumah mereka untuk saudara-saudara yang berhijrah. Siapa di sekitarmu yang sedang butuh disambut dengan hangat?",
        reflectEn: "The Ansar opened their homes to the emigrants. Who around you needs a warm welcome right now?",
    },
    "s10/2": {
        covers: [4,  5,  6],
        contextId: "Di kota barunya, yang pertama beliau bangun adalah masjid, persaudaraan antara Muhajirin dan Anshar, dan perjanjian damai dengan beberapa kabilah Yahudi.",
        contextEn: "In his new city, the first things he built were a masjid, brotherhood between the Muhajirin and the Ansar, and a peace agreement with some Jewish tribes.",
        reflectId: "Masjid dan persaudaraan dibangun lebih dulu di Madinah. Hubungan apa yang ingin kamu rawat agar orang-orang di sekitarmu saling menguatkan?",
        reflectEn: "The masjid and brotherhood came first in Madinah. Which relationships do you want to nurture so the people around you strengthen each other?",
    },
    "s10/3": {
        covers: [7,  8,  9],
        contextId: "Tahun-tahun awal Madinah membawa perubahan besar: kiblat beralih ke Ka'bah sesuai harapan beliau, lalu Perang Badar, yang menurut buku ini dimenangkan dengan doa dan pertolongan Allah.",
        contextEn: "The early Madinah years brought big changes: the qiblah turned to the Kaaba as he had hoped, then the Battle of Badr, which the book says was won through prayer and Allah's help.",
        reflectId: "Nabi Muhammad SAW sering menengadah ke langit membawa harapannya kepada Allah. Harapan apa yang ingin kamu sampaikan dalam doamu hari ini?",
        reflectEn: "Prophet Muhammad SAW often looked up to the sky with his hopes for Allah. What hope do you want to bring to Allah in your prayer today?",
    },
    "s10/4": {
        covers: [10,  11],
        contextId: "Uhud adalah ujian berat: Nabi Muhammad SAW terluka dan banyak sahabat gugur, di antaranya Hamzah RA. Buku ini menyebutnya ujian yang memisahkan orang beriman dari orang munafik, dan meski terluka, beliau tetap keluar lagi bersama para sahabat.",
        contextEn: "Uhud was a hard trial: Prophet Muhammad SAW was wounded and many Companions were martyred, among them Hamzah RA. The book calls it a test that set the believers apart from the hypocrites, and though wounded, he went out again with his Companions.",
        reflectId: "Setelah luka dan kehilangan di Uhud, beliau dan para sahabat tetap bangkit. Apa yang biasanya membantumu bangkit lagi setelah mengalami kegagalan?",
        reflectEn: "After the wounds and losses of Uhud, he and his Companions rose again. What usually helps you get back up after a setback?",
    },
    "s10/5": {
        covers: [12,  13,  14],
        contextId: "Masa yang berat bagi kaum Muslimin: para penghafal Al-Qur'an gugur di Bi'r Ma'unah, Aisyah RA difitnah sampai Allah membelanya dalam surat An-Nur, dan Madinah dikepung dalam Perang Khandaq hingga musuh pulang tanpa hasil.",
        contextEn: "A hard time for the Muslims: the Quran memorisers were killed at Bi'r Ma'unah, Aisyah RA was slandered until Allah defended her in Surah An-Nur, and Madinah was besieged in the Battle of the Trench until the enemy left with nothing.",
        reflectId: "Aisyah RA difitnah dengan tuduhan dusta, sampai Allah sendiri yang menegaskan kesuciannya. Bagaimana kamu menjaga lisan saat mendengar kabar buruk tentang orang lain?",
        reflectEn: "Aisyah RA was slandered until Allah Himself declared her innocence. How do you guard your tongue when you hear bad news about someone?",
    },
    "s10/6": {
        covers: [15,  16],
        contextId: "Di Hudaibiyah, kaum Muslimin dihalangi masuk Mekah untuk umrah, tetapi gencatan senjata yang disepakati justru disebut Al-Qur'an sebagai kemenangan yang nyata. Setahun kemudian mereka menunaikan umrah itu.",
        contextEn: "At Hudaybiyyah the Muslims were stopped from entering Makkah for umrah, yet the truce agreed there is called a clear victory in the Quran. A year later they performed that umrah.",
        reflectId: "Umrah yang tertunda di Hudaibiyah ternyata disebut kemenangan yang nyata. Adakah rencanamu yang tertunda yang mungkin menyimpan kebaikan yang belum terlihat?",
        reflectEn: "The umrah held back at Hudaybiyyah was called a clear victory. Is there a plan of yours, delayed, that may hold good you can't see yet?",
    },
    "s10/7": {
        covers: [17,  18],
        contextId: "Para sahabat yang lama berhijrah di Habasyah akhirnya bergabung, dipimpin Ja'far bin Abi Thalib RA. Lalu di Perang Mu'tah, tiga komandan yang beliau tunjuk secara berurutan gugur, dan Khalid bin Walid RA membawa pasukan pulang dengan selamat.",
        contextEn: "The Companions who had long lived in Abyssinia finally joined, led by Ja'far ibn Abi Talib RA. Then at Mu'tah the three commanders he had named in turn were martyred, and Khalid ibn al-Walid RA brought the army back safely.",
        reflectId: "Nabi Muhammad SAW menunjuk tiga komandan secara berurutan sebelum pasukan berangkat. Tanggung jawab apa yang perlu kamu siapkan agar tetap berjalan saat kamu berhalangan?",
        reflectEn: "Prophet Muhammad SAW named three commanders in turn before the army set out. Which responsibility of yours needs a plan so it carries on when you can't?",
    },
    "s10/8": {
        covers: [19],
        contextId: "Setelah Quraisy membantu penyerangan terhadap sekutu beliau, Mekah akhirnya ditaklukkan. Pada hari kemenangannya, beliau membuka banyak jalan bagi penduduknya untuk selamat, dan setelah itu banyak orang memeluk Islam.",
        contextEn: "After the Quraysh helped attack his allies, Makkah was finally conquered. On the day of his victory he opened many ways for its people to be safe, and afterwards many embraced Islam.",
        reflectId: "Pada hari kemenangannya, beliau membuka banyak jalan untuk selamat. Bagaimana kamu bersikap kepada orang yang pernah menyakitimu ketika keadaan sudah berbalik?",
        reflectEn: "On the day of his victory he opened many ways to safety. How do you treat someone who once hurt you, once the tables have turned?",
    },
    "s10/9": {
        covers: [20,  21],
        contextId: "Setelah Mekah, berhala-berhala di sekitarnya dihancurkan. Di Hunain, kaum Muslimin yang takjub dengan banyaknya jumlah mereka sempat tercerai-berai, sampai Allah meneguhkan hati mereka kembali.",
        contextEn: "After Makkah, the idols around it were destroyed. At Hunayn, the Muslims, impressed by their own numbers, were scattered for a time until Allah steadied their hearts again.",
        reflectId: "Di Hunain, jumlah yang besar sempat membuat kaum Muslimin takjub, lalu goyah. Kapan kamu pernah merasa terlalu yakin pada kekuatan sendiri, dan apa yang kamu pelajari darinya?",
        reflectEn: "At Hunayn, great numbers made the Muslims proud, then shaken. When have you been too sure of your own strength, and what did you learn?",
    },
    "s10/10": {
        covers: [22,  23],
        contextId: "Tabuk adalah perjalanan terakhir yang beliau ikuti sendiri, di musim panas yang berat. Tiga sahabat yang tertinggal tanpa uzur memilih jujur, dan Allah menerima taubat mereka.",
        contextEn: "Tabuk was the last expedition he went on himself, in a harsh summer. Three Companions who stayed behind without excuse chose honesty, and Allah accepted their repentance.",
        reflectId: "Ka'ab bin Malik RA dan dua sahabatnya memilih jujur tentang kesalahan mereka. Saat kamu keliru, apa yang membantumu untuk mengakuinya dengan jujur?",
        reflectEn: "Ka'b ibn Malik RA and his two companions chose to be honest about their mistake. When you're wrong, what helps you admit it honestly?",
    },
    "s10/11": {
        covers: [24,  25,  26,  27],
        contextId: "Kabilah-kabilah Arab berdatangan menyatakan keislaman, lalu beliau menunaikan haji wada' bersama sekitar seratus ribu orang. Di Arafah beliau berpesan agar darah, harta, dan kehormatan sesama dijaga, tidak lama sebelum beliau jatuh sakit.",
        contextEn: "Arab tribes came to declare their Islam, then he performed the Farewell Hajj with about a hundred thousand people. At Arafah he urged them to protect one another's lives, property and honour, not long before he fell ill.",
        reflectId: "Dalam khutbah perpisahannya, beliau berpesan agar darah, harta, dan kehormatan sesama dijaga. Mana di antara ketiganya yang paling perlu kamu jaga dalam pergaulanmu sekarang?",
        reflectEn: "In his farewell sermon he urged people to protect one another's lives, property and honour. Which of the three most needs your care in how you treat others now?",
    },
    "s11/1": {
        covers: [1],
        contextId: "Halaman ini merangkum peperangan dan pasukan utusan dalam sepuluh tahun setelah hijrah, dan menghubungkannya dengan surat-surat Al-Qur'an yang turun mengenainya.",
        contextEn: "This page sums up the battles and expeditions in the ten years after the emigration, and links them to the surahs of the Quran revealed about them.",
        reflectId: "Banyak surat Al-Qur'an turun berkaitan dengan peristiwa dalam kisah ini. Surat mana yang ingin kamu baca lagi setelah mengetahui latar kisahnya?",
        reflectEn: "Many surahs of the Quran came down about events in this story. Which one would you like to read again now that you know its background?",
    },
    "s12/1": {
        covers: [1,  2],
        contextId: "Inilah akhir kisah hidup Nabi Muhammad SAW. Beliau memilih perjumpaan dengan Allah, sakit di rumah Aisyah RA, masih tersenyum melihat umatnya shalat subuh, lalu wafat di waktu dhuha. Buku ini ditutup dengan kesaksian bahwa beliau telah menunaikan amanahnya.",
        contextEn: "This is the end of the life of Prophet Muhammad SAW. He chose to meet Allah, fell ill in the house of Aisyah RA, still smiled to see his people praying at dawn, and passed away later that morning. The book closes with the testimony that he fulfilled his trust.",
        reflectId: "Beliau tersenyum melihat umatnya shalat berjamaah. Setelah menyelesaikan kisah ini, teladan beliau yang mana yang ingin kamu lanjutkan?",
        reflectEn: "He smiled to see his people praying together. Having finished his story, which part of his example do you want to carry on?",
    },
};

/** The single note for a reading page. */
export function getConciseNote(page: { section: Pick<ConciseSirahSection, "id">; number: number }): ConciseNote | undefined {
    return CONCISE_NOTES[`${page.section.id}/${page.number}`];
}

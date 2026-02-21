export interface Verse {
    id: number;
    verse_key: string;
    text_uthmani: string;
    text_uthmani_tajweed?: string;
    text_indopak?: string;
    audio: {
        url: string;
    };
    translations: {
        id: number;
        resource_id: number;
        text: string;
    }[];
    transliteration?: string;
}

export interface Chapter {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
    translated_name_en?: string;
}

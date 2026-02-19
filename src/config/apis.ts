export const API_CONFIG = {
    // Quran & Kemenag Data
    QURAN_ID: {
        BASE_URL: "https://quran-api-id.vercel.app", // Host: gadingnst
    },
    QURAN_GADING: {
        BASE_URL: "https://api.quran.gading.dev"
    },
    QURAN_COM: {
        BASE_URL: "https://api.quran.com/api/v4",
    },
    AUDIO: {
        ISLAMIC_NETWORK_CDN: "https://cdn.islamic.network/quran/audio",
    },

    // Prayer Times & Location
    ALADHAN: {
        BASE_URL: "https://api.aladhan.com/v1",
    },
    LOCATION: {
        BIGDATA_CLOUD: "https://api.bigdatacloud.net/data/reverse-geocode-client",
        NOMINATIM: "https://nominatim.openstreetmap.org/reverse",
    },

    // LLM Providers
    OPENROUTER: {
        BASE_URL: "https://openrouter.ai/api/v1",
    },
} as const;

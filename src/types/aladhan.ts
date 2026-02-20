export interface AladhanTimings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird?: string;
    Lastthird?: string;
}

export interface AladhanGregorianDate {
    date: string;
    format: string;
    day: string;
    weekday: {
        en: string;
    };
    month: {
        number: number;
        en: string;
    };
    year: string;
    designation: {
        abbreviated: string;
        expanded: string;
    };
}

export interface AladhanHijriDate {
    date: string;
    format: string;
    day: string;
    weekday: {
        en: string;
        ar: string;
    };
    month: {
        number: number;
        en: string;
        ar: string;
    };
    year: string;
    designation: {
        abbreviated: string;
        expanded: string;
    };
    holidays: string[];
}

export interface AladhanDate {
    readable: string;
    timestamp: string;
    gregorian: AladhanGregorianDate;
    hijri: AladhanHijriDate;
}

export interface AladhanMeta {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
        id: number;
        name: string;
        params: {
            Fajr: number;
            Isha: number;
        };
        location: {
            latitude: number;
            longitude: number;
        };
    };
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: {
        Imsak: number;
        Fajr: number;
        Sunrise: number;
        Dhuhr: number;
        Asr: number;
        Maghrib: number;
        Sunset: number;
        Isha: number;
        Midnight: number;
    };
}

export interface AladhanDayData {
    timings: AladhanTimings;
    date: AladhanDate;
    meta?: AladhanMeta;
}

export interface AladhanCalendarResponse {
    code: number;
    status: string;
    data: AladhanDayData[];
}

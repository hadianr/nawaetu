export type Gender = 'male' | 'female' | null;
export type ValidationType = 'auto' | 'time' | 'day' | 'manual';

export interface ValidationConfig {
    requiredCount?: number;
    allowedDays?: number[];
    afterPrayer?: string;
    timeWindow?: { start: number; end: number };
}

export type IslamicRuling = 'obligatory' | 'sunnah' | 'permissible' | 'disliked' | 'forbidden';

export interface Mission {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    icon: string;
    gender: Gender;
    dalil?: string;
    type: 'daily' | 'weekly' | 'tracker';
    category: 'worship' | 'quran' | 'dhikr' | 'fasting' | 'prayer';
    ruling: IslamicRuling;
    validationType: ValidationType;
    validationConfig?: ValidationConfig;
    phase?: 'all_year' | 'ramadhan_prep' | 'ramadhan_during';
    completionOptions?: {
        label: string;
        xpReward: number;
        icon?: string;
    }[];
}

export interface QadhaPuasaData {
    totalDays: number;
    completedDays: number;
    lastUpdated: string;
}

export const DEFAULT_QADHA_DATA: QadhaPuasaData = {
    totalDays: 0,
    completedDays: 0,
    lastUpdated: new Date().toISOString()
};

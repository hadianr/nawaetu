import { DAILY_MISSION_CONTENTS } from './daily';
import { SEASONAL_MISSION_CONTENTS } from './seasonal';
export * from './types';

export const MISSION_CONTENTS = {
    ...DAILY_MISSION_CONTENTS,
    ...SEASONAL_MISSION_CONTENTS
};

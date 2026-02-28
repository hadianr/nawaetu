import { missionsID } from './missions';
import { uiID } from './ui';
import { settingsID } from './settings';
import { otherID } from './other';
import { quranID } from './quran';
import { profileID } from './profile';

export const SETTINGS_ID = {
  ...missionsID,
  ...uiID,
  ...settingsID,
  ...otherID,
  ...quranID,
  ...profileID,
};

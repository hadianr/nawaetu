import { missionsID } from './missions';
import { uiID } from './ui';
import { settingsID } from './settings';
import { otherID } from './other';
import { quranID } from './quran';
import { profileID } from './profile';
import { ramadhanID } from './ramadhan';
import { statsID } from './stats';

export const SETTINGS_ID = {
  ...missionsID,
  ...uiID,
  ...settingsID,
  ...otherID,
  ...quranID,
  ...profileID,
  ...ramadhanID,
  ...statsID,
};

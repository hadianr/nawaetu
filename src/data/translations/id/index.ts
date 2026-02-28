import { missionsID } from './missions';
import { uiID } from './ui';
import { settingsID } from './settings';
import { otherID } from './other';

export const SETTINGS_ID = {
  ...missionsID,
  ...uiID,
  ...settingsID,
  ...otherID,
};

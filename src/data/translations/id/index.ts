/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { missionsID } from './missions';
import { uiID } from './ui';
import { settingsID } from './settings';
import { otherID } from './other';
import { quranID } from './quran';
import { profileID } from './profile';
import { ramadhanID } from './ramadhan';
import { statsID } from './stats';
import { sunnahPrayerID } from './sunnah-prayer';
import { fastingTrackerID } from './fasting-tracker';

export const SETTINGS_ID = {
  ...missionsID,
  ...uiID,
  ...settingsID,
  ...otherID,
  ...quranID,
  ...profileID,
  ...ramadhanID,
  ...statsID,
  ...sunnahPrayerID,
  ...fastingTrackerID,
};

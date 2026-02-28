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

import { missionsEN } from './missions';
import { uiEN } from './ui';
import { settingsEN } from './settings';
import { otherEN } from './other';
import { quranEN } from './quran';
import { profileEN } from './profile';
import { ramadhanEN } from './ramadhan';
import { statsEN } from './stats';
import { sunnahPrayerEN } from './sunnah-prayer';

export const SETTINGS_EN = {
  ...missionsEN,
  ...uiEN,
  ...settingsEN,
  ...otherEN,
  ...quranEN,
  ...profileEN,
  ...ramadhanEN,
  ...statsEN,
  ...sunnahPrayerEN,
};
